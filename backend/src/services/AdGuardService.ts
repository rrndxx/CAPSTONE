interface IAdGuard {
    getTopDomains()
    getTopTalkers()
    getDNSQueries()
    getBlockedDomains()
    blockDomain(ip: string)
}

export class AdGuardService {
    constructor(

    ) { }

}