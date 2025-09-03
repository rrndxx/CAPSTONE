import http from "http"
import cron from "node-cron"
import type { Device } from "@prisma/client";
import type { IDeviceRepository } from "../modules/Device/device.interface.js";
import type { ICacheService } from "./cacheService.js";

export interface INetworkScanner {
    getLocalIP(): Promise<string>
    getDevices(): Promise<Device[]>
    continuousScan(localIP: string): void
}

export async function getDevicesFromFing(localIP: string): Promise<{ networkId: string; devices: any[] }> {
    const options = {
        hostname: localIP,
        port: 49090,
        path: "/1/devices?auth=fing_loc_api123",
        method: "GET",
        insecureHTTPParser: true,
    };

    return new Promise((resolve, reject) => {
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
}

export class NetworkScanner implements INetworkScanner {
    constructor(
        private readonly deviceRepo: IDeviceRepository,
        private readonly cacheService: ICacheService,
    ) { }

    getDevices(): Promise<Device[]> {
        throw new Error("Method not implemented.");
    }

    continuousScan(localIP: string): void {
        cron.schedule("*/3 * * * *", async () => {
            console.log("Scheduled scanner starting...", new Date().toISOString());

            if (!localIP) {
                console.error("Error getting local ip");
                return;
            }

            try {
                const { networkId, devices } = await getDevicesFromFing(localIP);

                // await this.deviceRepo.upsertNetwork(networkId);
                // await this.deviceRepo.upsertDevices(devices, networkId);

                const allDevices = await this.deviceRepo.getAllDevices();
                await this.cacheService.set("devices:all", JSON.stringify(allDevices), 60);

                console.log("Done scanning:", allDevices.length, "devices");
            } catch (err) {
                console.error("Scanner error:", err);
            }
        });
    }

    getLocalIP(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
