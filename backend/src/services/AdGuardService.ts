import axios, { type AxiosRequestConfig } from "axios";
import https from "https";

interface IAdGuard {
    getTopDomains(): Promise<any>;
    getTopTalkers(): Promise<any>;
    getDNSQueries(): Promise<any>;
    getBlockedDomains(): Promise<any>;
    blockDomain(domain: string): Promise<any>;
}

export class AdGuardService implements IAdGuard {
    private baseUrl: string;
    private username: string;
    private password: string;
    private httpsAgent: https.Agent;

    constructor(baseUrl: string, username: string, password: string) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.username = username;
        this.password = password;
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
                username: this.username,
                password: this.password,
            },
            data,
            httpsAgent: this.httpsAgent,
        };

        const res = await axios(config);
        return res.data;
    }

    async getQueryLog(): Promise<any> {
        const queryLog = await this._request('get', '/control/querylog?older_than=&limit=20')
        return queryLog
    }

    async getControlStatus(): Promise<any> {
        const status = await this._request('get', "/control/status")
        return status
    }

    async getTopDomains(): Promise<any> {
        const stats = await this._request("get", "/control/stats");
        return stats.top_queried_domains || [];
    }

    async getTopTalkers(): Promise<any> {
        const stats = await this._request("get", "/control/stats");
        return stats.top_clients || [];
    }

    /** Returns DNS queries per time unit */
    async getDNSQueries(): Promise<any> {
        const stats = await this._request("get", "/control/stats");
        return stats.dns_queries || [];
    }

    /** Returns blocked domains */
    async getBlockedDomains(): Promise<any> {
        const stats = await this._request("get", "/control/stats");
        return stats.top_blocked_domains || [];
    }

    /** Blocks a domain via the AdGuard API */
    async blockDomain(domain: string): Promise<any> {
        // Add domain to the "blocked" filter
        const payload = {
            name: domain,
            rule_type: "exact",
        };
        return await this._request("post", "/control/filtering/add_rule", payload);
    }
}
