import cron from "node-cron";
import type { ICacheService } from "./cacheService.js";
import type { OPNsenseLeaseResponse } from "../interfaces.js";
import type { OPNsenseService } from "./OPNsenseService.js";
import type { NetworkInterface } from "@prisma/client";
import type { DeviceService } from "../modules/Device/device.service.js";
import type { NetworkService } from "../modules/Network/network.service.js";
import { mapOPNsenseInterfaces, mapOPNsenseLeasesToDevices } from "../utils/mappers.js";

export interface INetworkScanner {
    continuousDeviceScan(): void;
    continuousNetworkInterfaceScan(): void
}

export class NetworkScanner implements INetworkScanner {
    constructor(
        private readonly deviceService: DeviceService,
        private readonly networkService: NetworkService,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService
    ) { }

    async scanDevicesNow() {
        try {
            const interfaces = await this.networkService.getNetworkInterfaces();

            const interfaceMap: Record<string, number> = {};
            interfaces.forEach(iface => {
                interfaceMap[iface.identifier] = iface.interfaceId;
            });

            const leaseResponse = await this.opnSenseService.getDevicesFromDHCPLease();
            const devices = mapOPNsenseLeasesToDevices(leaseResponse, interfaceMap);

            const devicesToUpsert = devices.filter(d => d.interfaceId);
            await Promise.all(devicesToUpsert.map(d => this.deviceService.upsertDevice(d, d.interfaceId!)));

            await this.cacheService.set("devices", devices, 60);

            console.log(`Initial device scan updated ${devices.length} devices.`);
        } catch (err) {
            console.error("Device scan error:", err);
        }
    }

    async scanInterfacesNow() {
        try {
            const response = await this.opnSenseService.getInterfacesInfo();
            const interfaces = mapOPNsenseInterfaces(response.rows);

            await this.networkService.upsertNetworkInterfaces(interfaces);
            console.log(`Initial network scan updated ${interfaces.length} interfaces.`);
        } catch (err) {
            console.error("Network scan error:", err);
        }
    }

    continuousDeviceScan(): void {
        cron.schedule("*/1 * * * *", async () => {
            console.log("Scheduled device scanner starting...", new Date().toISOString());

            await this.scanDevicesNow()
        });
    }

    continuousNetworkInterfaceScan(): void {
        cron.schedule("*/60 * * * *", async () => {
            console.log("Scheduled network interface scanner starting...", new Date().toISOString());

            await this.scanInterfacesNow()
        });
    }

}






