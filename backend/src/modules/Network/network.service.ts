import type { Device, NetworkInterface } from "@prisma/client";
import type { ICacheService } from "../../services/cacheService.js";
import type { OPNsenseService } from "../../services/OPNsenseService.js";
import type { INetworkRepository } from "./network.repository.js";

export class NetworkService {
    constructor(
        private readonly networkRepository: INetworkRepository,
        private readonly cacheService: ICacheService,
        private readonly opnSenseService: OPNsenseService
    ) { }

    async getNetworkInterfaces(): Promise<NetworkInterface[]> {
        const cached = await this.getNetworkInterfacesFromCache();
        if (cached) return cached;

        const networkInterfaces = await this.networkRepository.getNetworkInterfaces();
        await this.setNetworkInterfacesToCache(networkInterfaces);

        return networkInterfaces;
    }

    async upsertNetworkInterfaces(interfaces: Partial<NetworkInterface>[]): Promise<NetworkInterface[]> {
        const networkInterfaces = await this.networkRepository.upsertNetworkInterfaces(interfaces);
        await this.setNetworkInterfacesToCache(networkInterfaces);
        return networkInterfaces;
    }

    async getNetworkInterfacesFromCache(): Promise<NetworkInterface[] | null> {
        return this.cacheService.get<NetworkInterface[]>(`networkInterfaces`);
    }

    async setNetworkInterfacesToCache(interfaces: NetworkInterface[]): Promise<void> {
        await this.cacheService.set(`networkInterfaces`, interfaces, 60 * 60);
    }

    async getDevicesFromDHCPLease(): Promise<Partial<Device>[]> {
        return this.opnSenseService.getDevicesFromDHCPLease();
    }
}
