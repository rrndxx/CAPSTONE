export interface IBandwidthRepository {
    getOverallNetworkBandwidth(): Promise<any>
    getDeviceBandwidth(): Promise<any>
    setBandwidthLimit(): Promise<any>
    removeBandwidthLimit(): Promise<any>
    getTopBandwidthUser(): Promise<any>
}