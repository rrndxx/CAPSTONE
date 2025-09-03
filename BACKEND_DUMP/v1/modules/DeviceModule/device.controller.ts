import type { Request, Response, NextFunction } from 'express';
import { deviceService } from '../../server.js';

export async function getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
        const devices = await deviceService.getAllDevices()
        res.status(200).json({ success: true, data: devices })
    } catch (err: unknown) {
        next(err)
    }
}

export async function getDeviceByMAC(req: Request, res: Response, next: NextFunction) {
    try {
        const { mac } = req.params
        if (!mac) return res.status(400).json({ message: "mac is required" })

        const device = await deviceService.getDeviceByMAC(mac)
        res.status(200).json({ success: true, data: device })
    } catch (err: unknown) {
        next(err)
    }
}

export async function insertDevice(req: Request, res: Response, next: NextFunction) {
    try {
        const { device, networkId } = req.body
        if (!device) return res.status(400).json({ message: "Device and its details are required" })

        const result = await deviceService.insertDevice(device, networkId)
        res.status(201).json({ success: true, message: "Device inserted successfully.", data: result })
    } catch (err: unknown) {
        next(err)
    }
}

export async function updateDeviceListType(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceId } = req.params
        const { type } = req.body
        if (!deviceId || !type) return res.status(400).json({ message: "deviceId and type are required" })

        const result = await deviceService.updateDeviceListType(parseInt(deviceId), type)
        res.status(200).json({ success: true, message: "Device access type updated successfully.", data: result })
    } catch (err: unknown) {
        next(err)
    }
}

export async function getDeviceOpenPorts(req: Request, res: Response, next: NextFunction) {
    try {
        const { ip } = req.params
        if (!ip) return res.status(400).json({ message: "ip is required" })

        const result = await deviceService.getDeviceOpenPorts(ip)
        res.status(200).json({ success: true, data: result })
    } catch (err: unknown) {
        next(err)
    }
}