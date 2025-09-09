import type { Device } from "@prisma/client";
import type { ICacheService } from "../../services/cacheService.js";
import type { OPNsenseService } from "../../services/OPNsenseService.js";
import type { IDeviceRepository } from "./device.repository.js";

export class DeviceService {
    constructor(
        private readonly deviceRepo: IDeviceRepository,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService
    ) { }

    async getDevicesFromCache(interfaceId: Device["interfaceId"]): Promise<Device[] | null> {
        return this.cacheService.get<Device[]>(`devices:${interfaceId}`);
    }

    async setDevicesToCache(devices: Device[], interfaceId: Device["interfaceId"]): Promise<void> {
        await this.cacheService.set(`devices:${interfaceId}`, devices, 60);
    }

    async getDevicesFromDHCPLease(): Promise<Partial<Device>[]> {
        return this.opnSenseService.getDevicesFromDHCPLease();
    }

    async getAllDevices(interfaceId: Device["interfaceId"]): Promise<Device[]> {
        const cachedDevices = await this.getDevicesFromCache(interfaceId);
        if (cachedDevices) return cachedDevices;

        const devicesFromDB = await this.deviceRepo.getAllDevices(interfaceId);
        await this.setDevicesToCache(devicesFromDB, interfaceId);

        return devicesFromDB;
    }

    async getDeviceByMAC(mac: Device["deviceMac"], interfaceId: Device["interfaceId"]): Promise<Device> {
        const device = await this.deviceRepo.getDeviceByMAC(mac, interfaceId);
        if (!device) throw new Error(`No device with MAC: ${mac} found on interface ${interfaceId}.`);
        return device;
    }

    async upsertDevice(device: Partial<Device>, interfaceId: Device["interfaceId"]): Promise<Device> {
        if (!device.deviceMac || !device.deviceIp) {
            throw new Error("deviceMac and deviceIp are required to upsert a device.");
        }

        const result = await this.deviceRepo.upsertDevice(device, interfaceId);

        const cachedDevices = await this.getDevicesFromCache(interfaceId) ?? [];
        const updatedDevices = [
            ...cachedDevices.filter(d => d.deviceMac !== result.deviceMac),
            result,
        ];
        await this.setDevicesToCache(updatedDevices, interfaceId);

        return result;
    }

    async upsertDevices(devices: Partial<Device>[], interfaceId: Device["interfaceId"]): Promise<Device[]> {
        if (!devices.length) return [];

        const results = await Promise.all(devices.map(device => this.deviceRepo.upsertDevice(device, interfaceId)));

        await this.setDevicesToCache(results, interfaceId);

        return results;
    }
}
