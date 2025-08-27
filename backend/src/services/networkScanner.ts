import os from "os";
import cron from "node-cron";
import http from "http";
import type { ICacheService } from "./cacheService.js";
import type { IDeviceRepository } from "../modules/DeviceModule/device.interface.js";

export class NetworkScannerService {
    constructor(
        private readonly deviceRepo: IDeviceRepository,
        private readonly cache: ICacheService,
    ) { }

    getLocalIP(): string | null {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            const iface = interfaces[name];
            if (!iface) continue;

            for (const alias of iface) {
                if (alias.family === "IPv4" && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return "192.168.254.103";
    }

    continuousScan(localIP: string) {
        cron.schedule("*/3 * * * *", async () => {
            console.log("Scheduled scanner starting...", new Date().toISOString());

            if (!localIP) {
                console.error("Error getting local ip")
                return
            }

            try {
                const options = {
                    hostname: localIP,
                    port: 49090,
                    path: "/1/devices?auth=fing_loc_api123",
                    method: "GET",
                    insecureHTTPParser: true,
                };

                // Fetch devices sa FING Local API
                const scannerData = await new Promise<{ networkId: string; devices: any[] }>((resolve, reject) => {
                    const req = http.request(options, (res) => {
                        let data = "";
                        res.on("data", (chunk) => (data += chunk));
                        res.on("end", () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (err) {
                                reject(err);
                            }
                        });
                    });
                    req.on("error", reject);
                    req.end();
                });

                const { networkId, devices } = scannerData;

                await this.deviceRepo.upsertNetwork(networkId)
                await this.deviceRepo.upsertDevices(devices, networkId)

                const allDevices = await this.deviceRepo.findAllDevices()
                await this.cache.set("devices:all", JSON.stringify(allDevices), 60)

                console.log("Done scanning:", allDevices.length, "devices");
            } catch (err) {
                console.error("Scanner error:", err);
            }
        })
    }
}
