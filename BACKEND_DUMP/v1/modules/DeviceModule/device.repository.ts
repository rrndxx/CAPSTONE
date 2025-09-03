import db from "../../config/db.js";
import type { Device, Network, DeviceList } from "@prisma/client";
import type { IDeviceRepository } from "./device.interface.js";

export class DeviceRepository implements IDeviceRepository {

    findAllDevices(): Promise<(Device & { DeviceList: DeviceList[], network: Network | null })[]> {
        return db.device.findMany({
            include: { DeviceList: true, network: true }
        });
    }

    findByMAC(mac: Device["mac"]): Promise<(Device & { DeviceList: DeviceList[], network: Network | null }) | null> {
        return db.device.findUnique({
            where: { mac },
            include: { DeviceList: true, network: true }
        });
    }

    insertDevice(device: Device, networkId: Network["networkId"]): Promise<Device & { network: Network | null; DeviceList: DeviceList[] }> {
        return db.device.create({
            data: {
                ...device,
                networkId
            },
            include: { network: true, DeviceList: true },
        });
    }

    upsertNetwork(networkId: Network["networkId"]): Promise<Network> {
        return db.network.upsert({
            where: { networkId },
            update: {},
            create: { networkId },
        });
    }

    async upsertDevice(device: Device, networkId: Network["networkId"]): Promise<Device & { network: Network | null; DeviceList: DeviceList[] }> {
        const now = new Date().toISOString();
        try {
            return await db.device.upsert({
                where: { mac: device.mac },
                update: {
                    state: device.state,
                    ip: device.ip,
                    last_seen: now,
                },
                create: {
                    mac: device.mac,
                    ip: device.ip,
                    state: device.state,
                    name: device.name,
                    type: device.type ?? null,
                    make: device.make ?? null,
                    model: device.model ?? null,
                    first_seen: now,
                    last_seen: now,
                    networkId,
                },
                include: { network: true, DeviceList: true },
            });
        } catch (error) {
            console.error(`Failed to upsert device with MAC ${device.mac}:`, error);
            throw new Error(`Device upsert failed for MAC ${device.mac}`);
        }
    }

    async upsertDevices(devices: Device[], networkId: Network["networkId"]): Promise<(Device & { network: Network | null; DeviceList: DeviceList[] })[]> {
        return Promise.all(devices.map(d => this.upsertDevice(d, networkId)));
    }

    upsertDeviceList(deviceId: DeviceList["deviceId"], type: DeviceList["type"]): Promise<DeviceList> {
        return db.deviceList.upsert({
            where: { deviceId_type: { deviceId, type } },
            update: {},
            create: { deviceId, type },
        });
    }
}
