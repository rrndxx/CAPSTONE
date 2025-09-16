import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from "express";
import { bandwidthService } from "../../server.js";

// -------------------------
// Speedcaps
// -------------------------

export async function getSpeedCaps(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const caps = await bandwidthService.getSpeedCaps();
        res.status(200).json({ success: true, data: caps });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getSpeedCapById(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "id is required" });
        const cap = await bandwidthService.getSpeedCapById(id);
        res.status(200).json({ success: true, data: cap });
    } catch (err: unknown) {
        next(err);
    }
}

export async function createSpeedCaps(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { targetId, iface, proto, src, dst, direction, description, sequence } = req.body;
        const DIRECTION = direction === "both" ? '' : direction

        const result = await bandwidthService.createSpeedCaps(
            targetId, iface, proto, src, dst, DIRECTION, description, sequence
        );
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function updateSpeedCap(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { ruleId } = req.params;
        const { targetId, iface, proto, src, dst, direction, description, sequence } = req.body;
        if (!ruleId) return res.status(400).json({ message: "ruleId is required." });

        const result = await bandwidthService.updateSpeedCap(
            ruleId, targetId, iface, proto, src, dst, direction, description, sequence
        );
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function deleteSpeedCap(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { target } = req.params;
        if (!target) return res.status(400).json({ message: "target is required" });
        const result = await bandwidthService.deleteSpeedCap(target);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

// -------------------------
// Pipes
// -------------------------

export async function getBandwidthPipes(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const pipes = await bandwidthService.getBandwidthPipes();
        res.status(200).json({ success: true, data: pipes });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getPipeById(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "id is required" });
        const pipe = await bandwidthService.getPipeById(id);
        res.status(200).json({ success: true, data: pipe });
    } catch (err: unknown) {
        next(err);
    }
}

export async function createBandwidthPipe(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { bandwidth, metric, mask, description } = req.body;
        const result = await bandwidthService.createBandwidthPipe(bandwidth, metric, mask, description);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function updateBandwidthPipe(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { id, bandwidth, metric, mask, description } = req.body;
        const result = await bandwidthService.updateBandwidthPipe(id, bandwidth, metric, mask, description);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function deleteBandwidthPipe(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "id is required" });
        const result = await bandwidthService.deleteBandwidthPipe(id);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

// -------------------------
// Queues
// -------------------------

export async function getBandwidthQueues(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const queues = await bandwidthService.getBandwidthQueues();
        res.status(200).json({ success: true, data: queues });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getQueueById(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "id is required" });
        const queue = await bandwidthService.getQueueById(id);
        res.status(200).json({ success: true, data: queue });
    } catch (err: unknown) {
        next(err);
    }
}

export async function createBandwidthQueue(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { pipe, weight, mask, description } = req.body;
        const result = await bandwidthService.createBandwidthQueue(pipe, weight, mask, description);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function updateBandwidthQueue(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { id, pipeId, weight, mask, description } = req.body;
        const result = await bandwidthService.updateBandwidthQueue(id, pipeId, weight, mask, description);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}

export async function deleteBandwidthQueue(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "id is required" });
        const result = await bandwidthService.deleteBandwidthQueue(id);
        res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
        next(err);
    }
}
