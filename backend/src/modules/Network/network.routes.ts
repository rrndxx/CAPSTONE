import { Router } from "express";
import * as networkController from "./network.controller.js";

const router = Router();

router.get("/system-health", networkController.getSystemHealth);
router.get("/sophos/ip-hosts", networkController.getIPHosts);
router.get("/sophos/ip-hosts/statistics", networkController.getIPHostStatistics);
router.post("/sophos/ip-hosts/add", networkController.addIPHost);
router.put("/sophos/ip-hosts/:name", networkController.updateIPHost);
router.delete("/sophos/ip-hosts/:name", networkController.deleteIPHost);
router.get("/sophos/mac-hosts", networkController.getMACHosts);
router.get("/sophos/zones", networkController.getZones);
router.get("/sophos/services", networkController.getServices);
router.get("/sophos/firewall/rules", networkController.getFirewallRules);
router.post("/sophos/firewall/rules", networkController.addFirewallRule);
router.put("/sophos/firewall/rules/:name", networkController.updateFirewallRule);
router.delete("/sophos/firewall/rules/:name", networkController.deleteFirewallRule);

export default router;
