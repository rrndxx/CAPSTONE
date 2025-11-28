import type { NextFunction, Request, Response } from "express";
import { deviceRepo, deviceService } from "../../server.js";
import { runNmapScan } from "../../services/nmapScannerService.js";

export async function scanPorts(req: Request, res: Response) {
    const ip = req.query.ip as string | undefined;

    if (typeof ip !== 'string' || ip.trim() === '') {
        return res.status(400).json({ error: 'Invalid or missing "ip" query parameter' });
    }

    try {
        const result = await runNmapScan(ip);
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({
            error: 'Scan failed',
            message: error.message,
        });
    }
};

export async function blockDevice(req: Request, res: Response, next: NextFunction) {
    try {
        const { device, interfaceId } = req.body;

        if (!device || !device.deviceMac) {
            return res.status(400).json({ error: "Device with valid MAC required" });
        }

        const result = await deviceService.blockDevice(device, interfaceId);

        res.json({
            success: true,
            message: `Device ${device.deviceMac} blocked successfully`,
            result
        });
    } catch (err: unknown) {
        next(err);
    }
}

export async function unblockDevice(req: Request, res: Response, next: NextFunction) {
    try {
        const { device, interfaceId } = req.body;

        if (!device || !device.deviceMac) {
            return res.status(400).json({ error: "Device with valid MAC required" });
        }

        const result = await deviceService.unblockDevice(device, interfaceId);

        res.json({
            success: true,
            message: `Device ${device.deviceMac} unblocked successfully`,
            result
        });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
        const { interfaceId } = req.query;

        if (!interfaceId || typeof interfaceId !== "string")
            return res.status(400).json({ message: "interfaceId is required as query param." });

        const devices = await deviceService.getAllDevices(Number(interfaceId));

        res.status(200).json({ success: true, data: devices });
    } catch (err) {
        next(err);
    }
}

export async function getAllDevicesFromDB(req: Request, res: Response, next: NextFunction) {
    try {
        const { interfaceId } = req.query;

        if (!interfaceId || typeof interfaceId !== "string") {
            return res.status(400).json({ message: "interfaceId is required as query param." });
        }

        const parsedInterfaceId = Number(interfaceId);

        const devices = (await deviceService.getAllDevicesFromDB(parsedInterfaceId)) ?? [];

        const devicesWithTrust = await Promise.all(
            devices.map(async dev => {
                let trustStatus: "WHITELISTED" | "BLACKLISTED" | "NEUTRAL" = "NEUTRAL";

                const isWhitelisted = await deviceRepo.isDeviceWhitelist(
                    dev.deviceMac,
                    dev.interfaceId
                );

                if (isWhitelisted) {
                    trustStatus = "WHITELISTED";
                } else {
                    const isBlacklisted = await deviceRepo.isDeviceBlacklist(
                        dev.deviceMac,
                        dev.interfaceId
                    );

                    if (isBlacklisted) {
                        trustStatus = "BLACKLISTED";
                    }
                }

                return {
                    ...dev,
                    trustStatus,
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: devicesWithTrust
        });

    } catch (err) {
        next(err);
    }
}

export async function getDeviceByMAC(req: Request, res: Response, next: NextFunction) {
    try {
        const { mac } = req.params;
        const { interfaceId } = req.query;

        if (!mac) return res.status(400).json({ message: "MAC is required." });
        if (!interfaceId || typeof interfaceId !== "string") return res.status(400).json({ message: "interfaceId is required." });

        const device = await deviceService.getDeviceByMAC(mac, Number(interfaceId));

        res.status(200).json({ success: true, data: device });
    } catch (err) {
        next(err);
    }
}

export async function scanDevicePorts(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceMac, interfaceId } = req.body;
        if (!deviceMac || !interfaceId) return res.status(400).json({ message: "deviceMac and interfaceId are required." });

        const dbDevice = await deviceService.getDeviceByMAC(deviceMac, interfaceId);
        if (!dbDevice) return res.status(404).json({ message: "Device not found." });

        const ports = await deviceService.scanAndUpsertDeviceOpenPorts(dbDevice);

        res.status(200).json({
            success: true,
            data: { device: dbDevice, ports }
        });
    } catch (err) {
        next(err);
    }
}

export async function getDevicesFromDHCPLease(req: Request, res: Response, next: NextFunction) {
    try {
        const devices = await deviceService.getDevicesFromDHCPLease();
        res.status(200).json({ success: true, data: devices });
    } catch (err) { next(err); }
}

export async function whitelistDevice(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceMac, interfaceId } = req.body;

        if (!deviceMac || !interfaceId)
            return res.status(400).json({ error: "deviceMac and interfaceId are required" });

        const result = await deviceService.addDeviceToWhitelist(deviceMac, interfaceId);

        return res.json({
            success: true,
            message: `Device ${deviceMac} added to whitelist.`,
            result
        });

    } catch (err) {
        next(err);
    }
}

export async function unwhitelistDevice(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceMac, interfaceId } = req.body;

        if (!deviceMac || !interfaceId)
            return res.status(400).json({ error: "deviceMac and interfaceId are required" });

        const result = await deviceService.removeDeviceFromWhitelist(deviceMac, interfaceId);

        return res.json({
            success: true,
            message: `Device ${deviceMac} removed from whitelist.`,
            result
        });

    } catch (err) {
        next(err);
    }
}

export async function blacklistDevice(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceMac, interfaceId } = req.body;

        if (!deviceMac || !interfaceId)
            return res.status(400).json({ error: "deviceMac and interfaceId are required" });

        const result = await deviceService.addDeviceToBlacklist(deviceMac, interfaceId);

        return res.json({
            success: true,
            message: `Device ${deviceMac} added to blacklist.`,
            result
        });

    } catch (err) {
        next(err);
    }
}

export async function unblacklistDevice(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceMac, interfaceId } = req.body;

        if (!deviceMac || !interfaceId)
            return res.status(400).json({ error: "deviceMac and interfaceId are required" });

        const result = await deviceService.removeDeviceFromBlacklist(deviceMac, interfaceId);

        return res.json({
            success: true,
            message: `Device ${deviceMac} removed from blacklist.`,
            result
        });

    } catch (err) {
        next(err);
    }
}


