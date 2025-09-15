import https from "https";
import axios, { type AxiosRequestConfig } from "axios";
import type { Device } from "@prisma/client";

export class OPNsenseService {
    private baseUrl: string;
    private apiKey: string;
    private apiSecret: string;
    private httpsAgent: https.Agent;

    constructor(baseUrl: string, apiKey: string, apiSecret: string) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    private async _request<T = any>(
        method: "get" | "post" | "put" | "delete",
        endpoint: string,
        data?: any
    ): Promise<T> {
        const config: AxiosRequestConfig = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            auth: {
                username: this.apiKey,
                password: this.apiSecret,
            },
            data,
            httpsAgent: this.httpsAgent,
        };

        const res = await axios(config);
        return res.data;
    }

    // DEVICES

    async getDevicesFromDHCPLease(): Promise<any> {
        return this._request("post", "/api/dnsmasq/leases/search/");
    }

    async blockDevice(device: Device): Promise<any> {
        const payload = {
            host: {
                host: device.deviceHostname ?? "",
                domain: "",
                local: "0",
                ip: device.deviceIp ?? "",
                aliases: "",
                cnames: "",
                client_id: "",
                hwaddr: device.deviceMac,
                lease_time: "",
                set_tag: "",
                ignore: "1",
                descr: `Blocked ${device.deviceMac}`,
                comments: ""
            }
        };

        // 1. Add static host
        await this._request("post", "/api/dnsmasq/settings/add_host/", payload);

        // 2. Save config
        await this._request("post", "/api/dnsmasq/settings/set", {});

        // 3. Reconfigure service
        return this._request("post", "/api/dnsmasq/service/reconfigure", {});
    }

    async unblockDevice(device: Device): Promise<any> {
        // 1. Get all host overrides
        const hosts = await this._request("post", "/api/dnsmasq/settings/search_host/");
        const row = hosts.rows.find((h: any) => h.hwaddr === device.deviceMac);

        if (!row) {
            throw new Error(`No mapping found for MAC ${device.deviceMac}`);
        }

        const uuid = row.uuid;

        // 2. Delete that host override
        await this._request("post", `/api/dnsmasq/settings/del_host/${uuid}`);

        // 3. Save Config
        await this._request("post", "/api/dnsmasq/settings/set", {});

        // 4. Reconfigure service
        return this._request("post", "/api/dnsmasq/service/reconfigure", {});
    }

    // SYSTEM

    async getSystemInformation(): Promise<any> {
        return this._request("get", "/api/diagnostics/system/system_information")
    }

    async getSystemResources(): Promise<any> {
        return this._request("get", "/api/diagnostics/system/system_resources")
    }

    async getSystemTime(): Promise<any> {
        return this._request("get", "/api/diagnostics/system/system_time")
    }

    async getCPUType(): Promise<any> {
        return this._request("get", "/api/diagnostics/cpu_usage/getcputype")
    }

    async getCPUUsage(): Promise<any> {
        return this._request("get", "/api/diagnostics/cpu_usage/stream")
    } // text/event-stream

    // NETWORK

    async searchGateway(): Promise<any> {
        return this._request("get", "/api/routing/settings/search_gateway")
    }

    async getInterfaceNames(): Promise<any> {
        return this._request("get", "/api/diagnostics/interface/get_interface_names")
    }

    async getInterfacesInfo(): Promise<any> {
        return this._request("post", "/api/interfaces/overview/interfaces_info")
    }

    async getServices(): Promise<any> {
        return this._request("get", "/api/core/service/search")
    }

    // BANDWIDTH

    async getInterfaceTraffic(): Promise<any> {
        return this._request("get", "/api/diagnostics/traffic/interface")
    }

    async getTrafficStream(): Promise<any> {
        return this._request("get", "/api/diagnostics/traffic/stream/1")
    } // text/event-stream

    async getPerDeviceTraffic(): Promise<any> {
        return this._request("get", "/api/diagnostics/traffic/top/lan,opt1,wan")
    }

    // FIREWALL
    async getFirewallStream(): Promise<any> {
        return this._request("get", "/api/diagnostics/firewall/stream_log")
    } // text/event-stream

}
