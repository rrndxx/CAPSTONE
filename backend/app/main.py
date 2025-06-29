from fastapi import FastAPI
from app.api.routes import devices

app = FastAPI()

app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])