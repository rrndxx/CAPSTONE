import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import axios from 'axios'
import https from 'https'
import dotenv from "dotenv";
import util from 'util';
import deviceRoutes from "./modules/Device/device.routes.js";
import bandwidthRoutes from "./modules/Bandwidth/bandwidth.routes.js"
import networkRoutes from "./modules/Network/network.routes.js";
import { exec } from 'child_process'
import { APILimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authMiddleware } from "./middlewares/routesProtector.js";
import { exporter, notificationService, pushChannel } from "./server.js";
import { getUserFromToken, login } from "./services/authservice.js";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { computeTrafficStats, detectBandwidthAnomalies, runAIAnalysis } from "./services/AIService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression({
    filter: (req, res) => {
        if (req.path.startsWith("/stream1")) {
            return false;
        }
        if (req.path.startsWith("/stream/cpu")) {
            return false;
        }
        return compression.filter(req, res);
    },
}));
app.use(express.json());

// app.use(APILimiter);

// app.use("/devices", authMiddleware, deviceRoutes);
// app.use("/bandwidth", authMiddleware, bandwidthRoutes)
// app.use("/network", authMiddleware, networkRoutes)

app.use("/devices", deviceRoutes);
app.use("/bandwidth", bandwidthRoutes)
app.use("/network", networkRoutes)

// EXPORTS
app.get("/reports/:model/csv", async (req, res) => {
    try {
        await exporter.exportToCSV(req.params.model, res);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/reports/:model/pdf", async (req, res) => {
    try {
        await exporter.exportToPDF(req.params.model, res)
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }
})



// LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const result = await login(email, password)
        res.json({ success: true, result })
    } catch (err: any) {
        res.status(401).json({ success: false, error: err.message });
    }
})
// app.post('/create', async (req, res) => {
//     try {
//         const { email, password } = req.body
//         const user = await createAdmin(email, password)
//         res.json({ id: user.userId, email: user.email })
//     } catch (err: any) {
//         return res.json({ error: err.message })
//     }
// })


app.get("/vapid-public-key", (_req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY?.trim());
});
app.post("/alerts/subscribe", authMiddleware, async (req, res) => {
    try {
        const subscription = req.body;

        const userId = (req as any).user?.userId ?? null;

        await pushChannel.addSubscription(subscription, userId);

        res.status(201).json({ success: true });
    } catch (err: any) {
        console.error("Subscription failed:", err);
        res.status(500).json({ error: "Failed to save subscription" });
    }
});


app.get("/alerts/all", async (req, res) => {
    try {
        // If you want truly all alerts, remove or increase the limit
        const alerts = await notificationService.getRecent(100);

        res.status(200).json({
            success: true,
            alerts,
        });
    } catch (err) {
        console.error("Failed to get alerts:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch alerts",
        });
    }
});


// AI Endpoints
app.get("/predictions", async (req, res) => {
    try {
        const predictions = await runAIAnalysis();
        console.log("Predictions returned:", predictions);
        res.json(predictions);
    } catch (err) {
        console.error("Error in /predictions:", err);
        res.status(500).json({ error: "Failed to run AI analysis" });
    }
});

app.post("/detect-anomalies", async (req, res) => {
    try {
        await detectBandwidthAnomalies();
        res.json({ message: "Anomaly detection completed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to detect anomalies" });
    }
});

app.get("/traffic-stats", async (req, res) => {
    try {
        const stats = await computeTrafficStats();
        // Format peakHour nicely for display
        const peakHourStr = `${stats.peakHour.toString().padStart(2, "0")}:00`;
        res.json({ peakHour: peakHourStr, totalBandwidth: stats.totalBandwidth });
    } catch (err) {
        console.error("Error in /traffic-stats:", err);
        res.status(500).json({ error: "Failed to compute traffic stats" });
    }
});

// app.get("/get-alerts", (req, res) => {
//     const alerts = 
// })

// STREAMS
app.get("/stream1", async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        const upstream = await axios.get(
            "https://192.168.56.104/api/diagnostics/traffic/stream/1",
            {
                auth: {
                    username: process.env.OPNSENSE_KEY!,
                    password: process.env.OPNSENSE_SECRET!,
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                responseType: "stream",
            }
        );

        upstream.data.on("data", (chunk: Buffer) => {
            res.write(chunk.toString());
        });

        upstream.data.on("error", (err: Error) => {
            console.error("Error in OPNsense stream:", err);
            res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
            res.end();
        });

        const keepAlive = setInterval(() => {
            res.write(":\n\n");
        }, 15_000);

        res.on("close", () => {
            clearInterval(keepAlive);
            upstream.data.destroy();
            res.end();
        });
    } catch (err) {
        console.error("Failed to connect to OPNsense stream:", err);
        res.status(500).end("Error streaming traffic data");
    }
});
app.get("/stream/cpu", async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        const upstream = await axios.get(
            "https://192.168.56.104/api/diagnostics/cpu_usage/stream",
            {
                auth: {
                    username: process.env.OPNSENSE_KEY!,
                    password: process.env.OPNSENSE_SECRET!,
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                responseType: "stream",
            }
        );

        upstream.data.on("data", (chunk: Buffer) => {
            res.write(chunk.toString());
        });

        upstream.data.on("error", (err: Error) => {
            console.error("Error in OPNsense stream:", err);
            res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
            res.end();
        });

        const keepAlive = setInterval(() => {
            res.write(":\n\n");
        }, 15_000);

        res.on("close", () => {
            clearInterval(keepAlive);
            upstream.data.destroy();
            res.end();
        });
    } catch (err) {
        console.error("Failed to connect to OPNsense stream:", err);
        res.status(500).end("Error streaming traffic data");
    }
});



