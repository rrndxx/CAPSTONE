import cron from "node-cron";
import axios from "axios";
import type { Port } from "@prisma/client";
import type { ICacheService } from "./cacheService.js";
import type { OPNsenseService } from "./OPNsenseService.js";
import type { IDeviceService } from "../modules/Device/device.service.js";
import type { NetworkService } from "../modules/Network/network.service.js";
import { mapOPNsenseInterfaces, mapOPNsenseLeasesToDevices } from "../utils/mappers.js";
import type { SpeedTestResult } from "../interfaces.js";
import { normalizeMAC } from "../utils/MACnormalizer.js";
import { deviceRepo, notificationService } from "../server.js";

export interface INetworkScanner {
    continuousDeviceScan(): void;
    continuousNetworkInterfaceScan(): void;
    scanOpenPorts(ip: string, deviceId: number): Promise<Port[]>;
    identifyDeviceOS(ip: string): Promise<string>;
    runSpeedTest(): Promise<SpeedTestResult>
    runISPHealth(): Promise<any>
}

export class NetworkScanner implements INetworkScanner {
    constructor(
        private readonly deviceService: IDeviceService,
        private readonly networkService: NetworkService,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService,
        private readonly pythonScannerURL: string
    ) { }

    continuousDeviceScan(): void {
        cron.schedule("*/1 * * * *", async () => {
            console.log("Scheduled device scanner starting...", new Date().toISOString());
            await this.scanDevicesNow();
        });
    }

    async scanDevicesNow() {
        try {
            const interfaces = await this.networkService.getNetworkInterfaces();
            const interfaceMap: Record<string, number> = {};
            interfaces.forEach(iface => { interfaceMap[iface.identifier] = iface.interfaceId; });

            const leaseResponse = await this.opnSenseService.getDevicesFromDHCPLease();
            const devices = mapOPNsenseLeasesToDevices(leaseResponse, interfaceMap);

            // const whitelistedDevices = await this.deviceService.getAllWhitelistedDevices();
            // const whitelistedMACs = new Set(whitelistedDevices.map((w: any) => w.whitelistedDeviceMac.toLowerCase()))
            // const unknownDevices = devices.filter(d => !whitelistedMACs.has(d.deviceMac?.toLowerCase()))

            // if (unknownDevices.length > 0) {
            //     unknownDevices.forEach(async (d) => {
            //         await notificationService.notify({
            //             type: "CONNECTED_DEVICES_RELATED",
            //             message: `Unauthorized device detected: ${d.deviceIp}, ${d.deviceHostname}, ${d.deviceMac} at ${Date()}.`,
            //             severity: "WARNING",
            //             interfaceId: 2,
            //             meta: {
            //                 ip: d.deviceIp,
            //                 hostname: d.deviceHostname,
            //                 mac: d.deviceMac
            //             },
            //         })
            //     })
            // }

            const allDevicesFromDB = await this.deviceService.getAllDevicesFromDB(2);

            const devicesToUpsert = devices.filter(d => d.interfaceId);
            await Promise.all(devicesToUpsert.map(d =>
                this.deviceService.upsertDevice(d, d.interfaceId!)
            ));

            const activeKeys = new Set(
                devices.map(d => `${normalizeMAC(d.deviceMac ?? '')}-${d.interfaceId}`)
            );

            const downCandidates = allDevicesFromDB?.filter(
                dbDev => !activeKeys.has(`${(dbDev.deviceMac)}-${dbDev.interfaceId}`)
            );

            if (!downCandidates) throw new Error('downCandidates are undefinedf')

            await Promise.all(downCandidates.map(dev =>
                this.deviceService.updateDeviceStatus(dev.deviceId, "DOWN")
            ));

            // await this.cacheService.set("devices", devices, 60);

            console.log(
                `Initial device scan updated ${devices.length} devices, marked ${downCandidates.length} as DOWN.`
            );
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

    continuousNetworkInterfaceScan(): void {
        cron.schedule("*/60 * * * *", async () => {
            console.log("Scheduled network interface scanner starting...", new Date().toISOString());
            await this.scanInterfacesNow();
        });
    }

    async scanOpenPorts(ip: string, deviceId: number): Promise<Port[]> {
        const res = await axios.get(`${this.pythonScannerURL}/scan_ports/`, { params: { ip } });

        return res.data.ports.map((p: any) => ({
            portNumber: p.port,
            protocol: p.name ?? "tcp",
            status: p.state === "open" ? "OPEN" : "CLOSED",
            firstSeen: new Date(),
            lastSeen: new Date(),
            deviceId
        }));
    }

    async identifyDeviceOS(ip: string): Promise<string> {
        const res = await axios.get(`${this.pythonScannerURL}/detect_os/`, { params: { ip } });

        return res.data.os ?? "Unknown OS";
    }

    async runSpeedTest(): Promise<SpeedTestResult> {
        const response = await axios.get<SpeedTestResult>(`${this.pythonScannerURL}/speedtest/`);

        return response.data;
    }

    async runISPHealth(): Promise<any> {
        const response = await axios.get(`${this.pythonScannerURL}/isp_health/`);
        return response.data;
    }

    async portScannerFromHostMachine(): Promise<any> {

    }

}
