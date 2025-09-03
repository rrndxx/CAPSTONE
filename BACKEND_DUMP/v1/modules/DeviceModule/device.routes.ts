import { Router } from "express";
import * as deviceController from "./device.controller.js"
const router = Router()

router.get("/", deviceController.getAllDevices)
router.get("/:mac", deviceController.getDeviceByMAC)
router.get("/ip/:ip/ports", deviceController.getDeviceOpenPorts)
router.post("/", deviceController.insertDevice)
router.put("/:deviceId/list-type", deviceController.updateDeviceListType)

export default router