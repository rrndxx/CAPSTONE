import type { NetworkInterface } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

export interface INetworkRepository {
    getNetworkInterfaces(): Promise<NetworkInterface[]>;
    upsertNetworkInterface(networkInterface: Partial<NetworkInterface>): Promise<NetworkInterface>;
    upsertNetworkInterfaces(networkInterfaces: Partial<NetworkInterface>[]): Promise<NetworkInterface[]>;
}

export class NetworkRepository implements INetworkRepository {
    constructor(private readonly db: PrismaClient) { }

    async getNetworkInterfaces(): Promise<NetworkInterface[]> {
        return this.db.networkInterface.findMany();
    }

    async upsertNetworkInterface(networkInterface: Partial<NetworkInterface>): Promise<NetworkInterface> {
        if (!networkInterface.identifier) {
            throw new Error("Network interface must have an identifier to upsert.");
        }

        return this.db.networkInterface.upsert({
            where: { identifier: networkInterface.identifier },
            create: {
                name: networkInterface.name ?? networkInterface.identifier,
                identifier: networkInterface.identifier,
                linkType: networkInterface.linkType ?? "static",
                ipv4: networkInterface.ipv4 ?? "",
                subnet: networkInterface.subnet ?? "",
                gateways: networkInterface.gateways ?? [],
                routes: networkInterface.routes ?? [],
                status: networkInterface.status ?? false,
            },
            update: {
                name: networkInterface.name ?? networkInterface.identifier,
                linkType: networkInterface.linkType ?? "static",
                ipv4: networkInterface.ipv4 ?? "",
                subnet: networkInterface.subnet ?? "",
                gateways: networkInterface.gateways ?? [],
                routes: networkInterface.routes ?? [],
                status: networkInterface.status ?? false,
            },
        });
    }

    async upsertNetworkInterfaces(networkInterfaces: Partial<NetworkInterface>[]): Promise<NetworkInterface[]> {
        return Promise.all(networkInterfaces.map(iface => this.upsertNetworkInterface(iface)));
    }
}
