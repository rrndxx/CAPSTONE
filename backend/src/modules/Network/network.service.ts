import type { INetworkRepository } from "./network.interface.js";

export class NetworkService {
    constructor(
        private readonly networkRepository: INetworkRepository
    ) { }

    async getSystemHealthInfo() {
        const data = await this.networkRepository.getSystemHealthInfo()

        if (!data) throw new Error("Error getting system health info")

        return data
    }
}