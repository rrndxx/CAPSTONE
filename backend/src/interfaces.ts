import type { DeviceStatus } from "@prisma/client"

// export interface Network {
//     networkId: number
//     networkIp: string
//     devices: Device[]
//     totalBandwidthUsage: {
//         upload: number
//         download: number
//     }
//     whitelistedDevices: WhitelistedDevice[]
//     blacklistedDevices: BlacklistedDevice[]
// }

// export interface Device {
//     deviceId: number
//     deviceIp: string
//     deviceMac: string
//     deviceHostname: string
//     deviceOS?: string
//     authorized: boolean
//     bandwidthUsage: BandwidthUsage[]
//     openPorts?: Port[]
//     visitedSites?: VisitedSite[]
//     parentNetworkId: number
//     status: "UP" | "DOWN"
//     first_seen: Date
//     last_seen: Date
// }

// export interface BandwidthUsage {
//     upload: number
//     download: number
//     timestamp: Date
// }

// export interface Port {
//     portId: number
//     portNumber: number
//     protocol?: string
//     status: "OPEN" | "CLOSED"
//     first_seen: Date
//     last_seen: Date
// }

// export interface VisitedSite {
//     siteId: number
//     siteIp: string
//     siteDomainName: string
//     first_seen: Date
//     last_seen: Date
// }

// export interface BlockedSites {
//     blockedSiteId: number
//     siteIp: string
//     siteDomain: string
//     reason?: string
//     created_at: Date
//     updated_at: Date
// }

// export interface WhitelistedDevice {
//     whitelistedDeviceId: number
//     whitelistedDeviceMac: string
//     created_at: Date
// }

// export interface BlacklistedDevice {
//     blacklistedDeviceId: number
//     blacklistedDeviceMac: string
//     created_at: Date
// }

// export interface Alerts {
//     alertId: number
//     alertType: "LOGIN" | "CONNECTED-DEVICES RELATED" | "ACTION" | "BANDWIDTH RELATED"
//     message: string
//     severity: "INFO" | "WARNING" | "CRITICAL"
//     networkId: number
//     resolved: boolean
//     timestamp: Date
// }

export interface OPNsenseLease {
    expire: number;
    hwaddr: string;
    iaid: string;
    address: string;
    hostname: string;
    client_id: string;
    if: string;
    if_descr: string;
    if_name: string;
    mac_info: string;
    is_reserved: string;
}

export interface OPNsenseLeaseResponse {
    total: number;
    rowCount: number;
    current: number;
    rows: OPNsenseLease[];
    interfaces: Record<string, string>;
}

export type LeaseDevice = {
    deviceIp: string;
    deviceMac: string;
    macInfo?: string | null;
    deviceHostname?: string | null;
    deviceOS?: string | null;
    authorized?: boolean;
    status?: DeviceStatus;
    interfaceId: number | null;
};

export interface OPNInterface {
    description: string;
    identifier: string;
    link_type: string;
    addr4: string;
    config: { subnet: string };
    gateways?: string[];
    routes?: string[];
    enabled: boolean;
    is_physical: boolean;
}

export interface SpeedTestResult {
  isp: string;
  client_ip: string;
  server: string;
  ping_ms: number;
  download_bps: number;
  upload_bps: number;
  timestamp: string;
}
