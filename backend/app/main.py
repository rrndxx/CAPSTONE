# app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
from db.postgres import connect_db, disconnect_db
from redis.cache import connect_redis, disconnect_redis
from routers import xml_simulator  # will create this soon

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔄 Connecting to DB and Redis...")
    await connect_db()
    await connect_redis()
    yield
    print("⛔ Disconnecting...")
    await disconnect_redis()
    await disconnect_db()

app = FastAPI(lifespan=lifespan)

# Placeholder route module
app.include_router(xml_simulator.router, prefix="/fake", tags=["Fake XML API"])

@app.get("/")
async def root():
    return {"message": "NetDetect API is running"}
