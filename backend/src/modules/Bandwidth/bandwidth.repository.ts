import type { Device } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";

export interface IBandwidthRepository {

}

export class BandwidthRepository implements IBandwidthRepository {
    constructor(
        private db: PrismaClient
    ) { }


}