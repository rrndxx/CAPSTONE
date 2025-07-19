from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    mac_address = Column(String, ForeignKey("devices.mac_address"))
    type = Column(String, nullable=False)  # e.g., "suspicious usage"
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
