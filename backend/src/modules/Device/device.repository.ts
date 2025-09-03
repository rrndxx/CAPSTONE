import type { Device, Network, PrismaClient } from "@prisma/client";
import type { IDeviceRepository } from "./device.interface.js";

export class DeviceRepository implements IDeviceRepository {
    constructor(
        private db: PrismaClient
    ) { }

    getAllDevices(): Promise<Device[]> {
        return this.db.device.findMany({ include: { network: true } })
    }

    getDeviceByMAC(mac: Device["mac"]): Promise<Device | null> {
        return this.db.device.findUnique({
            where: { mac },
            include: { network: true }
        })
    }
    
    async upsertDevice(device: Device, networkId: Network["networkId"]): Promise<Device> {
        const now = new Date();
        return this.db.device.upsert({
            where: { mac: device.mac },
            update: {
                ip: device.ip,
                state: device.state,
                lastSeen: now,
                name: device.name ?? null,
                type: device.type ?? null,
                make: device.make ?? null,
                model: device.model ?? null,
            },
            create: {
                ...device,
                firstSeen: device.firstSeen ?? now,
                lastSeen: now,
                networkId
            },
            include: { network: true }
        })
    }

}