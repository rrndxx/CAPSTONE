import type { Device } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

export interface IBandwidthRepository {
    perDevice()
    perDeviceTotal()
}

export class BandwidthRepository implements IBandwidthRepository {
    constructor(private db: PrismaClient) { }

    async perDevice() {
        const devices = await this.db.device.findMany({
            include: {
                bandwidthUsage: {
                    orderBy: { timestamp: "desc" },
                    take: 10,
                },
            },
        });

        // Convert BigInt to string for JSON serialization
        return devices.map((d) => ({
            deviceId: d.deviceId,
            deviceMac: d.deviceMac,
            deviceIp: d.deviceIp,
            last10BandwidthUsage: d.bandwidthUsage.map((b) => ({
                upload: b.upload.toString(),
                download: b.download.toString(),
                timestamp: b.timestamp,
            })),
        }));
    }

    // Total bandwidth per device
    // bandwidth.repository.ts
    async perDeviceTotal() {
        const devices = await this.db.device.findMany({
            include: {
                bandwidthDaily: true,  // use correct case from Prisma schema
                bandwidthUsage: true,  // optional if you also want last 10 samples
            },
        });

        // Sum totals per device
        return devices.map((d) => {
            const uploadTotal = d.bandwidthDaily?.reduce((acc, b) => acc + Number(b.upload), 0) ?? 0;
            const downloadTotal = d.bandwidthDaily?.reduce((acc, b) => acc + Number(b.download), 0) ?? 0;

            return {
                deviceId: d.deviceId,
                deviceMac: d.deviceMac,
                deviceIp: d.deviceIp,
                uploadTotal,
                downloadTotal,
                total: uploadTotal + downloadTotal,
            };
        });
    }

}