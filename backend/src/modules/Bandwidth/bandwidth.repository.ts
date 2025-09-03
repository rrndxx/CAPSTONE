import type { Device } from "@prisma/client";
import type { IBandwidthRepository } from "./bandwidth.interface.js";
import type { PrismaClient } from "@prisma/client/extension";

export class BandwidthRepository implements IBandwidthRepository {
    constructor(
        private db: PrismaClient
    ) { }
    getOverallNetworkBandwidthUsage() {
        throw new Error("Method not implemented.");
    }
    getDeviceBandwidthUsage(mac: Device["mac"]) {
        throw new Error("Method not implemented.");
    }
    limitDeviceBandwidth(mac: Device["mac"]) {
        throw new Error("Method not implemented.");
    }
}