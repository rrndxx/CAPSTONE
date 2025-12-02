import { PrismaClient, AlertSeverity, AlertType } from "@prisma/client";

const prisma = new PrismaClient();

// Threshold multiplier for anomaly detection
const THRESHOLD_MULTIPLIER = 3;

interface BandwidthPredictions {
    [deviceMac: string]: { timestamp: Date; predicted: number }[];
}

interface TrafficStats {
    trafficByHour: Record<number, number>;
    peakHour: number;
    totalBandwidth: number;
}

/** Utility functions */
function calculateMean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
}

function calculateStd(arr: number[], mean: number): number {
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (arr.length || 1));
}

/**
 * Detect abnormal bandwidth usage per device.
 */
export async function detectBandwidthAnomalies() {
    const devices = await prisma.device.findMany({
        include: { bandwidthUsage: true, interface: true },
    });

    const alertsToCreate: {
        alertType: AlertType;
        message: string;
        severity: AlertSeverity;
        interfaceId: number;
        createdAt: Date;
    }[] = [];

    for (const device of devices) {
        const uploads = device.bandwidthUsage?.map(b => Number(b.upload)) ?? [];
        const downloads = device.bandwidthUsage?.map(b => Number(b.download)) ?? [];

        if (uploads.length < 2 && downloads.length < 2) continue;

        const meanUpload = calculateMean(uploads);
        const meanDownload = calculateMean(downloads);
        const stdUpload = calculateStd(uploads, meanUpload);
        const stdDownload = calculateStd(downloads, meanDownload);

        const latestUpload = uploads[uploads.length - 1] ?? 0;
        const latestDownload = downloads[downloads.length - 1] ?? 0;

        const mac = device.deviceMac ?? "unknown";

        if (latestUpload > meanUpload + THRESHOLD_MULTIPLIER * stdUpload) {
            alertsToCreate.push({
                alertType: AlertType.BANDWIDTH_RELATED,
                message: `High upload detected for device ${mac}: ${latestUpload} bytes`,
                severity: AlertSeverity.CRITICAL,
                interfaceId: device.interfaceId ?? 0,
                createdAt: new Date(),
            });
        }

        if (latestDownload > meanDownload + THRESHOLD_MULTIPLIER * stdDownload) {
            alertsToCreate.push({
                alertType: AlertType.BANDWIDTH_RELATED,
                message: `High download detected for device ${mac}: ${latestDownload} bytes`,
                severity: AlertSeverity.CRITICAL,
                interfaceId: device.interfaceId ?? 0,
                createdAt: new Date(),
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
 * Predict next N minutes bandwidth for a device using a weighted recent slope.
 */
export async function predictBandwidthFuture(
    deviceId: number,
    intervalMinutes = 1,
    totalMinutes = 20
): Promise<{ timestamp: Date; predicted: number }[]> {
    const device = await prisma.device.findUnique({
        where: { deviceId },
        include: { bandwidthUsage: true },
    });

    const history = device?.bandwidthUsage
        ?.filter((b): b is { timestamp: Date; upload: number; download: number } => !!b)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .map(b => ({ t: b.timestamp.getTime(), value: Number(b.upload) + Number(b.download) })) ?? [];

    if (history.length < 2) return [];

    const lastN = history.slice(-5); // last 5 points
    const slope = lastN.reduce((sum, val, idx) => sum + val.value * (idx + 1), 0) / ((lastN.length * (lastN.length + 1)) / 2);

    const lastTimestamp = history[history.length - 1].t;
    const lastValue = history[history.length - 1].value;

    return Array.from({ length: totalMinutes / intervalMinutes }, (_, i) => {
        const futureTime = new Date(lastTimestamp + (i + 1) * intervalMinutes * 60 * 1000);
        const predictedValue = Math.max(0, lastValue + slope * (i + 1));
        return { timestamp: futureTime, predicted: predictedValue };
    });
}

/**
 * Run AI analysis:
 * - Detect anomalies
 * - Generate future predictions for all devices
 */
export async function runAIAnalysis(): Promise<BandwidthPredictions> {
    await detectBandwidthAnomalies();

    const devices = await prisma.device.findMany();
    const allPredictions: BandwidthPredictions = {};

    await Promise.all(devices.map(async device => {
        const mac = device.deviceMac;
        if (!mac) return;
        allPredictions[mac] = await predictBandwidthFuture(device.deviceId, 1, 20);
    }));

    await savePredictions(allPredictions, devices);

    return allPredictions;
}

/**
 * Save predictions into the database (batch insert)
 */
async function savePredictions(predictions: BandwidthPredictions, devices: typeof prisma.device[]): Promise<void> {
    const devicesMap = new Map(devices.map(d => [d.deviceMac, d]));

    const allDataToInsert: { deviceId: number; predicted: bigint; timestamp: Date }[] = [];

    for (const [mac, futurePredictions] of Object.entries(predictions)) {
        const device = devicesMap.get(mac);
        if (!device) continue;

        futurePredictions.forEach(p => {
            allDataToInsert.push({
                deviceId: device.deviceId,
                predicted: BigInt(Math.round(p.predicted)),
                timestamp: p.timestamp,
            });
        });
    }

    if (allDataToInsert.length > 0) {
        await prisma.bandwidthPrediction.createMany({ data: allDataToInsert });
    }
}

/**
 * Compute peak and traffic hours based on historical data.
 */
export async function computeTrafficStats(): Promise<TrafficStats> {
    const devices = await prisma.device.findMany({
        include: { bandwidthUsage: true },
    });

    const trafficByHour: Record<number, number> = {}; // 0-23
    let totalBandwidth = 0;

    for (const device of devices) {
        device.bandwidthUsage?.forEach(b => {
            if (!b) return;
            const hour = b.timestamp.getHours();
            const usage = Number(b.upload) + Number(b.download);
            trafficByHour[hour] = (trafficByHour[hour] ?? 0) + usage;
            totalBandwidth += usage;
        });
    }

    const peakHour = Number(Object.entries(trafficByHour).reduce((a, b) => (b[1] > a[1] ? b : a), [0, 0])[0]);

    return { trafficByHour, peakHour, totalBandwidth };
}
