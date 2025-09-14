import type { Device } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

export interface IBandwidthRepository {
    getOverallNetworkBandwidthUsage(): Promise<any>
    getDeviceBandwidthUsage(mac: Device["deviceMac"]): Promise<any>
    limitDeviceBandwidth(mac: Device["deviceMac"]): Promise<any>
}

export class BandwidthRepository implements IBandwidthRepository {
    constructor(
        private db: PrismaClient
    ) { }

    getOverallNetworkBandwidthUsage(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    getDeviceBandwidthUsage(mac: Device['deviceMac']): Promise<any> {
        throw new Error("Method not implemented.");
    }

    limitDeviceBandwidth(mac: Device['deviceMac']): Promise<any> {
        throw new Error("Method not implemented.");
    }
}