import type { NextFunction, Request, Response } from "express";
import { networkService } from "../../server.js";

export async function getPerDeviceTraffic(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await networkService.getPerDeviceTraffic();

        res.status(200).json({ success: true, data });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getInterfaceTraffic(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await networkService.getInterfaceTraffic();

        res.status(200).json({ success: true, data });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getSystemInfo(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await networkService.getSystemInfo();

        res.status(200).json({ success: true, data });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getCPUInfo(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await networkService.getCPUInfo();

        res.status(200).json({ success: true, data });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getSystemTime(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await networkService.getSystemTime();

        res.status(200).json({ success: true, data });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getAccessList(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await networkService.getAccessList();

        res.status(200).json({ success: true, data: list });
    } catch (err: unknown) {
        next(err);
    }
}

export async function unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceIp } = req.params

        if (!deviceIp) return res.status(400).json({ message: 'deviceIp is required' })

        await networkService.unblockUser(deviceIp);

        res.status(200).json({ success: true, message: `User ${deviceIp} unblocked successfully` });
    } catch (err: unknown) {
        next(err);
    }
}

export async function blockUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceIp } = req.params

        if (!deviceIp) return res.status(400).json({ message: 'deviceIp is required' })

        await networkService.blockUser(deviceIp);

        res.status(200).json({ success: true, message: `User ${deviceIp} blocked successfully` });
    } catch (err: unknown) {
        next(err);
    }
}

export async function blockDomain(req: Request, res: Response, next: NextFunction) {
    try {
        const { domain } = req.body

        if (!domain) return res.status(400).json({ message: 'domain is required' })

        const result = await networkService.blockDomain(domain);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getDNSStats(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await networkService.getDNSStats();
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getDeviceQueryLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceIp } = req.query
        if (!deviceIp) return res.status(400).json({ message: "deviceIp is required" })

        const result = await networkService.getDeviceQueryLogs(deviceIp.toString());
        res.status(200).json({ success: true, data: result });
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

export async function getNetworkInterfaceNames(req: Request, res: Response, next: NextFunction) {
    try {
        const interfaceNames = await networkService.getNetworkInterfaceNames();

        res.status(200).json({ success: true, data: interfaceNames });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getNetworkInterfaces(req: Request, res: Response, next: NextFunction) {
    try {
        const interfaces = await networkService.getNetworkInterfaces();

        res.status(200).json({ success: true, data: interfaces });
    } catch (err: unknown) {
        next(err);
    }
}