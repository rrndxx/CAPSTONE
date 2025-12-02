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
import { notificationService } from "../server.js";
import db from "../config/db.js";

export interface INetworkScanner {
    continuousDeviceScan(): void;
    continuousNetworkInterfaceScan(): void;
    continuousBandwidthScan(): void;

    scanOpenPorts(ip: string, deviceId: number): Promise<Port[]>;
    identifyDeviceOS(ip: string): Promise<string>;
    runSpeedTest(): Promise<SpeedTestResult>;
    runISPHealth(): Promise<any>;
}

export class NetworkScanner implements INetworkScanner {
    constructor(
        private readonly deviceService: IDeviceService,
        private readonly networkService: NetworkService,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService,
        private readonly pythonScannerURL: string
    ) { }

    // ---------------------------------------------------------------------
    // 📌 CONTINUOUS BANDWIDTH SCAN  (DIRECT DATABASE — NO SERVICES)
    // ---------------------------------------------------------------------
    continuousBandwidthScan(): void {
        // Every 30 seconds
        cron.schedule("*/30 * * * * *", async () => {
            await this.collectBandwidthSnapshots();
        });
    }

    private async collectBandwidthSnapshots() {
        try {
            // FETCH DEVICE + INTERFACE SNAPSHOTS
            const perDeviceRes = await axios.get("http://localhost:4000/network/traffic/per-device");
            const perInterfaceRes = await axios.get("http://localhost:4000/network/traffic/interface");

            const perDeviceData = perDeviceRes.data.data; // interface -> { records: [...] }
            const perInterfaceData = perInterfaceRes.data.data.interfaces; // interface -> stats

            const now = new Date();
            const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
            const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // -----------------------------------------------------------------
            // 📌 SAVE PER-DEVICE BANDWIDTH
            // -----------------------------------------------------------------
            for (const ifaceKey of Object.keys(perDeviceData)) {
                const iface = perDeviceData[ifaceKey];
                if (!iface.records) continue;

                for (const record of iface.records) {
                    // Find device by IP
                    const dev = await db.device.findFirst({ where: { deviceIp: record.address } });
                    if (!dev) continue;

                    const up = BigInt(record.cumulative_bytes_out ?? 0);
                    const down = BigInt(record.cumulative_bytes_in ?? 0);

                    // RAW SNAPSHOT
                    await db.bandwidthUsage.create({
                        data: {
                            deviceId: dev.deviceId,
                            upload: up,
                            download: down,
                            timestamp: new Date()
                        }
                    });

                    // HOURLY UPSERT
                    await db.bandwidthHourly.upsert({
                        where: { deviceId_hour: { deviceId: dev.deviceId, hour: currentHour } },
                        update: { upload: up, download: down },
                        create: {
                            deviceId: dev.deviceId,
                            interfaceId: dev.interfaceId,
                            hour: currentHour,
                            upload: up,
                            download: down
                        }
                    });

                    // DAILY UPSERT
                    await db.bandwidthDaily.upsert({
                        where: { deviceId_day: { deviceId: dev.deviceId, day: currentDay } },
                        update: { upload: up, download: down },
                        create: {
                            deviceId: dev.deviceId,
                            interfaceId: dev.interfaceId,
                            day: currentDay,
                            upload: up,
                            download: down
                        }
                    });
                }
            }

            // -----------------------------------------------------------------
            // 📌 SAVE INTERFACE BANDWIDTH
            // -----------------------------------------------------------------
            for (const ifaceKey of Object.keys(perInterfaceData)) {
                const iface = perInterfaceData[ifaceKey];
                const dbIface = await db.networkInterface.findUnique({ where: { identifier: iface.device } });
                if (!dbIface) continue;

                const up = BigInt(iface["bytes transmitted"] ?? 0);
                const down = BigInt(iface["bytes received"] ?? 0);

                // HOURLY UPSERT (deviceId = 0)
                await db.bandwidthHourly.upsert({
                    where: { deviceId_hour: { deviceId: 0, hour: currentHour } },
                    update: { upload: up, download: down, interfaceId: dbIface.interfaceId },
                    create: {
                        deviceId: 0,
                        interfaceId: dbIface.interfaceId,
                        hour: currentHour,
                        upload: up,
                        download: down
                    }
                });

                // DAILY UPSERT (deviceId = 0)
                await db.bandwidthDaily.upsert({
                    where: { deviceId_day: { deviceId: 0, day: currentDay } },
                    update: { upload: up, download: down, interfaceId: dbIface.interfaceId },
                    create: {
                        deviceId: 0,
                        interfaceId: dbIface.interfaceId,
                        day: currentDay,
                        upload: up,
                        download: down
                    }
                });
            }

            console.log(
                `[Bandwidth] Updated per-device: ${Object.keys(perDeviceData).length}, per-interface: ${Object.keys(perInterfaceData).length}`
            );
        } catch (err) {
            console.error("Bandwidth scan failed:", err);
        }
    }

