import { Router } from "express";
import * as networkController from "./network.controller.js";

const router = Router();

router.get("/interfaces/all", networkController.getNetworkInterfaces) // database/cache magkuha
router.get("/speedtest", networkController.runSpeedTest) // external python service
router.get("/isp_health", networkController.runISPHealth); //external python service

export default router;
