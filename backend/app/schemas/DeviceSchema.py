from pydantic import BaseModel, IPvAnyAddress
from typing import Optional
from uuid import UUID
from datetime import datetime

class DeviceBase(BaseModel):
    ip_address: IPvAnyAddress
    mac_address: str
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    is_authorized: bool = False

class DeviceCreate(DeviceBase):
    pass

class DeviceOut(DeviceBase):
    id: UUID
    first_seen: datetime
    last_seen: datetime

    class Config:
        from_attributes = True 
