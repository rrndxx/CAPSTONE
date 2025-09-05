import type { Request, Response, NextFunction } from "express";
import { networkService, sophos } from "../../server.js";
import { parseXml } from "../../utils/xmlParser.js";

export async function getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
        const response = await networkService.getSystemHealthInfo()

        res.status(200).json({ success: true, data: response })
    } catch (err: unknown) {
        next(err)
    }
}

export async function getIPHosts(req: Request, res: Response, next: NextFunction) {
    try {
        const xml = await sophos.getIPHosts();
        const data = parseXml(xml);

        const hosts = data?.Response?.IPHost || [];
        res.json({
            status: "success",
            hosts: hosts.map((h: any) => ({
                name: h.Name,
                ip: h.IPAddress,
                type: h.HostType,
                family: h.IPFamily,
            })),
        });
    } catch (err: unknown) {
        res.status(500).json({ error: "Failed to fetch ip hosts." });
    }
}

export async function getIPHostStatistics(req: Request, res: Response, next: NextFunction) {
    try {
        const xml = await sophos.getIPHostStatistics();
        const data = parseXml(xml);

        const stats = data?.Response?.IPHostStatistics || [];
        const meta = {
            apiVersion: data?.Response?.APIVersion || null,
            ipsCatVer: data?.Response?.IPS_CAT_VER || null,
            isWifi6: data?.Response?.IS_WIFI6 === "1",
        };

        res.json({
            status: "success",
            hosts: stats.map((h: any) => ({
                name: h.Name,
                usage: Number(h.Usage),
            })),
            meta,
        });
    } catch {
        res.status(500).json({ error: "Failed to fetch host statistics." });
    }
}

export async function addIPHost(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, ip } = req.body;
        const xml = await sophos.addIPHost(name, ip);
        const data = parseXml(xml);

        res.json({
            status: "success",
            action: "added",
            host: { name, ip },
            raw: data,
        });
    } catch {
        res.status(500).json({ error: "Failed to add IP host." });
    }
}

export async function updateIPHost(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.params;
        const { ip } = req.body;
        if (!name || !ip) return res.json({ message: "Error" })

        const xml = await sophos.updateIPHost(name, ip);
        const data = parseXml(xml);

        res.json({
            status: "success",
            action: "updated",
            host: { name, ip },
            raw: data,
        });
    } catch {
        res.status(500).json({ error: "Failed to update IP host." });
    }
}

export async function deleteIPHost(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.params;
        if (!name) return res.json({ message: "Error" })
        const xml = await sophos.deleteIPHost(name);
        const data = parseXml(xml);

        res.json({
            status: "success",
            action: "deleted",
            host: { name },
            raw: data,
        });
    } catch {
        res.status(500).json({ error: "Failed to delete IP host." });
    }
}

export async function getMACHosts(req: Request, res: Response, next: NextFunction) {
    try {
        const xml = await sophos.getMACHosts();
        const data = parseXml(xml);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch hosts" });
    }
}

export async function getZones(req: Request, res: Response, next: NextFunction) {
    try {
        const xml = await sophos.getZones();
        const data = parseXml(xml);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch hosts" });
    }
}

export async function getServices(req: Request, res: Response, next: NextFunction) {
    try {
        const xml = await sophos.getServices();
        const data = parseXml(xml);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch services" });
    }
}

export async function getFirewallRules(req: Request, res: Response, next: NextFunction) {
    try {
        const xml = await sophos.getFirewallRules();
        const data = parseXml(xml);

        const rules = data?.Response?.FirewallRule || [];
        res.json({
            status: "success",
            rules: rules.map((r: any) => ({
                name: r.Name,
                action: r.Action,
                status: r.Status,
                sourceZones: r.SourceZones?.Zone || [],
                destZones: r.DestinationZones?.Zone || [],
                services: r.Services?.Service || [],
            })),
        });
    } catch {
        res.status(500).json({ error: "Failed to fetch firewall rules." });
    }
}

export async function addFirewallRule(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            name,
            sourceHost,
            action = "Drop",
            position = "Top",
            policyType = "Network",
            sourceZone = "LAN",
            destinationZone = "WAN",
            service = "Any",
        } = req.body;

        if (!name || !sourceHost) {
            return res.status(400).json({ message: "Name and sourceHost are required." });
        }

        const xml = await sophos.addFirewallRule(
            name,
            sourceHost,
            action,
            position,
            policyType,
            sourceZone,
            destinationZone,
            service
        );

        const data = parseXml(xml);

        res.json({
            status: "success",
            action: "added",
            rule: { name, sourceHost, action, position, policyType, sourceZone, destinationZone, service },
            raw: data,
        });
    } catch (error) {
        console.error("Add firewall rule failed:", error);
        res.status(500).json({ error: "Failed to add firewall rule." });
    }
}

export async function updateFirewallRule(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.params;
        const {
            sourceHost,
            action = "Drop",
            position = "Top",
            policyType = "Network",
            sourceZone = "LAN",
            destinationZone = "WAN",
            service = "Any",
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Rule name (in params) is required." });
        }

        const xml = await sophos.updateFirewallRule(
            name,
            sourceHost,
            action,
            position,
            policyType,
            sourceZone,
            destinationZone,
            service
        );

        const data = parseXml(xml);

        res.json({
            status: "success",
            action: "updated",
            rule: { name, sourceHost, action, position, policyType, sourceZone, destinationZone, service },
            raw: data,
        });
    } catch (error) {
        console.error("Update firewall rule failed:", error);
        res.status(500).json({ error: "Failed to update firewall rule." });
    }
}

export async function deleteFirewallRule(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.params;
        if (!name) return res.status(500).json({ message: "Error deleting firewall rule" })

        const xml = await sophos.deleteFirewallRule(name);
        const data = parseXml(xml);

        res.json({
            status: "success",
            action: "deleted",
            rule: { name },
            raw: data,
        });
    } catch (error) {
        console.error("Delete firewall rule failed:", error);
        res.status(500).json({ error: "Failed to delete firewall rule." });
    }
}
