import type { NextFunction, Request, Response } from "express";
import { deviceService } from "../../server.js";

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
        if (!mac) return res.status(400).json({ message: "MAC is required." })

        const device = await deviceService.getDeviceByMAC(mac)
        res.status(200).json({ success: true, data: device })
    } catch (err: unknown) {
        next(err)
    }
}

export async function name(req: Request, res: Response, next: NextFunction) {
    try {

    } catch (err: unknown) {

    }
}