import type { Request, Response, NextFunction } from 'express';
import * as deviceService from "./device.service.js"

export async function getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
        const devices = await deviceService.getAllDevices();
        res.json({ success: true, data: devices })
    } catch (err) {
        next(err)
    }
}

export async function insertDevices(req: Request, res: Response, next: NextFunction) {
    try {
        const newDevice = await deviceService.insertDevices();
        res.status(201).json({ message: "Device inserted successfully", device: newDevice });
    } catch (err: any) {
        next(err);
    }
}

export async function updateDeviceListType(req: Request, res: Response, next: NextFunction) {
    try {
        const { mac, type } = req.body;

        if (!mac || !type) {
            return res.status(400).json({ message: "mac and type are required" });
        }

        const result = await deviceService.updateDeviceListType(mac, type as "WHITELIST" | "BLACKLIST");

        res.status(200).json({ message: "Device list updated", data: result });
    } catch (err: any) {
        next(err)
    }
}

export async function getDeviceOpenPorts(req: Request, res: Response, next: NextFunction) {
    try {
        const { mac } = req.body

        if (!mac) {
            return res.status(400).json({ message: 'mac is required.' })
        }

        const result = await deviceService.getDeviceOpenPorts(mac)

        res.status(200).json({ message: "Open ports scan on MAC: ${mac} done. ", data: result })
    } catch (err: any) {
        next(err)
    }
}