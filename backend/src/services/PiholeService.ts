import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export class PiHoleService {
    private baseUrl: string;
    private password: string;
    private sid: string | null = null;
    private client: AxiosInstance;

    constructor(baseUrl: string, password: string) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.password = password;

        // Axios instance for Pi-hole API requests
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    // ---------------------------
    // LOGIN TO PI-HOLE
    // ---------------------------
    async login(): Promise<void> {
        const res = await this.client.post("/api/auth", { password: this.password });

        if (!res.data?.session?.sid) {
            throw new Error("Login failed: No SID received");
        }

        this.sid = res.data.session.sid;

        // Pi-hole uses a HEADER, not a cookie
        this.client.defaults.headers.common["sid"] = this.sid;
    }

    // ---------------------------
    // GENERIC DYNAMIC REQUEST
    // ---------------------------
    private async request<T = any>(
        method: "get" | "post" | "put" | "delete",
        endpoint: string,
        params?: any,
        data?: any
    ): Promise<T> {
        // Auto-login if no SID yet
        if (!this.sid) {
            await this.login();
        }

        const config: AxiosRequestConfig = {
            method,
            url: endpoint,
            params,
            data,
        };

        try {
            const res = await this.client.request(config);
            return res.data;
        } catch (err: any) {
            // Retry once if 401 Unauthorized
            if (err.response?.status === 401) {
                await this.login();
                const retryRes = await this.client.request(config);
                return retryRes.data;
            }
            throw err;
        }
    }

    // ---------------------------
    // API METHODS
    // ---------------------------

    /** GET /api/stats/summary */
    async getSummary(): Promise<any> {
        return this.request("get", "/api/stats/summary");
    }

    /** GET /api/queries/all */
    async getTopClients(): Promise<any> {
        return this.request("get", "/api/stats/top_clients");
    }

    /** GET /api/queries/all */
    async getTopDomains(): Promise<any> {
        return this.request("get", "/api/stats/top_domains");
    }

    /** GET /api/queries/all */
    async getNetworkDevices(): Promise<any> {
        return this.request("get", "/api/network/devices");
    }






    /** GET /api/queries/all?client=IP */
    async getDeviceQueryLog(deviceIp: string): Promise<any> {
        return this.request("get", "/api/queries/all", { client: deviceIp });
    }

    /** GET /api/stats/all */
    async getAllStats(): Promise<any> {
        return this.request("get", "/api/stats/all");
    }

    /** GET /api/lists/denylist */
    async getBlockedDomains(): Promise<any> {
        return this.request("get", "/api/lists/denylist");
    }

    /** POST /api/lists/denylist/add */
    async blockDomain(domain: string): Promise<any> {
        return this.request("post", "/api/lists/denylist/add", null, { domain });
    }

    /** POST /api/lists/denylist/remove */
    async unblockDomain(domain: string): Promise<any> {
        return this.request("post", "/api/lists/denylist/remove", null, { domain });
    }

    /** Custom block/unblock user (simulated via API endpoint) */
    async blockUser(ip: string): Promise<any> {
        return this.request("post", "/api/custom/block-client", null, { ip });
    }

    async unblockUser(ip: string): Promise<any> {
        return this.request("post", "/api/custom/unblock-client", null, { ip });
    }

    /** GET /api/lists/all */
    async getControlAccessList(): Promise<any> {
        return this.request("get", "/api/lists/all");
    }
}
