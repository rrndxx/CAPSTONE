import type { Device } from "@prisma/client";

export function normalizeMAC(mac: Device['deviceMac']): string {
    const hex = mac.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
    if (hex.length !== 12) return mac.toUpperCase();
    return hex.match(/.{1,2}/g)!.join(":");
}