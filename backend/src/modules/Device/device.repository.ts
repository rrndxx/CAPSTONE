import type { Device, PrismaClient } from "@prisma/client";

export interface IDeviceRepository {
    getAllDevices(interfaceId: Device['interfaceId']): Promise<Device[]>;
    getDeviceByMAC(mac: Device['deviceMac'], interfaceId: Device['interfaceId']): Promise<Device | null>;
    upsertDevice(device: Partial<Device>, interfaceId: Device['interfaceId']): Promise<Device>;
    upsertDevices(devices: Partial<Device>[], interfaceId: Device['interfaceId']): Promise<Device[]>;
}

export class DeviceRepository implements IDeviceRepository {
    constructor(private db: PrismaClient) { }

    private normalizeMAC(mac: Device['deviceMac']): string {
        const hex = mac.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
        if (hex.length !== 12) return mac.toUpperCase();
        return hex.match(/.{1,2}/g)!.join(":");
    }

    async getAllDevices(interfaceId: Device['interfaceId']): Promise<Device[]> {
        return this.db.device.findMany({ where: { interfaceId } });
    }

    async getDeviceByMAC(mac: Device["deviceMac"], interfaceId: Device["interfaceId"]): Promise<Device | null> {
        const normalized = this.normalizeMAC(mac);

        return this.db.device.findUnique({
            where: { deviceMac_interfaceId: { deviceMac: normalized, interfaceId } },
        });
    }

    async upsertDevice(device: Partial<Device>, interfaceId: Device["interfaceId"]): Promise<Device> {
        if (!device.deviceMac || !device.deviceIp)
            throw new Error("deviceMac and deviceIp are required to upsert a device");

        const normalized = this.normalizeMAC(device.deviceMac);

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
}
