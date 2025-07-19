from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    mac_address: str
    type: str
    message: str

class AlertCreate(AlertBase):
    pass

class AlertRead(AlertBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
