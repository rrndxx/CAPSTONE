import type { Device } from "@prisma/client"

export interface IBandwidthRepository {
    getOverallNetworkBandwidthUsage(): Promise<any>
    getDeviceBandwidthUsage(mac: Device["mac"]): Promise<any>
    limitDeviceBandwidth(mac: Device["mac"]): Promise<any>
}