import type { Device } from "@prisma/client";
import type { IBandwidthRepository } from "./bandwidth.repository.js";
import type { OPNsenseService } from "../../services/OPNsenseService.js";

export class BandwidthService {
    constructor(
        private readonly bandwidthRepo: IBandwidthRepository,
        private readonly opnSenseService: OPNsenseService
    ) { }

    // -------------------------
    // SpeedCap
    // -------------------------

    async getSpeedCaps() {
        return this.opnSenseService.getSpeedcaps();
    }

    async getSpeedCapById(id: string) {
        return this.opnSenseService.getSpeedCapbyId(id);
    }

    async createSpeedCaps(
        targetId: string,
        iface: "lan" | "wan" | "opt1" | string = "wan",
        proto: "ip" | "ip4" | "ip6" | "tcp" | "udp" | "icmp" = "ip",
        src: string = "any",
        dst: string = "any",
        direction: "" | "in" | "out" = "",
        description: string = `Rule for ${iface} -> ${targetId}`,
        sequence: string = "1"
    ) {
        return this.opnSenseService.createSpeedCap(
            targetId, iface, proto, src, dst, direction, description, sequence
        );
    }

    async updateSpeedCap(
        ruleId: string,
        targetId: string,
        iface: "lan" | "wan" | "opt1" | string = "wan",
        proto: "ip" | "ip4" | "ip6" | "tcp" | "udp" | "icmp" = "ip",
        src: string = "any",
        dst: string = "any",
        direction: string = "both",
        description: "" | "in" | "out" = "",
        sequence: string
    ) {
        return this.opnSenseService.updateSpeedCap(
            ruleId, targetId, iface, proto, src, dst, direction, description, sequence
        );
    }

    async deleteSpeedCap(ruleId: string) {
        return this.opnSenseService.deleteSpeedCap(ruleId);
    }

    // -------------------------
    // Pipes
    // -------------------------

    async getBandwidthPipes() {
        return this.opnSenseService.getPipes();
    }

    async getPipeById(id: string) {
        return this.opnSenseService.getPipeById(id);
    }

    async createBandwidthPipe(
        bandwidth: number,
        metric: "bit" | "Kbit" | "Mbit" | "Gbit" = "Kbit",
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `${bandwidth}${metric} pipe for ${mask}`
    ) {
        return this.opnSenseService.createPipe(bandwidth, metric, mask, description);
    }

    async updateBandwidthPipe(
        id: string,
        bandwidth: number,
        metric: "bit" | "Kbit" | "Mbit" | "Gbit" = "Kbit",
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `${bandwidth}${metric} pipe for ${mask}`
    ) {
        return this.opnSenseService.updatePipe(id, bandwidth, metric, mask, description);
    }

    async deleteBandwidthPipe(id: string) {
        return this.opnSenseService.deletePipe(id);
    }

    // -------------------------
    // Queues
    // -------------------------

    async getBandwidthQueues() {
        return this.opnSenseService.getQueues();
    }

    async getQueueById(id: string) {
        return this.opnSenseService.getQueueById(id);
    }

    async createBandwidthQueue(
        pipeId: string,
        weight: number = 100,
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `Queue on pipe ${pipeId} with weight ${weight}`
    ) {
        return this.opnSenseService.createQueue(pipeId, weight, mask, description);
    }

    async updateBandwidthQueue(
        id: string,
        pipeId: string,
        weight: number = 100,
        mask: "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" = "none",
        description: string = `Queue on pipe ${pipeId} with weight ${weight}`
    ) {
        return this.opnSenseService.updateQueue(id, pipeId, weight, mask, description);
    }

    async deleteBandwidthQueue(id: string) {
        return this.opnSenseService.deleteQueue(id);
    }

    async perDevice() {
        return this.bandwidthRepo.perDevice();
    }

    async perDeviceTotal() {
        return this.bandwidthRepo.perDeviceTotal();
    }
}
