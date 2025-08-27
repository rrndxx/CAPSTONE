import cron from "node-cron";
import http from "http";
import { redis } from "../config/redis.js";
import db from "../config/db.js";

let scheduled = false;

export function ScheduledScanner() {
    if (scheduled) return;
    scheduled = true;

    cron.schedule("*/1 * * * *", async () => {
        console.log("Scheduled scanner starting...", new Date().toISOString());

        try {
            const options = {
                hostname: "192.168.254.103",
                port: 49090,
                path: "/1/devices?auth=fing_loc_api123",
                method: "GET",
                insecureHTTPParser: true,
            };

            // Fetch devices sa FING Local API
            const scannerData = await new Promise<{ networkId: string; devices: any[] }>((resolve, reject) => {
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

            const { networkId, devices } = scannerData;

            // Upsert network
            await db.network.upsert({
                where: { networkId },
                update: {},
                create: { networkId },
            });

            // Upsert each device in parallel
            await Promise.all(
                devices.map((d) =>
                    db.device.upsert({
                        where: { mac: d.mac },
                        update: {
                            state: d.state,
                            ip: Array.isArray(d.ip) ? d.ip[0] : d.ip,
                            last_seen: new Date().toISOString(),
                        },
                        create: {
                            mac: d.mac,
                            ip: Array.isArray(d.ip) ? d.ip[0] : d.ip,
                            state: d.state,
                            name: d.name,
                            type: d.type ?? null,
                            make: d.make ?? null,
                            model: d.model ?? null,
                            first_seen: new Date().toISOString(),
                            last_seen: new Date().toISOString(),
                            networkId,
                        },
                    })
                )
            );

            // Fetch all devices with relations
            const allDevices = await db.device.findMany({
                include: { DeviceList: true, network: true },
            });

            // Cache in Redis
            await redis.set("devices:all", JSON.stringify(allDevices), "EX", 60);

            console.log("Done scanning:", allDevices.length, "devices");
        } catch (err) {
            console.error("Scanner error:", err);
        }
    });
}
