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
import { AlertRepository, EmailChannel, NotificationService, PushChannel } from "./services/NotificationService.js";
import { ReportsExport } from "./services/exportService.js";

const PORT = config.PORT;
const OPNSENSE_URL = config.OPNSENSE_URL
const OPNSENSE_KEY = config.OPNSENSE_KEY
const OPNSENSE_SECRET = config.OPNSENSE_SECRET
const PYTHON_SCANNER_URL = config.PYTHON_SCANNER_URL
const ADGUARD_URL = config.ADGUARD_URL
const ADGUARD_USERNAME = config.ADGUARD_USERNAME
const ADGUARD_PASSWORD = config.ADGUARD_PASSWORD
const USER = config.EMAIL_USER
const VAPID_PUBLIC = config.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = config.VAPID_PRIVATE_KEY
export const JWT_SECRET = config.JWT_SECRET as string || "NetdetectCapstone"
export const TOKEN_EXPIRY = config.TOKEN_EXPIRY || "1h"

export const deviceRepo = new DeviceRepository(db)
export const bandwidthRepo = new BandwidthRepository(db)
export const networkRepo = new NetworkRepository(db)
export const alertsRepo = new AlertRepository(db)

export const pushChannel = new PushChannel({ subject: `mailto:${USER}`, publicKey: VAPID_PUBLIC, privateKey: VAPID_PRIVATE }, db)
export const emailChannel = new EmailChannel([USER])

export const cache = new RedisCacheService()
export const opnSenseService = new OPNsenseService(OPNSENSE_URL, OPNSENSE_KEY, OPNSENSE_SECRET)
export const deviceService = new DeviceService(deviceRepo, cache, opnSenseService)
export const bandwidthService = new BandwidthService(bandwidthRepo, opnSenseService)
export const networkService = new NetworkService(networkRepo, cache, opnSenseService)
export const networkScanner = new NetworkScanner(deviceService, networkService, cache, opnSenseService, PYTHON_SCANNER_URL)
export const adGuardService = new AdGuardService(ADGUARD_URL, ADGUARD_USERNAME, ADGUARD_PASSWORD)
export const notificationService = new NotificationService([pushChannel, emailChannel], alertsRepo)
export const exporter = new ReportsExport(db)

app.listen(PORT, () => {
    console.log(`Backend: http://localhost:${PORT}`);
    console.log(`Python service: ${PYTHON_SCANNER_URL}`);
})

const interfacenames = await networkService.getNetworkInterfaceNames()
export const ALLINTERFACENAMES = Object.values(interfacenames)

console.log(ALLINTERFACENAMES)

await networkScanner.scanInterfacesNow()
await networkScanner.scanDevicesNow()

networkScanner.continuousNetworkInterfaceScan()
networkScanner.continuousDeviceScan()

// await notificationService.notify({
//     type: "CONNECTED_DEVICES_RELATED",
//     message: "Unauthorized device detected: MAC 00:11:22:33:44:55",
//     severity: "CRITICAL",
//     interfaceId: 2,
//     meta: { deviceMac: "00:11:22:33:44:55", ip: "192.168.1.105" },
// });


// async function checkForUnapprovedDevices(
//   db: PrismaClient,
//   scannedDevices: { deviceMac: string; deviceIp: string }[], // shape of your scan results
// ) {
//   const deviceRepo = new DeviceRepository(db);

//   // 1. Get all whitelisted devices
//   const whitelisted = await deviceRepo.getAllWhitelistedDevices();

//   // 2. Normalize MACs for easy comparison
//   const whitelistedMacs = new Set(
//     whitelisted.map(w => w.whitelistedDeviceMac.toLowerCase())
//   );

//   // 3. Find scanned devices that are not in the whitelist
//   const unknownDevices = scannedDevices.filter(
//     d => !whitelistedMacs.has(d.deviceMac.toLowerCase())
//   );

//   // 4. Trigger notification logic if needed
//   if (unknownDevices.length > 0) {
//     // Replace with your actual notification system
//     console.log("⚠️ Unknown devices detected:", unknownDevices);
//     // notifyAdmin(unknownDevices);
//   } else {
//     console.log("✅ All scanned devices are whitelisted");
//   }
// }

