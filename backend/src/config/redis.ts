import { Redis } from "ioredis";
import { config } from './index.js';

export const redis = new Redis(config.REDIS_URL);
