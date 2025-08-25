import http from "http";
import db from "../../config/db.js";
import { redis } from "../../config/redis.js";
import type { NetworkScan } from "./device.model.js";


export async function getAllDevices() {
    // kwaon daan ang mga nakacache na devices
    const cachedDevices = await redis.get("devices:all");
    if (cachedDevices) {
        return JSON.parse(cachedDevices)
    }

    // if walay nakacache na device, kuha adto directly sa database
    const devices = await db.device.findMany({ include: { network: true } });

    return devices;
}

export async function insertDevices() {
    const options = {
        hostname: "192.168.254.103",
        port: 49090,
        path: "/1/devices?auth=fing_loc_api123",
        method: "GET",
        insecureHTTPParser: true,
    };

    const networkscan: NetworkScan = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on("error", reject);
        req.end();
    });

    // iupsert ang network
    await db.network.upsert({
        where: { networkId: networkscan.networkId },
        update: {},
        create: { networkId: networkscan.networkId },
    });

    // upsert each device
    for (const d of networkscan.devices) {
        await db.device.upsert({
            where: { mac: d.mac },
            update: {
                state: d.state,
                ip: d.ip,
                last_seen: new Date().toISOString(),
            },
            create: {
                mac: d.mac,
                ip: d.ip,
                state: d.state,
                name: d.name,
                type: d.type ?? null,
                make: d.make ?? null,
                model: d.model ?? null,
                first_seen: new Date().toISOString(),
                last_seen: new Date().toISOString(),
                networkId: networkscan.networkId,
            },
        });
    }

    // kuhaon daan ang suds database
    const allDevices = await db.device.findMany({ include: { network: true } });

    //isud sa redis
    await redis.set("devices:all", JSON.stringify(allDevices), "EX", 60);

    return allDevices;
}

export async function updateDeviceListType(mac: string, type: "WHITELIST" | "BLACKLIST") {
    // kuhaon sa daan ang device with this mac
    const device = await db.device.findUnique({
        where: { mac },
    });

    if (!device) {
        throw new Error(`Device with MAC ${mac} not found`);
    }

    const updated = await db.deviceList.upsert({
        where: {
            deviceId_type: { deviceId: device.deviceId, type },
        },
        update: {},
        create: {
            deviceId: device.deviceId,
            type,
        },
    });

    return updated;
}


