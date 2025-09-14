import type { Device, NetworkInterface } from "@prisma/client";
import type { ICacheService } from "../../services/cacheService.js";
import type { OPNsenseService } from "../../services/OPNsenseService.js";
import type { INetworkRepository } from "./network.repository.js";
import type { SpeedTestResult } from "../../interfaces.js";
import { adGuardService, networkScanner } from "../../server.js";

export class NetworkService {
    constructor(
        private readonly networkRepository: INetworkRepository,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService
    ) { }

    async getAccessList(): Promise<any> {
        return adGuardService.getControlAccessList()
    }

    async unblockUser(ip: Device['deviceIp']): Promise<any> {
        return adGuardService.unblockUser(ip)
    }

    async blockUser(ip: Device['deviceIp']): Promise<any> {
        return adGuardService.blockUser(ip)
    }

    async blockDomain(domain: string): Promise<any> {
        return adGuardService.blockDomain(domain)
    }

    async getDeviceQueryLogs(deviceIp: Device['deviceIp']): Promise<any> {
        return adGuardService.getDeviceQueryLog(deviceIp)
    }

    async getNetworkInterfacesFromCache(): Promise<NetworkInterface[] | null> {
        return this.cacheService.get<NetworkInterface[]>(`networkInterfaces`);
    }

    async setNetworkInterfacesToCache(interfaces: NetworkInterface[]): Promise<void> {
        await this.cacheService.set(`networkInterfaces`, interfaces, 60 * 60);
    }

    async getNetworkInterfaces(): Promise<NetworkInterface[]> {
        const cachedInterfaces = await this.getNetworkInterfacesFromCache();

        if (cachedInterfaces) return cachedInterfaces;

        const networkInterfaces = await this.networkRepository.getNetworkInterfaces();

        await this.setNetworkInterfacesToCache(networkInterfaces);

        return networkInterfaces;
    }

    async upsertNetworkInterfaces(interfaces: Partial<NetworkInterface>[]): Promise<NetworkInterface[]> {
        const networkInterfaces = await this.networkRepository.upsertNetworkInterfaces(interfaces);
        await this.setNetworkInterfacesToCache(networkInterfaces);
        return networkInterfaces;
    }

    async runSpeedTest(): Promise<SpeedTestResult> {
        return networkScanner.runSpeedTest()
    }

    async runISPHealth(): Promise<any> {
        return networkScanner.runISPHealth()
    }

    async getDNSStats(): Promise<any> {
        return adGuardService.getAllStats()
    }

}
