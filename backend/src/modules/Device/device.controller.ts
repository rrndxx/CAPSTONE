import type { NextFunction, Request, Response } from "express";
import { deviceService } from "../../server.js";

export async function getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
        const { interfaceId } = req.query;
        if (!interfaceId || typeof interfaceId !== "string") {
            return res.status(400).json({ message: "interfaceId is required as query param." });
        }

        const devices = await deviceService.getAllDevices(Number(interfaceId));
        res.status(200).json({ success: true, data: devices });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getDeviceByMAC(req: Request, res: Response, next: NextFunction) {
    try {
        const { mac } = req.params;
        const { interfaceId } = req.query;

        if (!mac) return res.status(400).json({ message: "MAC is required." });
        if (!interfaceId || typeof interfaceId !== "string") {
            return res.status(400).json({ message: "interfaceId is required as query param." });
        }

        const device = await deviceService.getDeviceByMAC(mac, Number(interfaceId));
        res.status(200).json({ success: true, data: device });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getDevicesFromDHCPLease(req: Request, res: Response, next: NextFunction) {
    try {
        const devices = await deviceService.getDevicesFromDHCPLease();
        res.status(200).json({ success: true, data: devices });
    } catch (err: unknown) {
        next(err);
    }
}
