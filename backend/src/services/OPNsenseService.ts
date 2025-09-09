import https from "https";
import axios, { type AxiosRequestConfig } from "axios";

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
        return this._request("post", "/api/kea/leases4/search/");
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

    // FIREWALL
    async getFirewallStream(): Promise<any> {
        return this._request("get", "/api/diagnostics/firewall/stream_log")
    } // text/event-stream

}
