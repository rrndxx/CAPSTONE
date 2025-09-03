import type { NextFunction, Request, Response } from "express";
import { bandwidthService } from "../../server.js";

export async function getOverallNetworkBandwidthUsage(req: Request, res: Response, next: NextFunction) {
    try {
        const overallNetworkBandwidth = await bandwidthService.getOverallNetworkBandwidthUsage()
        res.status(200).json({ success: true, data: overallNetworkBandwidth })
    } catch (err: unknown) {
        next(err)
    }
}

export async function getDeviceBandwidthUsage(req: Request, res: Response, next: NextFunction) {
    try {
        const { mac } = req.params
        if (!mac) return res.status(400).json({ message: "MAC is required." })

        const deviceBandwidth = await bandwidthService.getDeviceBandwidthUsage(mac)
        res.status(200).json({ success: true, data: deviceBandwidth })
    } catch (err: unknown) {
        next(err)
    }
}

export async function limitDeviceBandwidth(req: Request, res: Response, next: NextFunction) {
    try {
        const { mac } = req.params
        if (!mac) return res.status(400).json({ message: "MAC is required." })

        const result = await bandwidthService.limitDeviceBandwidth(mac)
        res.status(201).json({ success: true, data: result })
    } catch (err: unknown) {
        next(err)
    }
}