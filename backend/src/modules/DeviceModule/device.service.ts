import db from "../../config/db.js";
import { redis } from "../../config/redis.js";
import type { Request, Response } from "express";


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
    const device = {
        mac: "AA:BB:CC:DD:EE:FF",
        ip: ["192.168.1.10"],
        state: "online",
        name: "My Laptop",
        type: "PC",
        make: "Dell",
        model: "XPS 13",
        first_seen: new Date().toISOString(),
    }

    const newDevice = await db.device.create({ data: device });
    await redis.set("devices:all", JSON.stringify(newDevice), "EX", 60);

    return newDevice;
}