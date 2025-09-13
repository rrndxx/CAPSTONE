import { Router } from "express";
import * as deviceController from "./device.controller.js";

const router = Router();

router.get("/all", deviceController.getAllDevices); // database/cache mukuha
router.get("/:mac", deviceController.getDeviceByMAC); // database/cache mukuha
router.post("/os-port", deviceController.scanDeviceOSandPorts); // external python scanner mukuha

router.post("/block", deviceController.blockDevice)
router.post("/unblock", deviceController.unblockDevice)

// router.post("/opnsense/devices", deviceController.getDevicesFromDHCPLease); // opnsense mukuha

export default router;
