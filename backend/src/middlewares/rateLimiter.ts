import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis.js";

export const APILimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]): Promise<any> => {
            return (redis as any).call(...args);
        },
    }),
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many requests, please try again later." },
});
