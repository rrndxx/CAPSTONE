from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UsageBase(BaseModel):
    mac_address: str
    download_mb: float
    upload_mb: float

class UsageCreate(UsageBase):
    pass

class UsageRead(UsageBase):
    id: int
    total_mb: float
    timestamp: datetime

    class Config:
        orm_mode = True
