import type { Device } from "@prisma/client";
import type { IBandwidthRepository } from "./bandwidth.repository.js";

export class BandwidthService {
    constructor(
        private readonly bandwidthRepo: IBandwidthRepository
    ) { }

    async getOverallNetworkBandwidthUsage() {
        const overallNetworkBandwidth = await this.bandwidthRepo.getOverallNetworkBandwidthUsage()
        if (!overallNetworkBandwidth) throw new Error("No overall network bandwidth from DB")

        return overallNetworkBandwidth
    }

    async getDeviceBandwidthUsage(mac: Device["deviceMac"]) {
        const deviceBandwidthUsage = await this.bandwidthRepo.getDeviceBandwidthUsage(mac)
        if (!deviceBandwidthUsage) throw new Error("No bandwidth usage of this device from db")

        return deviceBandwidthUsage
    }

    async limitDeviceBandwidth(mac: Device["deviceMac"]) {
        const result = await this.bandwidthRepo.limitDeviceBandwidth(mac)
        if (!result) throw new Error("Error limiting this device's bandwidth to the db")

        return result
    }
}