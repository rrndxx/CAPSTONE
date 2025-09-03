import { Router } from "express";
import * as networkController from "./network.controller.js"
import { sophos } from "../../server.js";
import type { Request, Response, NextFunction } from "express";

const router = Router()

router.get("/system-health", networkController.getSystemHealth)

// Get all IP Hosts
router.get("/sophos-ip-hosts", async (req, res) => {
    try {
        const hosts = await sophos.getIPHosts();
        res.type("application/xml").send(hosts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch hosts" });
    }
});

// Add a new IP Host
// router.post("/sophos-ip-hosts", async (req: Request, res: Response) => {
//     try {
//         const { name, ip }: { name?: string; ip?: string } = req.body;
//         if (!name || !ip) {
//             return res.status(400).json({ error: "Name and IP required" });
//         }

//         const response = await sophos.addIPHost(name, ip);
//         res.type("application/xml").send(response);
//     } catch (err) {
//         res.status(500).json({ error: "Failed to add host" });
//     }
// });


export default router