    // ---------------------------------------------------------------------
    // 📌 DO NOT TOUCH — PORT SCANNER
    // ---------------------------------------------------------------------
    continuousPortScan(): void {
        cron.schedule("*/5 * * * *", async () => {
            console.log("Scheduled port scanner starting...", new Date().toISOString());
            await this.scanPortsForAllDevices();
        });
    }

    async scanPortsForAllDevices(): Promise<void> {
        const MALICIOUS_PORTS = [21, 23, 135, 139, 445, 3389, 5900, 1433, 3306, 5432, 6379, 27017];

        try {
            const devices = await this.deviceService.getAllDevicesFromDB(2);
            if (!devices || devices.length === 0) return;

            for (const dev of devices) {
                if (!dev.deviceIp || dev.status !== "UP") continue;

                try {
                    const portResults = await this.scanOpenPorts(dev.deviceIp, dev.deviceId);

                    for (const port of portResults) {
                        await this.deviceService.upsertDevicePort(dev.deviceId, port);

                        if (MALICIOUS_PORTS.includes(port.portNumber)) {
                            await notificationService.notify({
                                type: "ACTION",
                                severity: "CRITICAL",
                                interfaceId: dev.interfaceId ?? 2,
                                message: `⚠️ Malicious port detected on ${dev.deviceIp}: Port ${port.portNumber}`,
                                meta: { ip: dev.deviceIp, port: port.portNumber }
                            });
                        }
                    }
                } catch (e) {
                    console.error(`Port scan failed for ${dev.deviceIp}`, e);
                }
            }
        } catch (err) {
            console.error("Port scan job failed:", err);
        }
    }

    // ---------------------------------------------------------------------
    // 📌 DO NOT TOUCH — DEVICE SCANNER
    // ---------------------------------------------------------------------
    continuousDeviceScan(): void {
        cron.schedule("*/1 * * * *", async () => {
            console.log("Device scan starting...");
            await this.scanDevicesNow();
        });
    }

    async scanDevicesNow() {
        try {
            const interfaces = await this.networkService.getNetworkInterfaces();
            const interfaceMap: Record<string, number> = {};
            interfaces.forEach(i => (interfaceMap[i.identifier] = i.interfaceId));

            const leases = await this.opnSenseService.getDevicesFromDHCPLease();
            const devices = mapOPNsenseLeasesToDevices(leases, interfaceMap);

            const allDevices = await this.deviceService.getAllDevicesFromDB(2);

            await Promise.all(
                devices
                    .filter(d => d.interfaceId)
                    .map(d => this.deviceService.upsertDevice(d, d.interfaceId!))
            );

            const activeKeys = new Set(
                devices.map(d => `${normalizeMAC(d.deviceMac ?? "")}-${d.interfaceId}`)
            );

            const down = allDevices?.filter(
                d => !activeKeys.has(`${d.deviceMac}-${d.interfaceId}`)
            );

            await Promise.all(
                down.map(dev => this.deviceService.updateDeviceStatus(dev.deviceId, "DOWN"))
            );

            console.log(`Updated ${devices.length} devices, marked ${down.length} DOWN`);
        } catch (e) {
            console.error("Device scan error:", e);
        }
    }

    // ---------------------------------------------------------------------
    // 📌 DO NOT TOUCH — INTERFACE SCANNER
    // ---------------------------------------------------------------------
    continuousNetworkInterfaceScan(): void {
        cron.schedule("*/60 * * * *", async () => {
            await this.scanInterfacesNow();
        });
    }

    async scanInterfacesNow() {
        try {
            const res = await this.opnSenseService.getInterfacesInfo();
            const interfaces = mapOPNsenseInterfaces(res.rows);
            await this.networkService.upsertNetworkInterfaces(interfaces);
        } catch (e) {
            console.error("Interface scan error:", e);
        }
    }

    // ---------------------------------------------------------------------
    // 📌 DO NOT TOUCH — PYTHON CALLS
    // ---------------------------------------------------------------------
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
        const res = await axios.get(`${this.pythonScannerURL}/speedtest/`);
        return res.data;
    }

    async runISPHealth(): Promise<any> {
        const res = await axios.get(`${this.pythonScannerURL}/isp_health/`);
        return res.data;
    }
}
