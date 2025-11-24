import { PrismaClient, AlertSeverity, AlertType } from "@prisma/client";

const prisma = new PrismaClient();

// Threshold multiplier for anomaly detection
const THRESHOLD_MULTIPLIER = 3;

interface BandwidthPredictions {
    [deviceMac: string]: number | null;
}

/**
 * Detect abnormal bandwidth usage per device.
 * Creates alerts in DB if anomalies are found.
 */
export async function detectBandwidthAnomalies() {
    const devices = await prisma.device.findMany({
        include: { bandwidthHourly: true, interface: true },
    });

    const alertsToCreate: {
        alertType: AlertType;
        message: string;
        severity: AlertSeverity;
        interfaceId: number;
    }[] = [];

    for (const device of devices) {
        const uploads = device.bandwidthHourly?.map(b => Number(b.upload)) ?? [];
        const downloads = device.bandwidthHourly?.map(b => Number(b.download)) ?? [];

        if (uploads.length < 2 || downloads.length < 2) continue;

        const meanUpload = uploads.reduce((a, b) => a + b, 0) / uploads.length;
        const meanDownload = downloads.reduce((a, b) => a + b, 0) / downloads.length;

        const stdUpload = Math.sqrt(
            uploads.map(x => Math.pow(x - meanUpload, 2)).reduce((a, b) => a + b, 0) / uploads.length
        );
        const stdDownload = Math.sqrt(
            downloads.map(x => Math.pow(x - meanDownload, 2)).reduce((a, b) => a + b, 0) / downloads.length
        );

        const latestUpload = uploads[uploads.length - 1] ?? 0;
        const latestDownload = downloads[downloads.length - 1] ?? 0;

        const mac = device.deviceMac ?? "unknown";

        // Detect upload anomaly
        if (latestUpload > meanUpload + THRESHOLD_MULTIPLIER * stdUpload) {
            alertsToCreate.push({
                alertType: AlertType.BANDWIDTH_RELATED,
                message: `High upload detected for device ${mac}: ${latestUpload} bytes`,
                severity: AlertSeverity.CRITICAL,
                interfaceId: device.interfaceId,
            });
        }

        // Detect download anomaly
        if (latestDownload > meanDownload + THRESHOLD_MULTIPLIER * stdDownload) {
            alertsToCreate.push({
                alertType: AlertType.BANDWIDTH_RELATED,
                message: `High download detected for device ${mac}: ${latestDownload} bytes`,
                severity: AlertSeverity.CRITICAL,
                interfaceId: device.interfaceId,
            });
        }
    }

    if (alertsToCreate.length > 0) {
        await prisma.alert.createMany({ data: alertsToCreate });
        console.log(`✅ Created ${alertsToCreate.length} bandwidth anomaly alerts.`);
    } else {
        console.log("✅ No anomalies detected.");
    }
}

/**
 * Predict next hour bandwidth usage using simple linear trend.
 */
export async function predictBandwidth(deviceId: number): Promise<number | null> {
    const device = await prisma.device.findUnique({
        where: { deviceId },
        include: { bandwidthHourly: true },
    });

    const bandwidths = device?.bandwidthHourly
        ?.sort((a, b) => a.hour.getTime() - b.hour.getTime())
        .map(b => Number(b.upload + b.download)) ?? [];

    if (bandwidths.length < 2) return null;

    const n = bandwidths.length;
    const slope = (bandwidths[n - 1]! - bandwidths[0]!) / (n - 1);
    const predictedNext = Math.max(0, bandwidths[n - 1]! + slope);

    return predictedNext;
}

/**
 * Run the full AI analysis:
 * 1. Detect anomalies
 * 2. Return predictions for all devices
 */
export async function runAIAnalysis(): Promise<BandwidthPredictions> {
    await detectBandwidthAnomalies();

    const devices = await prisma.device.findMany();
    const predictions: BandwidthPredictions = {};

    for (const device of devices) {
        const mac = device.deviceMac;
        if (!mac) continue; // Skip if MAC is undefined

        const prediction = await predictBandwidth(device.deviceId);
        predictions[mac] = prediction ?? null;
    }

    await savePredictions(predictions);

    return predictions;
}

async function savePredictions(predictions: { [mac: string]: number | null }) {
    for (const [mac, predicted] of Object.entries(predictions)) {
        if (predicted === null) continue;

        // Use findFirst if deviceMac is not unique
        const device = await prisma.device.findFirst({ where: { deviceMac: mac } });
        if (!device) continue;

        await prisma.bandwidthPrediction.create({
            data: {
                deviceId: device.deviceId,
                predicted: BigInt(Math.round(predicted)), // store as BigInt
            },
        });
    }
}
