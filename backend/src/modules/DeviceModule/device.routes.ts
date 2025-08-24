import { Router } from "express";
import * as deviceController from "./device.controller.js"

const router = Router();

router.get("/", deviceController.getAllDevices)

export default router;