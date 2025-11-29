import type { Device, Port } from "@prisma/client";
import type { ICacheService } from "../../services/cacheService.js";
import type { OPNsenseService } from "../../services/OPNsenseService.js";
import type { IDeviceRepository } from "./device.repository.js";
import { networkScanner } from "../../server.js";

export interface IDeviceService {
    getAllDevicesFromDB(interfaceId: Device['interfaceId']): Promise<Device[] | null>
    getDevicesFromCache(interfaceId: Device["interfaceId"]): Promise<Device[] | null>
    setDevicesToCache(devices: Device[], interfaceId: Device["interfaceId"]): Promise<void>
    getAllDevices(interfaceId: Device["interfaceId"]): Promise<Device[]>
    getDeviceByMAC(mac: Device["deviceMac"], interfaceId: Device["interfaceId"]): Promise<Device>
    upsertDevice(device: Partial<Device>, interfaceId: Device["interfaceId"]): Promise<Device>
    upsertDevices(devices: Partial<Device>[], interfaceId: Device["interfaceId"]): Promise<Device[]>
    scanAndUpsertDeviceOpenPorts(device: Partial<Device>): Promise<Port[]>
    detectDeviceOS(device: Partial<Device>): Promise<string>
    updateDeviceStatus(deviceId: Device['deviceId'], status: Device['status']): Promise<any>
    getAllWhitelistedDevices(): Promise<any>
    upsertDevicePort(deviceId: Device["deviceId"], ports: any | any[]): any
}

export class DeviceService implements IDeviceService {
    constructor(
        private readonly deviceRepo: IDeviceRepository,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService,
    ) { }

    async getAllWhitelistedDevices() {
        return this.deviceRepo.getAllWhitelistedDevices()
    }

    async addDeviceToWhitelist(deviceMac: Device['deviceMac'], interfaceid: Device['interfaceId']) {
        return this.deviceRepo.addDeviceToWhitelist(deviceMac, interfaceid)
    }

    async updateDeviceStatus(deviceId: Device['deviceId'], status: Device['status']) {
        const result = await this.deviceRepo.updateDeviceStatus(deviceId, status)

        return result
    }

    async getAllDevicesFromDB(interfaceId: Device['interfaceId']): Promise<Device[] | null> {
        const devices = await this.deviceRepo.getAllDevices(interfaceId)

        return devices
    }

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

        let originalDevice: Device | null = null;

        try {
            originalDevice = await this.getDeviceByMAC(device.deviceMac, interfaceId);
        } catch (err) {
            originalDevice = null;
        }

        let detectedOS: string | null = originalDevice?.deviceOS ?? null;

        if (!detectedOS || detectedOS === "Unknown OS") {
            try {
                detectedOS = await this.detectDeviceOS(originalDevice ?? device);
            } catch {
                detectedOS = "Unknown OS";
            }
        }

        const deviceWithOS: Partial<Device> = {
            ...device,
            deviceOS: detectedOS
        };

        const result = await this.deviceRepo.upsertDevice(deviceWithOS, interfaceId);

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

    async upsertDevicePort(deviceId: number, ports: any | any[]): Promise<any> {
        const portList = Array.isArray(ports) ? ports : [ports];
        const results = [];

        for (const port of portList) {
            const existing = await this.deviceRepo.getPortByNumber(
                deviceId,
                port.portNumber
            );

            const portData = {
                deviceId,
                portNumber: port.portNumber,
                status: port.status,
                protocol: port.protocol ?? "tcp",
                firstSeen: port.firstSeen ?? new Date(),
                lastSeen: new Date(),
            };

            results.push(await this.deviceRepo.upsertPort(portData, !!existing));
        }

        return results;
    }

    async detectDeviceOS(device: Partial<Device>): Promise<string> {
        if (!device.deviceIp) throw new Error("deviceId and deviceIp are required.");

        try {
            const osName = await networkScanner.identifyDeviceOS(device.deviceIp);

            return osName;
        } catch {
            return "Unknown OS";
        }
    }

    async getDevicesFromDHCPLease(): Promise<Partial<Device>[]> {
        return this.opnSenseService.getDevicesFromDHCPLease();
    }

    async blockDevice(device: Device, interfaceId: Device['interfaceId']): Promise<any> {
        const result = await this.opnSenseService.blockDevice(device)
        await this.deviceRepo.addDeviceToBlacklist(device.deviceMac, interfaceId)

        console.log(`service: ${device} ${interfaceId}`)
        console.log(`service: ${result}`)

        return result
    }

    async unblockDevice(device: Device, interfaceId: Device['interfaceId']): Promise<any> {
        const result = await this.opnSenseService.unblockDevice(device)
        await this.deviceRepo.removeDeviceFromBlacklist(device.deviceMac, interfaceId)

        return result
    }

    async removeDeviceFromWhitelist(deviceMac: Device['deviceMac'], interfaceId: Device["interfaceId"]) {
        if (!deviceMac || !interfaceId) {
            throw new Error("deviceMac and interfaceId are required");
        }

        return this.deviceRepo.removeDeviceFromWhitelist(deviceMac, interfaceId);
    }

    async addDeviceToBlacklist(deviceMac: Device['deviceMac'], interfaceId: Device["interfaceId"]) {
        if (!deviceMac || !interfaceId) {
            throw new Error("deviceMac and interfaceId are required");
        }

        const device = await this.deviceRepo.getDeviceByMAC(deviceMac, interfaceId)

        await this.opnSenseService.blockDevice(device)

        return this.deviceRepo.addDeviceToBlacklist(deviceMac, interfaceId);
    }

    async removeDeviceFromBlacklist(deviceMac: Device['deviceMac'], interfaceId: Device["interfaceId"]) {
        if (!deviceMac || !interfaceId) {
            throw new Error("deviceMac and interfaceId are required");
        }

        const device = await this.deviceRepo.getDeviceByMAC(deviceMac, interfaceId)

        await this.opnSenseService.unblockDevice(device)

        return this.deviceRepo.removeDeviceFromBlacklist(deviceMac, interfaceId);
    }

}
