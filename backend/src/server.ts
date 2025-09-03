import app from "./app.js";
import db from "./config/db.js";
import { config } from "./config/index.js";
import { DeviceRepository } from "./modules/Device/device.repository.js";
import { DeviceService } from "./modules/Device/device.service.js";
import { CacheService } from "./services/cacheService.js";
import { NetworkRepository } from "./modules/Network/network.repository.js";
import { SophosService } from "./services/sophosService.js";
import { NetworkScanner } from "./services/networkScanner.js";
import { NetworkService } from "./modules/Network/network.service.js";
import { BandwidthService } from "./modules/Bandwidth/bandwidth.service.js";
import { BandwidthRepository } from "./modules/Bandwidth/bandwidth.repository.js";
import { SophosAPI } from "./services/sophosAPIService.js";

// repositories ni sila
export const deviceRepo = new DeviceRepository(db)
export const bandwidthRepo = new BandwidthRepository(db)
export const networkRepo = new NetworkRepository(db, new SophosService("192.168.254.200", "snmp simple"))


// services ni siya ari dapita
export const cache = new CacheService()
export const networkScanner = new NetworkScanner(deviceRepo, cache)
export const deviceService = new DeviceService(deviceRepo, cache)
export const bandwidthService = new BandwidthService(bandwidthRepo)
export const networkService = new NetworkService(networkRepo)
export const sophos = new SophosAPI({
    baseUrl: "https://192.168.254.200:4444",
    username: "admin",
    password: "Netdetect@2025",
})

const PORT = config.PORT;

// const LOCAL_IP = networkScanner.getLocalIP()

// mga background processes
// networkScanner.continuousScan(LOCAL_IP)

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
})