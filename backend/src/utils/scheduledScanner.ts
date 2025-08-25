import cron from "node-cron";
import http from "http"
import type { NetworkScan } from "../modules/DeviceModule/device.model.js";
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

            console.log("done scanning.")
        } catch (err) {
            console.error("Scanner error:", err);
        }
    });
}


// const network = await db.network.findUnique({
//     where: { networkId: "eth-C0A8FE00-1898A942E3D2A9" },
//     include: { devices: true },
// });
