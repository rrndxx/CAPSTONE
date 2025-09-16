import { Router } from "express";
import * as bandwidthController from "./bandwidth.controller.js";

const router = Router();

// -------------------------
// Pipes 
// -------------------------

router.get("/pipes", bandwidthController.getBandwidthPipes);
router.get("/pipes/:id", bandwidthController.getPipeById);
router.post("/pipes", bandwidthController.createBandwidthPipe);
router.put("/pipes/:id", bandwidthController.updateBandwidthPipe);
router.delete("/pipes/:id", bandwidthController.deleteBandwidthPipe);

// -------------------------
// Queues
// -------------------------

router.get("/queues", bandwidthController.getBandwidthQueues);
router.get("/queues/:id", bandwidthController.getQueueById);
router.post("/queues", bandwidthController.createBandwidthQueue);
router.put("/queues/:id", bandwidthController.updateBandwidthQueue);
router.delete("/queues/:id", bandwidthController.deleteBandwidthQueue);

// -------------------------
// Speedcaps
// -------------------------

router.get("/speedcaps", bandwidthController.getSpeedCaps);
router.get("/speedcaps/:id", bandwidthController.getSpeedCapById);
router.post("/speedcaps", bandwidthController.createSpeedCaps);
router.put("/speedcaps/:ruleId", bandwidthController.updateSpeedCap);
router.delete("/speedcaps/:target", bandwidthController.deleteSpeedCap);

export default router;
