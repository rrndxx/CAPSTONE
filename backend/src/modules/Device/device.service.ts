import type { Device, Port } from "@prisma/client";
import type { ICacheService } from "../../services/cacheService.js";
import type { OPNsenseService } from "../../services/OPNsenseService.js";
import type { IDeviceRepository } from "./device.repository.js";
import { networkScanner } from "../../server.js";

export interface IDeviceService {
    getDevicesFromCache(interfaceId: Device["interfaceId"]): Promise<Device[] | null>
    setDevicesToCache(devices: Device[], interfaceId: Device["interfaceId"]): Promise<void>
    getAllDevices(interfaceId: Device["interfaceId"]): Promise<Device[]>
    getDeviceByMAC(mac: Device["deviceMac"], interfaceId: Device["interfaceId"]): Promise<Device>
    upsertDevice(device: Partial<Device>, interfaceId: Device["interfaceId"]): Promise<Device>
    upsertDevices(devices: Partial<Device>[], interfaceId: Device["interfaceId"]): Promise<Device[]>
    scanAndUpsertDeviceOpenPorts(device: Partial<Device>): Promise<Port[]>
    detectAndUpsertDeviceOS(device: Partial<Device>): Promise<string>
}

export class DeviceService implements IDeviceService {
    constructor(
        private readonly deviceRepo: IDeviceRepository,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService,
    ) { }

    async getDevicesFromCache(interfaceId: Device["interfaceId"]): Promise<Device[] | null> {
        return this.cacheService.get<Device[]>(`devices:${interfaceId}`);
    }

    async setDevicesToCache(devices: Device[], interfaceId: Device["interfaceId"]): Promise<void> {
        await this.cacheService.set(`devices:${interfaceId}`, devices, 60);
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

        const results = await Promise.all(devices.map(d => this.deviceRepo.upsertDevice(d, interfaceId)));

        await this.setDevicesToCache(results, interfaceId);

        return results;
    }

    async scanAndUpsertDeviceOpenPorts(device: Partial<Device>): Promise<Port[]> {
        if (!device.deviceId || !device.deviceIp) throw new Error("deviceId and deviceIp are required.");

        const scannedPorts = await networkScanner.scanOpenPorts(device.deviceIp, device.deviceId);

        const results: Port[] = [];

        for (const port of scannedPorts) {
            const existing = await this.deviceRepo.getPortByNumber(port.deviceId, port.portNumber);
            results.push(await this.deviceRepo.upsertPort(port, !!existing));
        }

        return results;
    }

    async detectAndUpsertDeviceOS(device: Partial<Device>): Promise<string> {
        if (!device.deviceId || !device.deviceIp) throw new Error("deviceId and deviceIp are required.");

        try {
            const osName = await networkScanner.identifyDeviceOS(device.deviceIp);

            await this.deviceRepo.updateDeviceOS(device.deviceId, osName);

            return osName;
        } catch {
            return "Unknown OS";
        }
    }

    async getDevicesFromDHCPLease(): Promise<Partial<Device>[]> {
        return this.opnSenseService.getDevicesFromDHCPLease();
    }

    async blockDevice(device: Device, interfaceId: Device['interfaceId']): Promise<any> {

        // implementanan ug logic nga mukuha sa "OPT1" knowing nga int ang interfaceId; ipasa sa sunod na line

        const result = await this.opnSenseService.blockDevice(device)
        // await this.deviceRepo.addDeviceToBlacklist(device.deviceMac, interfaceId)

        return result
    }

    async unblockDevice(device: Device, interfaceId: Device['interfaceId']): Promise<any> {
        const result = await this.opnSenseService.unblockDevice(device)
        await this.deviceRepo.removeDeviceFromBlacklist(device.deviceMac, interfaceId)

        return result
    }
}
