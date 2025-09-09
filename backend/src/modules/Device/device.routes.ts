import { Router } from "express";
import * as deviceController from "./device.controller.js";

const router = Router();

router.get("/all", deviceController.getAllDevices);
router.get("/:mac", deviceController.getDeviceByMAC);
router.post("/opnsense/dhcp/lease4", deviceController.getDevicesFromDHCPLease);

export default router;
