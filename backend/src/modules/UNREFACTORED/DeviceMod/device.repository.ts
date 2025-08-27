import db from "../../../config/db.js";
import type { DeviceList, DeviceModel, NetworkScan } from "./device.model.js";

export class DeviceRepository {
    async findAllDevices() {
        return db.device.findMany({ include: { network: true } })
    }

    async findByMAC(mac: DeviceModel["mac"]) {
        return db.device.findUnique({ where: { mac } })
    }

    async upsertNetwork(networkId: NetworkScan["networkId"]) {
        return db.network.upsert({
            where: { networkId },
            update: {},
            create: { networkId },
        })
    }

    async upsertDevice(device: DeviceModel, networkId: NetworkScan["networkId"]) {
        return db.device.upsert({
            where: { mac: device.mac },
            update: {
                state: device.state,
                ip: device.ip,
                last_seen: new Date().toISOString()
            },
            create: {
                mac: device.mac,
                ip: device.ip,
                state: device.state,
                name: device.name,
                type: device.type ?? null,
                make: device.make ?? null,
                model: device.model ?? null,
                first_seen: new Date().toISOString(),
                last_seen: new Date().toISOString(),
                networkId
            }
        })
    }

    async upsertDeviceList(deviceId: DeviceList["deviceId"], type: DeviceList["type"]) {
        return db.deviceList.upsert({
            where: { deviceId_type: { deviceId, type } },
            update: {},
            create: { deviceId, type },
        })
    }
}