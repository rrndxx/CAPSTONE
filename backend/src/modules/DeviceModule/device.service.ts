import db from "../../config/db.js";
import { redis } from "../../config/redis.js";

export async function getAllDevices() {
    // kwaon daan ang mga nakacache na device
    const cached = await redis.get("devices:all");
    if (cached) {
        return JSON.parse(cached)
    }

    // if walay nakacache na device,
    const devices = await db.device.findMany();

    // istore ang nakuha na device
    await redis.set("devices:all", JSON.stringify(devices), "EX", 60);

    return devices;
}
