import type { Device, Port, PrismaClient } from "@prisma/client";
import { normalizeMAC } from "../../utils/MACnormalizer.js";

export interface IDeviceRepository {
    removeDeviceFromBlacklist(deviceMac: string, interfaceId: number): unknown;
    addDeviceToBlacklist(deviceMac: string, interfaceId: number): unknown;
    getAllDevices(interfaceId: Device['interfaceId']): Promise<Device[]>;
    getDeviceByMAC(mac: Device['deviceMac'], interfaceId: Device['interfaceId']): Promise<Device | null>;
    upsertDevice(device: Partial<Device>, interfaceId: Device['interfaceId']): Promise<Device>;
    upsertDevices(devices: Partial<Device>[], interfaceId: Device['interfaceId']): Promise<Device[]>;
    getPortByNumber(deviceId: number, portNumber: number): Promise<Port | null>;
    upsertPort(port: Partial<Port>, updateExisting: boolean): Promise<Port>;
    updateDeviceOS(deviceId: number, osName: string): Promise<Device>;
    updateDeviceStatus(deviceId: Device['deviceId'], status: Device['status']): Promise<Device>
}

export class DeviceRepository implements IDeviceRepository {
    constructor(
        private db: PrismaClient
    ) { }

    async getAllDevices(interfaceId: Device['interfaceId']): Promise<Device[]> {
        return this.db.device.findMany({
            where: { interfaceId },
            include: {
                interface: true,
                bandwidthUsage: true,
                // bandwidthHourly: true,
                // bandwidthDaily: true,
                openPorts: true,
                visitedSites: true,
            },
        });
    }

    async getDeviceByMAC(mac: Device["deviceMac"], interfaceId: Device["interfaceId"]): Promise<Device | null> {
        const normalized = normalizeMAC(mac);

        return this.db.device.findUnique({
            where: { deviceMac_interfaceId: { deviceMac: normalized, interfaceId } },
        });
    }

    async upsertDevice(device: Partial<Device>, interfaceId: Device["interfaceId"]): Promise<Device> {
        if (!device.deviceMac || !device.deviceIp) {
            throw new Error("deviceMac and deviceIp are required to upsert a device");
        }

        const normalized = normalizeMAC(device.deviceMac);

        return this.db.device.upsert({
            where: { deviceMac_interfaceId: { deviceMac: normalized, interfaceId } },
            create: {
                deviceMac: normalized,
                deviceIp: device.deviceIp,
                deviceHostname: device.deviceHostname ?? null,
                deviceOS: device.deviceOS ?? null,
                macInfo: device.macInfo ?? null,
                authorized: device.authorized ?? false,
                status: device.status ?? "UP",
                interfaceId,
                firstSeen: new Date(),
                lastSeen: new Date(),
            },
            update: {
                deviceIp: device.deviceIp,
                deviceHostname: device.deviceHostname ?? null,
                deviceOS: device.deviceOS ?? null,
                macInfo: device.macInfo ?? null,
                authorized: device.authorized ?? false,
                status: device.status ?? "UP",
                lastSeen: new Date(),
            },
        });
    }

    async upsertDevices(devices: Partial<Device>[], interfaceId: Device["interfaceId"]): Promise<Device[]> {
        return Promise.all(devices.map(d => this.upsertDevice(d, interfaceId)));
    }

    async getPortByNumber(deviceId: number, portNumber: number): Promise<Port | null> {
        return this.db.port.findUnique({
            where: { deviceId_portNumber: { deviceId, portNumber } },
        });
    }

    async upsertPort(port: Partial<Port>, updateExisting: boolean): Promise<Port> {
        if (!port.deviceId || !port.portNumber) throw new Error("deviceId and portNumber are required");

        const createData = {
            deviceId: port.deviceId,
            portNumber: port.portNumber,
            status: port.status ?? "CLOSED",
            protocol: port.protocol ?? null,
            firstSeen: port.firstSeen ?? new Date(),
            lastSeen: port.lastSeen ?? new Date(),
        };

        const updateData = updateExisting
            ? {
                status: port.status ?? "CLOSED",
                protocol: port.protocol ?? null,
                lastSeen: port.lastSeen ?? new Date(),
            }
            : {};

        return this.db.port.upsert({
            where: { deviceId_portNumber: { deviceId: port.deviceId, portNumber: port.portNumber } },
            create: createData,
            update: updateData,
        });
    }

    async updateDeviceOS(deviceId: number, osName: string): Promise<Device> {
        return this.db.device.update({
            where: { deviceId },
            data: { deviceOS: osName, lastSeen: new Date() },
        });
    }

    async addDeviceToBlacklist(deviceMac: Device['deviceMac'], interfaceId: Device["interfaceId"]) {
        return this.db.blacklistedDevice.create({
            data: {
                blacklistedDeviceMac: deviceMac,
                interfaceId
            }
        })
    }

    async removeDeviceFromBlacklist(deviceMac: Device['deviceMac'], interfaceId: Device["interfaceId"]) {
        return this.db.blacklistedDevice.deleteMany({
            where: {
                blacklistedDeviceMac: deviceMac,
                interfaceId,
            },
        })
    }

    async updateDeviceStatus(deviceId: Device['deviceId'], status: Device['status']): Promise<Device> {
        return this.db.device.update({
            where: { deviceId },
            data: {
                status,
            }
        })
    }

}
