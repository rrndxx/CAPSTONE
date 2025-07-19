from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeviceBase(BaseModel):
    mac_address: str
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    connection_type: Optional[str] = None
    vendor: Optional[str] = None
    notes: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceRead(DeviceBase):
    is_online: bool
    last_seen: datetime

    class Config:
        orm_mode = True
