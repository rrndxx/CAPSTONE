import axios, { type AxiosRequestConfig } from "axios";
import https from "https";

interface IAdGuard {
    getQueryLog(): Promise<any>
    getDeviceQueryLog(deviceIp: string): Promise<any>
    getControlStatus(): Promise<any>
    getAllStats(): Promise<any>
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

    async getDeviceQueryLog(deviceIp: string): Promise<any> {
        const deviceQueryLog = await this._request('get', `/control/querylog?search=%22${deviceIp}%22&response_status=all&older_than=&limit=20`)
        return deviceQueryLog
    }

    async getControlStatus(): Promise<any> {
        const status = await this._request('get', "/control/status")
        return status
    }

    async getAllStats(): Promise<any> {
        const stats = await this._request("get", "/control/stats");
        return stats
    }

    async getBlockedDomains(): Promise<any> {
        const stats = await this._request("get", "/control/stats");
        return stats.top_blocked_domains || [];
    }

    async blockDomain(domain: string): Promise<any> {
        try {
            // 1. Get current rules
            const status = await this._request<{ user_rules: string[] }>(
                "get",
                "/control/filtering/status"
            );

            // 2. Prepare new rule
            const newRule = `||${domain}^$important`;
            const updatedRules = status.user_rules.includes(newRule)
                ? status.user_rules
                : [...status.user_rules.filter(r => r), newRule]; // remove empty strings

            // 3. Update rules
            const payload = { rules: updatedRules };
            return await this._request("post", "/control/filtering/set_rules", payload);
        } catch (err) {
            console.error("Failed to block domain:", err);
            throw err;
        }
    }

    async blockUser(ip: string): Promise<any> {
        try {
            const currentSettings = await this._request<{
                allowed_clients: string[],
                blocked_hosts: string[],
                disallowed_clients: string[]
            }>("get", "/control/access/list");

            const updatedDisallowed = currentSettings.disallowed_clients.includes(ip)
                ? currentSettings.disallowed_clients
                : [...currentSettings.disallowed_clients, ip];

            const payload = {
                allowed_clients: currentSettings.allowed_clients,
                blocked_hosts: currentSettings.blocked_hosts,
                disallowed_clients: updatedDisallowed
            };

            return await this._request("post", "/control/access/set", payload);
        } catch (err) {
            console.error("Failed to block user:", err);
            throw err;
        }
    }

    async unblockUser(ip: string): Promise<any> {
        try {
            const currentSettings = await this._request<{
                allowed_clients: string[],
                blocked_hosts: string[],
                disallowed_clients: string[]
            }>("get", "/control/access/list");

            const updatedDisallowed = currentSettings.disallowed_clients.filter(
                (clientIp) => clientIp !== ip
            );

            const payload = {
                allowed_clients: currentSettings.allowed_clients,
                blocked_hosts: currentSettings.blocked_hosts,
                disallowed_clients: updatedDisallowed
            };

            return await this._request("post", "/control/access/set", payload);
        } catch (err) {
            console.error("Failed to unblock user:", err);
            throw err;
        }
    }

    async getControlAccessList(): Promise<any> {
        return await this._request('get', 'control/access/list')
    }
}   
