import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export class PiHoleService {
    private baseUrl: string;
    private password: string;

    private sid: string | null = null;
    private csrf: string | null = null;

    private client: AxiosInstance;

    constructor(baseUrl: string, password: string) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.password = password;

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    // --------------------------------------------------
    // LOGIN + TOKEN SETUP
    // --------------------------------------------------
    private async login(totp?: string): Promise<void> {
        const res = await this.client.post("/api/auth", {
            password: this.password,
            totp,
        });

        const session = res.data?.session;
        if (!session?.sid) {
            throw new Error("Login failed: missing session SID");
        }

        this.sid = session.sid;
        this.csrf = session.csrf;

        this.client.defaults.headers.common["Cookie"] = `sid=${this.sid}`;
        if (this.csrf) {
            this.client.defaults.headers.common["X-CSRF-Token"] = this.csrf;
        }
    }

    // --------------------------------------------------
    // GENERIC REQUEST WRAPPER (auto retry on 401/403)
    // --------------------------------------------------
    private async request<T = any>(
        method: "get" | "post" | "put" | "delete",
        endpoint: string,
        params?: any,
        data?: any
    ): Promise<T> {
        if (!this.sid) {
            await this.login();
        }

        const config: AxiosRequestConfig = { method, url: endpoint, params };
        if (data) config.data = data;

        try {
            const res = await this.client.request(config);
            return res.data;
        } catch (err: any) {
            const status = err.response?.status;

            // Token expired → relogin & retry once
            if (status === 401 || status === 403) {
                this.sid = null;
                this.csrf = null;
                await this.login();

                const retryRes = await this.client.request(config);
                return retryRes.data;
            }

            throw err;
        }
    }

    // --------------------------------------------------
    // PI-HOLE API WRAPPERS
    // --------------------------------------------------
    async getSummary() {
        return this.request("get", "/api/stats/summary");
    }

    async getTopClients() {
        return this.request("get", "/api/stats/top_clients");
    }

    async getTopDomains() {
        return this.request("get", "/api/stats/top_domains");
    }

    async getNetworkDevices() {
        return this.request("get", "/api/network/devices");
    }

    async getQueryTypes() {
        return this.request("get", "/api/stats/query_types");
    }

    async getBlockedDomains() {
        return this.request("get", "/api/domains/deny");
    }

    // --------------------------------------------------
    // BLOCK DOMAIN
    // --------------------------------------------------
    async blockDomain(
        domain: string | string[],
        kind: "exact" | "regex" = "exact"
    ) {
        const domainsArray = Array.isArray(domain) ? domain : [domain];

        const payload = {
            domain: domainsArray,
            comment: "",
            type: "deny",
            kind,
            groups: [0],
            enabled: true,
        };

        const endpoint =
            kind === "exact"
                ? "/api/domains/deny/exact"
                : "/api/domains/deny/regex";

        return this.request("post", endpoint, undefined, payload);
    }

    // --------------------------------------------------
    // UNBLOCK DOMAIN (batch delete)
    // --------------------------------------------------
    async unblockDomain(
        domain: string | string[],
        kind: "exact" | "regex" = "exact"
    ) {
        const items = (Array.isArray(domain) ? domain : [domain]).map(d => ({
            item: d,
            type: "deny",
            kind,
        }));

        return this.request("post", "/api/domains:batchDelete", undefined, items);
    }


    // In your PiHoleService class
    async getClientQueries(client_ip: string, length: number = 100) {
        const params = { client_ip, length };
        try {
            const data = await this.request("get", "/api/queries", params);
            return data; // This will return the raw response from Pi-hole
        } catch (err) {
            console.error("Failed to fetch client queries:", err);
            throw err;
        }
    }

}