// per device bandwidth consumption poller
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DeviceTraffic {
    ip: string;
    mac: string;
    download: number; // bytes/sec
    upload: number;   // bytes/sec
}

// In-memory buffer: stores last ~20 seconds per-second values
let bandwidthBuffer: Record<string, { download: number[]; upload: number[] }> = {};

// Optional: total consumption for dashboard
let totalConsumption: Record<string, { download: number; upload: number }> = {};

// Fetch traffic from local backend
async function fetchTraffic() {
    try {
        const resp = await axios.get("http://localhost:4000/network/traffic/per-device", { timeout: 4000 });
        return Array.isArray(resp.data) ? resp.data : [];
    } catch (err) {
        console.error("Failed to fetch live device traffic:", (err as any).message);
        return [];
    }
}

// 1️⃣ LIVE POLLING LOOP (every 2 seconds)
export async function startLiveTrafficPoller() {
    async function loop() {
        const data = await fetchTraffic();

        for (const row of data) {
            const mac = row?.mac ?? "unknown";
            const download = row?.bps_in ?? 0;
            const upload = row?.bps_out ?? 0;

            if (!bandwidthBuffer[mac]) bandwidthBuffer[mac] = { download: [], upload: [] };
            bandwidthBuffer[mac].download.push(download);
            bandwidthBuffer[mac].upload.push(upload);

            // Keep only last ~20 seconds
            if (bandwidthBuffer[mac].download.length > 20) bandwidthBuffer[mac].download.shift();
            if (bandwidthBuffer[mac].upload.length > 20) bandwidthBuffer[mac].upload.shift();

            // Update total consumption
            if (!totalConsumption[mac]) totalConsumption[mac] = { download: 0, upload: 0 };
            totalConsumption[mac].download += download;
            totalConsumption[mac].upload += upload;
        }

        setTimeout(loop, 2000); // run every 2 seconds
    }

    loop();
}

// 2️⃣ DATABASE AGGREGATION LOOP (every 20 seconds)
export async function startDbAggregationPoller() {
    async function loop() {
        const timestamp = new Date();

        for (const [mac, buffer] of Object.entries(bandwidthBuffer)) {
            try {
                const device = await prisma.device.findFirst({ where: { deviceMac: mac } });
                if (!device) continue;

                const downloadSum = buffer.download.reduce((a, b) => a + b, 0);
                const uploadSum = buffer.upload.reduce((a, b) => a + b, 0);

                await prisma.bandwidthUsage.create({
                    data: {
                        deviceId: device.deviceId,
                        download: BigInt(downloadSum),
                        upload: BigInt(uploadSum),
                        timestamp,
                    },
                });

                buffer.download = [];
                buffer.upload = [];
            } catch (err) {
                console.error(`Failed to insert bandwidth for ${mac}:`, (err as any).message);
            }
        }

        setTimeout(loop, 20000); // every 20 seconds
    }

    loop();
}

// 3️⃣ FRONTEND ENDPOINTS
app.get("/bandwidth/live", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");

    const latestSnapshot: Record<string, { download: number; upload: number }> = {};
    for (const [mac, buffer] of Object.entries(bandwidthBuffer)) {
        latestSnapshot[mac] = {
            download: buffer.download[buffer.download.length - 1] ?? 0,
            upload: buffer.upload[buffer.upload.length - 1] ?? 0,
        };
    }

    res.json({ success: true, devices: latestSnapshot });
});

app.get("/bandwidth/total", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");

    res.json({ success: true, devices: totalConsumption });
});

// PORT SCANNER
const execAsync = util.promisify(exec);
const runNmapScan = async (ip: string, ports: string = "22-100") => {
    if (!ip) {
        throw new Error('IP address must be provided');
    }

    try {
        // Execute the Nmap command
        // 192.168.10.59
        const { stdout, stderr } = await execAsync(`nmap -sT ${ip}`);

        // If stderr contains an error, throw an exception
        if (stderr) {
            throw new Error(`Nmap Error: ${stderr}`);
        }

        // Parse Nmap output to extract open ports
        const openPorts = parseOpenPorts(stdout);

        return {
            target: ip,
            raw: stdout,
            open_ports: openPorts,
        };
    } catch (error: any) {
        throw new Error(`Scan failed: ${error.message}`);
    }
};
const parseOpenPorts = (nmapOutput: string) => {
    const lines = nmapOutput.split('\n');
    const openPorts = [];

    // Loop through each line in Nmap's output
    for (const line of lines) {
        // Match lines that describe open ports (e.g., "22/tcp open ssh")
        const match = line.match(/^(\d+)\/tcp\s+open\s+(\S+)/);

        if (match && match[1]) {
            openPorts.push({
                port: parseInt(match[1], 10), // Use base 10 for parseInt
                service: match[2],             // Service name (e.g., ssh)
            });
        }
    }

    return openPorts;
};
const scanPorts = async (req: ExpressRequest, res: ExpressResponse) => {
    const ip = req.query.ip as string | undefined;

    // Check if IP is valid
    if (typeof ip !== 'string' || ip.trim() === '') {
        return res.status(400).json({ error: 'Invalid or missing "ip" query parameter' });
    }

    try {
        const result = await runNmapScan(ip);  // Run Nmap scan with provided IP
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({
            error: 'Scan failed',
            message: error.message,
        });
    }
};
app.get("/scan/port", scanPorts)

app.use(errorHandler);

export default app;