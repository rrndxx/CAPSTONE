import app from "./app.js";
import db from "./config/db.js";
import { config } from "./config/index.js";
import { DeviceRepository } from "./modules/Device/device.repository.js";
import { BandwidthRepository } from "./modules/Bandwidth/bandwidth.repository.js";
import { NetworkRepository } from "./modules/Network/network.repository.js";
import { DeviceService } from "./modules/Device/device.service.js";
import { BandwidthService } from "./modules/Bandwidth/bandwidth.service.js";
import { NetworkService } from "./modules/Network/network.service.js";
import { RedisCacheService } from "./services/cacheService.js";
import { NetworkScanner } from "./services/scannerService.js";
import { OPNsenseService } from "./services/OPNsenseService.js";
import { AdGuardService } from "./services/AdGuardService.js";

const PORT = config.PORT;
const OPNSENSE_URL = config.OPNSENSE_URL
const OPNSENSE_KEY = config.OPNSENSE_KEY
const OPNSENSE_SECRET = config.OPNSENSE_SECRET
const PYTHON_SCANNER_URL = config.PYTHON_SCANNER_URL
const ADGUARD_URL = config.ADGUARD_URL
const ADGUARD_USERNAME = config.ADGUARD_USERNAME
const ADGUARD_PASSWORD = config.ADGUARD_PASSWORD

export const deviceRepo = new DeviceRepository(db)
export const bandwidthRepo = new BandwidthRepository(db)
export const networkRepo = new NetworkRepository(db)

export const cache = new RedisCacheService()
export const opnSenseService = new OPNsenseService(OPNSENSE_URL, OPNSENSE_KEY, OPNSENSE_SECRET)
export const deviceService = new DeviceService(deviceRepo, cache, opnSenseService)
export const bandwidthService = new BandwidthService(bandwidthRepo, opnSenseService)
export const networkService = new NetworkService(networkRepo, cache, opnSenseService)
export const networkScanner = new NetworkScanner(deviceService, networkService, cache, opnSenseService, PYTHON_SCANNER_URL)
export const adGuardService = new AdGuardService(ADGUARD_URL, ADGUARD_USERNAME, ADGUARD_PASSWORD)

app.listen(PORT, () => {
    console.log(`Backend: http://localhost:${PORT}`);
    console.log(`Python service: ${PYTHON_SCANNER_URL}`);
})

const interfacenames = await networkService.getNetworkInterfaceNames()
export const ALLINTERFACENAMES = Object.values(interfacenames)

await networkScanner.scanInterfacesNow()
await networkScanner.scanDevicesNow()

// networkScanner.continuousNetworkInterfaceScan()
// networkScanner.continuousDeviceScan()

