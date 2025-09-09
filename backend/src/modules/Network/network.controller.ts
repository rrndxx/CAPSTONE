import type { NextFunction, Request, Response } from "express";
import { networkService, opnSenseService } from "../../server.js";

export async function getNetworkInterfaces(req: Request, res: Response, next: NextFunction) {
    try {
        const interfaces = await networkService.getNetworkInterfaces();
        res.status(200).json({ success: true, data: interfaces });
    } catch (err: unknown) {
        next(err);
    }
}


export async function trial(req: Request, res: Response, next: NextFunction) {
    try {
        const interfaces = await opnSenseService.getInterfacesInfo();
        res.status(200).json({ success: true, data: interfaces });
    } catch (err: unknown) {
        next(err);
    }
}