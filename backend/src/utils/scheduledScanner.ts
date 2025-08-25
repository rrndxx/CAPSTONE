import cron from "node-cron";
import axios from "axios";
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
            const response = await axios.get<NetworkScan>("http://192.168.254.103:49090/1/devices?auth=fing_loc_api123")
            const networkscan = response.data

            await db.network.upsert({
                where: { networkId: networkscan.networkId },
                update: {},
                create: { networkId: networkscan.networkId },
            });

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

            // const allDevices = await db.device.findMany();
            await redis.set("devices:all", JSON.stringify(devicesToInsert), "EX", 60);


        } catch (err) {
            console.error("Scanner error:", err);
        }
    });
}


// const network = await db.network.findUnique({
//     where: { networkId: "eth-C0A8FE00-1898A942E3D2A9" },
//     include: { devices: true },
// });
