import type { Request, Response, NextFunction } from "express";
import { networkService } from "../../server.js";

export async function getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
        const response = await networkService.getSystemHealthInfo()

        res.status(200).json({ success: true, data: response })
    } catch (err: unknown) {
        next(err)
    }
}