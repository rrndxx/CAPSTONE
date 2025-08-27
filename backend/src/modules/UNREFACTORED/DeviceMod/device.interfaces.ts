import type { DeviceList } from "@prisma/client";
import type { DeviceModel, NetworkScan } from "./device.model.js";

export interface IDeviceRepository {
    findAllDevices(): Promise<DeviceModel[]>
    findByMAC(mac: DeviceModel["mac"]): Promise<DeviceModel | null>
    upsertNetwork(networkId: NetworkScan["networkId"]): Promise<any>
    upsertDevice(): Promise<DeviceModel[]>
    upsertDeviceList(deviceId: DeviceList): Promise<DeviceList>
}