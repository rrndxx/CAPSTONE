import type { PrismaClient } from "@prisma/client/extension";
import { SophosService } from "../../services/sophosService.js";
import type { INetworkRepository } from "./network.interface.js";

export class NetworkRepository implements INetworkRepository {
    constructor(
        private readonly db: PrismaClient,
        private readonly networkService2: SophosService
    ) { }
    getWiredDevices(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getWirelessDevices(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    async getSystemHealthInfo(): Promise<any> {
        const result = await this.networkService2.SNMP.getSystemHealthInfo()

        return result
    }
    getNetworkInterfaceInfo(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    blockDevice(): void {
        throw new Error("Method not implemented.");
    }
    limitDeviceBandwidth(): void {
        throw new Error("Method not implemented.");
    }

}