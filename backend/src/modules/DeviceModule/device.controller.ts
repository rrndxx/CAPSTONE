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