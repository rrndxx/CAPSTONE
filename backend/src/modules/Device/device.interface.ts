import type { Device, Network } from "@prisma/client";

export interface IDeviceRepository {
    getAllDevices(): Promise<Device[]>
    getDeviceByMAC(mac: Device['mac']): Promise<Device | null>
    upsertDevice(device: Device, networkId: Network['networkId']): Promise<Device>
}