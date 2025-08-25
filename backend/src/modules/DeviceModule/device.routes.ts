import { Router } from "express";
import * as deviceController from "./device.controller.js"

const router = Router();

router.get("/", deviceController.getAllDevices)
router.post("/", deviceController.insertDevices)

export default router;