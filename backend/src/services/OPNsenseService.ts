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

    async getPerDeviceTraffic(interfaceToWatch: string = 'opt1'): Promise<any> {
        return this._request("get", `/api/diagnostics/traffic/top/${interfaceToWatch}`)
    }

    // -------------------------
    // Pipes
    // -------------------------

    async getPipes() {
        const payload = {
            current: 1,
            rowCount: -1,
            sort: {}
        };
        return this._request("post", "/api/trafficshaper/settings/search_pipes", payload);
    }

    async getPipeById(pipeId: string) {
        return this._request("get", `/api/trafficshaper/settings/get_pipe/${pipeId}`);
    }

    async createPipe(
        bandwidth: number,
        metric: "bit" | "Kbit" | "Mbit" | "Gbit" = "Kbit",
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `${bandwidth}${metric} pipe for ${mask}`
    ): Promise<any> {
        const payload = {
            pipe: {
                enabled: "1",
                bandwidth: String(bandwidth),
                bandwidthMetric: metric,
                queue: "",
                mask,
                buckets: "",
                scheduler: "",
                codel_enable: "0",
                codel_target: "",
                codel_interval: "",
                codel_ecn_enable: "0",
                fqcodel_quantum: "",
                fqcodel_limit: "",
                fqcodel_flows: "",
                pie_enable: "0",
                delay: "",
                description
            }
        };

        const res = await this._request("post", "/api/trafficshaper/settings/add_pipe/", payload);
        await this._request("post", "/api/trafficshaper/service/reconfigure", {});
        return res;
    }

    async updatePipe(
        id: string,
        bandwidth: number,
        metric: "bit" | "Kbit" | "Mbit" | "Gbit" = "Kbit",
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `${bandwidth}${metric} pipe for ${mask}`
    ): Promise<any> {
        const payload = {
            pipe: {
                id,
                enabled: "1",
                bandwidth: String(bandwidth),
                bandwidthMetric: metric,
                queue: "",
                mask,
                buckets: "",
                scheduler: "",
                codel_enable: "0",
                codel_target: "",
                codel_interval: "",
                codel_ecn_enable: "0",
                fqcodel_quantum: "",
                fqcodel_limit: "",
                fqcodel_flows: "",
                pie_enable: "0",
                delay: "",
                description
            }
        };

        const res = await this._request("post", `/api/trafficshaper/settings/set_pipe/${id}`, payload);
        await this._request("post", "/api/trafficshaper/service/reconfigure", {});
        return res;
    }

    async deletePipe(id: string) {
        return this._request("post", `/api/trafficshaper/settings/del_pipe/${id}`);
    }
    // -------------------------
    // Queues
    // -------------------------

    async getQueues() {
        const payload = {
            current: 1,
            rowCount: -1,
            sort: {}
        };
        return this._request("post", "/api/trafficshaper/settings/search_queues", payload);
    }

    async getQueueById(queueId: string) {
        return this._request("get", `/api/trafficshaper/settings/get_queue/${queueId}`);
    }

    async createQueue(
        pipeId: string,
        weight: number = 100,
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `Queue on pipe ${pipeId} with weight ${weight}`
    ): Promise<any> {
        const payload = {
            queue: {
                enabled: "1",
                pipe: pipeId,
                weight: String(weight),
                mask,
                buckets: "",
                codel_enable: "0",
                codel_target: "",
                codel_interval: "",
                pie_enable: "0",
                description
            }
        };

        const res = await this._request("post", "/api/trafficshaper/settings/add_queue/", payload);
        await this._request("post", "/api/trafficshaper/service/reconfigure", {});
        return res;
    }

    async updateQueue(
        id: string,
        pipeId: string,
        weight: number = 100,
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `Queue on pipe ${pipeId} with weight ${weight}`
    ): Promise<any> {
        const payload = {
            queue: {
                id,
                enabled: "1",
                pipe: pipeId,
                weight: String(weight),
                mask,
                buckets: "",
                codel_enable: "0",
                codel_target: "",
                codel_interval: "",
                pie_enable: "0",
                description
            }
        };

        const res = await this._request("post", `/api/trafficshaper/settings/set_queue/${id}`, payload);
        await this._request("post", "/api/trafficshaper/service/reconfigure", {});
        return res;
    }

    async deleteQueue(id: string) {
        return this._request("post", `/api/trafficshaper/settings/del_queue/${id}`);
    }

    // -------------------------
    // SpeedCap
    // -------------------------

    async getSpeedcaps() {
        const payload = {
            current: 1,
            rowCount: -1,
            sort: {}
        };
        return this._request("post", "/api/trafficshaper/settings/search_rules", payload);
    }

    async getSpeedCapbyId(speedCapId: string) {
        return this._request("get", `/api/trafficshaper/settings/get_rule/${speedCapId}`);
    }

    async createSpeedCap(
        targetId: string,
        iface: "lan" | "wan" | "opt1" | string = "wan",
        proto: "ip" | "ip4" | "ip6" | "tcp" | "udp" | "icmp" = "ip",
        src: string = "any",
        dst: string = "any",
        direction: "" | "in" | "out" = "", // "" = both
        description: string = `Rule for ${iface} -> ${targetId}`,
        sequence: string = "1"
    ): Promise<any> {
        const payload = {
            rule: {
                enabled: "1",
                sequence,
                interface: iface,
                interface2: "",
                proto,
                iplen: "",
                source: src,
                source_not: "0",
                src_port: "any",
                destination: dst,
                destination_not: "0",
                dst_port: "any",
                dscp: "",
                direction,
                target: targetId,
                description
            }
        };

        const res = await this._request("post", "/api/trafficshaper/settings/add_rule/", payload);
        await this._request("post", "/api/trafficshaper/service/reconfigure", {});
        return res;
    }

    async updateSpeedCap(
        ruleId: string,
        targetId: string,
        iface: "lan" | "wan" | "opt1" | string = "wan",
        proto: "ip" | "ip4" | "ip6" | "tcp" | "udp" | "icmp" = "ip",
        src: string = "any",
        dst: string = "any",
        direction: string = "both",
        description: string = "",
        sequence: string
    ): Promise<any> {
        const payload = {
            rule: {
                enabled: "1",
                sequence,
                interface: iface,
                interface2: "",
                proto,
                iplen: "",
                source: src,
                source_not: "0",
                src_port: "any",
                destination: dst,
                destination_not: "0",
                dst_port: "any",
                dscp: "",
                direction,
                target: targetId,
                description
            }
        };

        const res = await this._request(
            "post",
            `/api/trafficshaper/settings/set_rule/${ruleId}`,
            payload
        );
        await this._request("post", "/api/trafficshaper/service/reconfigure", {});
        return res;
    }

    async deleteSpeedCap(id: string) {
        return this._request("post", `/api/trafficshaper/settings/del_rule/${id}`);
    }

    // FIREWALL
    async getFirewallStream(): Promise<any> {
        return this._request("get", "/api/diagnostics/firewall/stream_log")
    } // text/event-stream

}
