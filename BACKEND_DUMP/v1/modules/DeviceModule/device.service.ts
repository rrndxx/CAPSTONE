import type { Device, DeviceList, Network } from "@prisma/client";
import type { ICacheService } from "../../services/cacheService.js";
import type { IDeviceRepository } from "./device.interface.js";

export class DeviceService {
    constructor(
        private readonly deviceRepo: IDeviceRepository,
        private readonly cache: ICacheService,
        // private readonly networkScanner: NetworkScanner,
        // private readonly portScanner: OpenPortScanner
    ) { }

    async getAllDevices() {
        const cachedDevices = await this.cache.get<Device[]>("devices:all")
        if (cachedDevices) return cachedDevices

        const devices = await this.deviceRepo.findAllDevices()
        await this.cache.set<Device[]>("devices:all", devices, 60)

        return devices
    }

    async getDeviceByMAC(mac: Device["mac"]) {
        const device = await this.deviceRepo.findByMAC(mac)

        return device
    }

    async insertDevice(device: Device, networkId: Network["networkId"]) {
        const result = await this.deviceRepo.insertDevice(device, networkId)

        return result
    }

    async updateDeviceListType(deviceId: DeviceList["deviceId"], type: DeviceList["type"]) {
        const result = await this.deviceRepo.upsertDeviceList(deviceId, type)
        if (!result) throw new Error("Error updating device privilege type")

        return result
    }

    async getDeviceOpenPorts(deviceIP: Device["ip"]) {
        throw new Error("wa pa naimplement na method")
    }
}
