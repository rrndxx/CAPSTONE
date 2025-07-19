# app/redis/cache.py

import redis.asyncio as redis
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Create a single Redis connection
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

# Example utility functions
async def cache_set(key: str, value: str, expire: int = 300):
    await redis_client.set(key, value, ex=expire)

async def cache_get(key: str):
    return await redis_client.get(key)

async def cache_delete(key: str):
    await redis_client.delete(key)

async def clear_all_cache():
    await redis_client.flushall()

# For app lifespan (optional)
async def connect_redis():
    await redis_client.ping()

async def disconnect_redis():
    await redis_client.close()
