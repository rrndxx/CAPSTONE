import type { Device, DeviceList, Network } from "@prisma/client";

export interface IDeviceRepository {
    findAllDevices(): Promise<(Device & { DeviceList: DeviceList[], network: Network | null })[]>
    findByMAC(mac: Device["mac"]): Promise<(Device & { DeviceList: DeviceList[], network: Network | null }) | null>
    insertDevice(device: Device, networkId: Network["networkId"]): Promise<Device & { network: Network | null; DeviceList: DeviceList[] }>
    upsertNetwork(networkId: Network["networkId"]): Promise<Network>
    upsertDevice(device: Device, networkId: Network["networkId"]): Promise<Device & { network: Network | null; DeviceList: DeviceList[] }>
    upsertDevices(devices: Device[], networkId: Network["networkId"]): Promise<(Device & { network: Network | null; DeviceList: DeviceList[] })[]>
    upsertDeviceList(deviceId: DeviceList["deviceId"], type: DeviceList["type"]): Promise<DeviceList>
}
