import type { NextFunction, Request, Response } from "express";
import { networkService } from "../../server.js";

export async function getNetworkInterfaces(req: Request, res: Response, next: NextFunction) {
    try {
        const interfaces = await networkService.getNetworkInterfaces();

        res.status(200).json({ success: true, data: interfaces });
    } catch (err: unknown) {
        next(err);
    }
}

export async function runSpeedTest(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await networkService.runSpeedTest();
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function runISPHealth(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await networkService.runISPHealth();
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}
