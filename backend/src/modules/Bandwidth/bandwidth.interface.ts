import type { Device } from "@prisma/client"

export interface IBandwidthRepository {
    getOverallNetworkBandwidthUsage()
    getDeviceBandwidthUsage(mac: Device["mac"])
    limitDeviceBandwidth(mac: Device["mac"])
}