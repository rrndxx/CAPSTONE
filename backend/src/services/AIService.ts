import { PrismaClient, AlertSeverity, AlertType, type Device } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const THRESHOLD_MULTIPLIER = 3;

interface BandwidthPredictionsMap {
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

/** ================== Core AI Functions ================== **/

export async function detectBandwidthAnomalies() {
    const devices = await prisma.device.findMany({
        include: { bandwidthUsage: true, interface: true },
    });

    const alertsToCreate: {
        alertType: AlertType;
        message: string;
        severity: AlertSeverity;
        interfaceId: number;
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

        // if (latestUpload > meanUpload + THRESHOLD_MULTIPLIER * stdUpload) {
        //     alertsToCreate.push({
        //         alertType: AlertType.BANDWIDTH_RELATED,
        //         message: `High upload detected for device ${mac}: ${latestUpload} bytes`,
        //         severity: AlertSeverity.CRITICAL,
        //         interfaceId: device.interfaceId ?? 0,
        //     });
        // }

        // if (latestDownload > meanDownload + THRESHOLD_MULTIPLIER * stdDownload) {
        //     alertsToCreate.push({
        //         alertType: AlertType.BANDWIDTH_RELATED,
        //         message: `High download detected for device ${mac}: ${latestDownload} bytes`,
        //         severity: AlertSeverity.CRITICAL,
        //         interfaceId: device.interfaceId ?? 0,
        //     });
        // }
    }

    if (alertsToCreate.length > 0) {
        await prisma.alert.createMany({ data: alertsToCreate });
        console.log(`✅ Created ${alertsToCreate.length} bandwidth anomaly alerts.`);
    } else {
        console.log("✅ No anomalies detected.");
    }
}

export async function predictBandwidthFuture(deviceId: number, intervalMinutes = 1, totalMinutes = 20) {
    const device = await prisma.device.findUnique({
        where: { deviceId },
        include: { bandwidthUsage: true },
    });

    const history: { t: number; value: number }[] =
        device?.bandwidthUsage
            ?.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .map(b => ({ t: b.timestamp.getTime(), value: Number(b.upload) + Number(b.download) })) ?? [];

    if (history.length < 2) return [];

    const lastN = history.slice(-5);
    const weightedSum = lastN.reduce((sum, val, idx) => sum + val.value * Math.pow(0.7, lastN.length - idx - 1), 0);
    const weightTotal = lastN.reduce((sum, _, idx) => sum + Math.pow(0.7, lastN.length - idx - 1), 0);
    const slope = weightedSum / weightTotal;

    const lastTimestamp = history[history.length - 1].t;
    const lastValue = history[history.length - 1].value;

    return Array.from({ length: totalMinutes / intervalMinutes }, (_, i) => {
        const futureTime = new Date(lastTimestamp + (i + 1) * intervalMinutes * 60 * 1000);
        return { timestamp: futureTime, predicted: Math.max(0, lastValue + slope * (i + 1)) };
    });
}

export async function runAIAnalysis(): Promise<BandwidthPredictionsMap> {
    await detectBandwidthAnomalies();

    const devices = await prisma.device.findMany();
    const allPredictions: BandwidthPredictionsMap = {};

    await Promise.all(
        devices.map(async device => {
            const mac = device.deviceMac;
            if (!mac) return;
            allPredictions[mac] = await predictBandwidthFuture(device.deviceId, 1, 20);
        })
    );

    await savePredictions(allPredictions, devices);
    return allPredictions;
}

async function savePredictions(predictions: BandwidthPredictionsMap, devices: Device[]) {
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

export async function computeTrafficStats(): Promise<TrafficStats> {
    const devices = await prisma.device.findMany({
        include: { bandwidthUsage: true, bandwidthPredictions: true }, // corrected plural
    });

    const trafficByHour: Record<number, number> = {};
    let totalBandwidth = 0;

    for (const device of devices) {
        device.bandwidthUsage?.forEach(b => {
            const hour = b.timestamp.getHours();
            const usage = Number(b.upload) + Number(b.download);
            trafficByHour[hour] = (trafficByHour[hour] ?? 0) + usage;
            totalBandwidth += usage;
        });

        device.bandwidthPredictions?.forEach(p => {
            const hour = p.timestamp.getHours();
            const usage = Number(p.predicted);
            trafficByHour[hour] = (trafficByHour[hour] ?? 0) + usage;
            totalBandwidth += usage;
        });
    }

    const peakHour = Number(
        Object.entries(trafficByHour).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            [0, 0] as unknown as [string, number]
        )[0]
    );

    return { trafficByHour, peakHour, totalBandwidth };
}

export async function getTotalExpectedBandwidth(): Promise<number> {
    const devices = await prisma.device.findMany({
        include: { bandwidthUsage: true, bandwidthPredictions: true },
    });

    let total = 0;
    for (const device of devices) {
        device.bandwidthUsage?.forEach(b => (total += Number(b.upload) + Number(b.download)));
        device.bandwidthPredictions?.forEach(p => (total += Number(p.predicted)));
    }

    return total;
}


