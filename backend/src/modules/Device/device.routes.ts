import { PrismaClient } from '@prisma/client';
import { Router } from "express";
import * as deviceController from "./device.controller.js"

const router = Router()

router.get("/all", deviceController.getAllDevices)
router.get("/:mac", deviceController.getDeviceByMAC)

export default router