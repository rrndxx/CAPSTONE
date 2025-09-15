import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import deviceRoutes from "./modules/Device/device.routes.js";
import bandwidthRoutes from "./modules/Bandwidth/bandwidth.routes.js"
import networkRoutes from "./modules/Network/network.routes.js";
import { APILimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import axios from 'axios'
import https from 'https'
import dotenv from "dotenv";

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

app.use("/devices", deviceRoutes);
app.use("/bandwidth", bandwidthRoutes)
app.use("/network", networkRoutes)

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

app.use(errorHandler);

export default app;