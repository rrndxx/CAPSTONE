import { redis } from "../config/redis.js";

export interface ICacheService {
    get<T>(key: string): Promise<T | null>
    set<T>(key: string, value: T, ttl: number): Promise<void>
}

export class RedisCacheService implements ICacheService {
    async get<T>(key: string): Promise<T | null> {
        const data = await redis.get(key)
        if (!data) return null
        return JSON.parse(data) as T
    }

    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        await redis.set(key, JSON.stringify(value), "EX", ttl)
    }
}
