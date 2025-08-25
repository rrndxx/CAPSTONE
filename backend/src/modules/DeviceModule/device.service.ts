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
    const devices = await db.device.findMany();

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

    // Upsert network
    await db.network.upsert({
        where: { networkId: networkscan.networkId },
        update: {},
        create: { networkId: networkscan.networkId },
    });

    // Map devices
    const devicesToInsert = networkscan.devices.map((d) => ({
        mac: d.mac,
        ip: d.ip,
        state: d.state,
        name: d.name,
        type: d.type ?? null,
        make: d.make ?? null,
        model: d.model ?? null,
        first_seen: d.first_seen,
        networkId: networkscan.networkId,
    }));

    await db.device.createMany({
        data: devicesToInsert,
        skipDuplicates: true,
    });

    await redis.set("devices:all", JSON.stringify(devicesToInsert), "EX", 60);

    return devicesToInsert;
}
