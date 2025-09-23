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
import { exporter, pushChannel } from "./server.js";
import { getUserFromToken, login } from "./services/authservice.js";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";

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
        await exporter.exportToPDF(req.params.model, res);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const result = await login(email, password)
        res.json({ success: true, result })
    } catch (err: any) {
        res.status(401).json({ success: false, error: err.message })
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