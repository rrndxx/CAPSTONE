import type { DeviceList, DeviceModel, NetworkScan } from "./device.model.js";
import { DeviceRepository } from "./device.repository.js";
import { CacheService } from "../../../services/cacheService.js";

export class DeviceService {
    constructor(
        private readonly deviceRepo: DeviceRepository,
        private readonly cache: CacheService,
        // private readonly networkScanner = new NetworkScannerService(),
        // private readonly portScanner = new PortScannerService()

    ) { }

    async getAllDevices() {
        const cachedDevices = await this.cache.get("devices:all")
        if (cachedDevices) return JSON.parse(cachedDevices)

        const devices = await this.deviceRepo.findAllDevices()
        if (!devices) throw new Error("Error getting all device from the DB.")
        await this.cache.set("devices:all", JSON.stringify(devices), 60)

        return devices
    }

    async insertDevice() {
        throw new Error("wa pa naimplement na function")
    }

    async updateDeviceListType(deviceId: DeviceList["deviceId"], type: DeviceList["type"]) {
        const result = await this.deviceRepo.upsertDeviceList(deviceId, type)
        if (!result) throw new Error("Error updating device privilege type")

        return result
    }

    async getDeviceOpenPorts(deviceIP: DeviceModel["ip"]) {
        throw new Error("wa pa naimplement na function")
    }
}

// =======================================================================================================================================

// WA NAREFACTOR NA PREVIOUS CODE


// export async function getAllDevices() {
//     // kwaon daan ang mga nakacache na devices
//     const cachedDevices = await redis.get("devices:all");
//     if (cachedDevices) {
//         return JSON.parse(cachedDevices)
//     }

//     // if walay nakacache na device, kuha adto directly sa database
//     const devices = await db.device.findMany({ include: { network: true } });

//     // dayon isud sa cache
//     await redis.set("devices:all", JSON.stringify(devices), "EX", 60)

//     return devices;
// }

// export async function insertDevices() {
//     const options = {
//         hostname: "192.168.254.103",
//         // hostname: "192.168.3.131",
//         port: 49090,
//         path: "/1/devices?auth=fing_loc_api123",
//         method: "GET",
//         insecureHTTPParser: true,
//     };

//     const networkscan: NetworkScan = await new Promise((resolve, reject) => {
//         const req = http.request(options, (res) => {
//             let data = "";
//             res.on("data", (chunk) => (data += chunk));
//             res.on("end", () => {
//                 try {
//                     resolve(JSON.parse(data));
//                 } catch (err) {
//                     reject(err);
//                 }
//             });
//         });
//         req.on("error", reject);
//         req.end();
//     });

//     // iupsert ang network
//     await db.network.upsert({
//         where: { networkId: networkscan.networkId },
//         update: {},
//         create: { networkId: networkscan.networkId },
//     });

//     // upsert each device
//     for (const d of networkscan.devices) {
//         await db.device.upsert({
//             where: { mac: d.mac },
//             update: {
//                 state: d.state,
//                 ip: d.ip,
//                 last_seen: new Date().toISOString(),
//             },
//             create: {
//                 mac: d.mac,
//                 ip: d.ip,
//                 state: d.state,
//                 name: d.name,
//                 type: d.type ?? null,
//                 make: d.make ?? null,
//                 model: d.model ?? null,
//                 first_seen: new Date().toISOString(),
//                 last_seen: new Date().toISOString(),
//                 networkId: networkscan.networkId,
//             },
//         });
//     }

//     // kuhaon daan ang suds database
//     const allDevices = await db.device.findMany({ include: { network: true } });

//     //isud sa redis
//     await redis.set("devices:all", JSON.stringify(allDevices), "EX", 60);

//     return allDevices;
// }

// export async function updateDeviceListType(mac: string, type: "WHITELIST" | "BLACKLIST") {
//     // kuhaon sa daan ang device with this mac
//     const device = await db.device.findUnique({
//         where: { mac },
//     });

//     if (!device) {
//         throw new Error(`Device with MAC ${mac} not found`);
//     }

//     const updated = await db.deviceList.upsert({
//         where: {
//             deviceId_type: { deviceId: device.deviceId, type },
//         },
//         update: {},
//         create: {
//             deviceId: device.deviceId,
//             type,
//         },
//     });

//     return updated;
// }

// export async function getDeviceOpenPorts(mac: string) {
//     const device = await db.device.findUnique({
//         where: { mac }
//     });

//     if (!device) {
//         throw new Error(`Device with MAC ${mac} not found.`)
//     }

//     const openPorts = await openPortScanner()

//     if (openPorts != null) {
//         // insert to database along with its status/
//     }

//     return openPorts;
// }

