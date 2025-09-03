import type { Device, Network } from "@prisma/client";
import type { IDeviceRepository } from "./device.interface.js";
import type { ICacheService } from "../../services/cacheService.js";

export class DeviceService {
    constructor(
        private readonly deviceRepo: IDeviceRepository,
        private readonly cacheService: ICacheService
    ) { }

    async getDevicesFromCache() {
        const devices = await this.cacheService.get<Device[]>("devices:all")

        if (!devices) throw new Error("no devices from redis cache fetched.")

        return devices
    }

    async setDevicesToCache(devices: Device[]) {
        const result = await this.cacheService.set("devices:all", devices, 60)

        return result
    }

    async getAllDevices() {
        const devices = await this.getDevicesFromCache()

        if (!devices) throw new Error("no devices from db fetched.")

        await this.setDevicesToCache(devices)

        return devices
    }

    async getDeviceByMAC(mac: Device["mac"]) {
        const device = await this.deviceRepo.getDeviceByMAC(mac)

        if (!device) throw new Error(`no device with mac: ${mac} found.`)

        return device
    }

    async upsertDevice(device: Device, networkId: Network['networkId']) {
        if (!device || !device.mac || !device.ip) throw new Error("Device, MAC, and IP are required.")

        const result = await this.deviceRepo.upsertDevice(device, networkId)

        return this.deviceRepo.upsertDevice(device, networkId)
    }

    async upsertDevices(devices: Device[]) {
        throw new Error('not implemented yet')
    }
}