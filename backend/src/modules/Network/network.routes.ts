import { Router } from "express";
import * as networkController from "./network.controller.js";

const router = Router();

router.get("/interfaces/all", networkController.getNetworkInterfaces) // get all interfaces
router.get("/interface/names", networkController.getNetworkInterfaceNames) // names onlyu

router.get("/system-time", networkController.getSystemTime) // system uptime, date time, etc. 
router.get("/system-information", networkController.getSystemInfo) // system info
router.get("/cpu-information", networkController.getCPUInfo) // system uptime, date time, etc. 

router.get("/speedtest", networkController.runSpeedTest) // external python service
router.get("/isp_health", networkController.runISPHealth); //external python service

router.get("/dns/all-stats", networkController.getDNSStats); //external pihole service
router.get("/dns/top-clients", networkController.getTopClients); //external pihole service
router.get("/dns/top-domains", networkController.getTopDomains); //external pihole service
router.get("/dns/network-devices", networkController.getNetworkDevices); //external pihole service


router.get("/dns/querylogs", networkController.getDeviceQueryLogs); //external pihole service
router.post("/dns/domain/block", networkController.blockDomain); //external pihole service
router.post("/dns/user/block/:deviceIp", networkController.blockUser); //external pihole service
router.post("/dns/user/unblock/:deviceIp", networkController.unblockUser); //external pihole service
router.get("/dns/access-list", networkController.getAccessList); //external pihole service

router.get("/traffic/interface", networkController.getInterfaceTraffic)
router.get("/traffic/per-device", networkController.getPerDeviceTraffic)

export default router;
