import { Router } from "express";
import * as networkController from "./network.controller.js";

const router = Router();

router.get("/interfaces/all", networkController.getNetworkInterfaces)
router.get("/t", networkController.trial)

export default router;
