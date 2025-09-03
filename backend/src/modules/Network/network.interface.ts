export interface INetworkRepository {
    getWiredDevices(): Promise<any>
    getWirelessDevices(): Promise<any>
    getSystemHealthInfo(): Promise<any>
    getNetworkInterfaceInfo(): Promise<any>
    blockDevice(): void
    limitDeviceBandwidth(): void
}