import type { Device, NetworkInterface } from "@prisma/client";
import type { OPNInterface, OPNsenseLeaseResponse } from "../interfaces.js";

export function mapOPNsenseLeasesToDevices(response: OPNsenseLeaseResponse, networkInterfaces: Record<string, number>): Partial<Device>[] {
    return response.rows
        .map(lease => {
            const interfaceId = networkInterfaces[lease.if_name];
            if (!interfaceId) {
                console.warn(
                    `No interface found for lease ${lease.hwaddr} on ${lease.if_name}, skipping.`
                );
                return null;
            }

            return {
                deviceIp: lease.address,
                deviceMac: lease.hwaddr,
                macInfo: lease.mac_info ?? null,
                deviceHostname: lease.hostname ?? null,
                interfaceId,
            } as Partial<Device>;
        })
        .filter((d): d is Partial<Device> => d !== null);
}

export function mapOPNsenseInterfaces(json: OPNInterface[]): Partial<NetworkInterface>[] {
    return json
        .filter(iface => iface.is_physical && iface.identifier)
        .map(iface => {
            return {
                name: iface.description ?? iface.identifier,
                identifier: iface.identifier,
                linkType: iface.link_type ?? "static",
                ipv4: iface.addr4 ?? "",
                subnet: iface.config?.subnet ?? "",
                gateways: iface.gateways ?? [],
                routes: iface.routes ?? [],
                status: iface.enabled ?? false,
                devices: [],
                whitelistedDevices: [],
                blacklistedDevices: [],
                alerts: [],
                BandwidthHourly: [],
                BandwidthDaily: []
            } as Partial<NetworkInterface>;
        });
}