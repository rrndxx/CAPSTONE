import type { NextFunction, Request, Response } from "express";
import { deviceService } from "../../server.js";

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

