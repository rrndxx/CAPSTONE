import { Router } from "express";
import * as bandwidthController from "./bandwidth.controller.js"

const router = Router()

router.get("/overall-network", bandwidthController.getOverallNetworkBandwidthUsage)
router.get("/:mac", bandwidthController.getDeviceBandwidthUsage)
router.post("/limit/:mac", bandwidthController.limitDeviceBandwidth)

export default router