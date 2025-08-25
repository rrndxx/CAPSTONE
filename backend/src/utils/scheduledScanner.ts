import cron from "node-cron";
import axios from "axios";
import type { NetworkScan } from "../modules/DeviceModule/device.model.js";
import { redis } from "../config/redis.js";
import db from "../config/db.js";


export function ScheduledScanner() {
    cron.schedule("*/1 * * * *", async () => {
        console.log("Scheduled scanner starting...", new Date().toISOString());

        try {
            const response = await axios.get<NetworkScan>(
                "http://192.168.254.103:49090/1/devices?auth=fing_loc_api123"
            );
            const { devices } = response.data;

            // isud sa database
            const values = devices
                .map(
                    d =>
                        `(${[
                            d.deviceId,
                            d.mac,
                            d.ip,
                            d.state,
                            d.name,
                            d.type,
                            d.make,
                            d.model,
                            d.first_seen,
                        ]
                            .map(() => "?")
                            .join(",")})`
                )
                .join(",");

            const params = devices.flatMap(d => [
                d.deviceId,
                d.mac,
                d.ip,
                d.state,
                d.name,
                d.type,
                d.make,
                d.model,
                d.first_seen,
            ]);

            await db.$executeRawUnsafe(
                `
                INSERT INTO "Device" 
                    ("deviceId", "mac", "ip", "state", "name", "type", "make", "model", "first_seen")
                VALUES ${values}
                ON CONFLICT ("mac") DO UPDATE SET
                    ip = EXCLUDED.ip,
                    state = EXCLUDED.state,
                    name = EXCLUDED.name,
                    type = EXCLUDED.type,
                    make = EXCLUDED.make,
                    model = EXCLUDED.model,
                    first_seen = EXCLUDED.first_seen;
                `,
                ...params
            );

            // cache
            await redis.set("devices:all", JSON.stringify(devices), "EX", 60);

            console.log(`Upserted ${devices.length} devices and updated cache.`);
        } catch (err) {
            console.error("Scanner error:", err);
        }
    });
}
