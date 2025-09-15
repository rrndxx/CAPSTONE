import { Router } from "express";
import * as deviceController from "./device.controller.js";
import axios from "axios";

const router = Router();

router.get("/all", deviceController.getAllDevicesFromDB); // database/cache mukuha
// router.get("/all", deviceController.getAllDevices); // database/cache mukuha
router.get("/:mac", deviceController.getDeviceByMAC); // database/cache mukuha
router.post("/port/scan", deviceController.scanDevicePorts); // external python scanner mukuha

router.post("/block", deviceController.blockDevice)
router.post("/unblock", deviceController.unblockDevice)

//tests
router.post("/opnsense/devices", deviceController.getDevicesFromDHCPLease); // opnsense mukuha
router.post("/test-os", async (req, res, next) => {
    try {
        const { ip } = req.body;

        if (!ip) {
            return res.status(400).json({ error: "IP is required" });
        }

        const result = await axios.get("http://localhost:8000/detect_os/", {
            params: { ip },
        });

        return res.json(result.data);
    } catch (err) {
        next(err);
    }
});

router.get("/scanport", deviceController.scanPorts)

export default router;
