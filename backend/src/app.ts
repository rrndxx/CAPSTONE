import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { APILimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import deviceRoutes from "./modules/DeviceModule/device.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());

app.use(APILimiter);

app.use("/api/devices", deviceRoutes);

app.use(errorHandler);

export default app;
