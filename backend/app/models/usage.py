from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Device(Base):
    __tablename__ = "devices"

    mac_address = Column(String, primary_key=True, index=True)
    ip_address = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime, default=datetime.utcnow)
    connection_type = Column(String, nullable=True)  # e.g., wired/wireless
    vendor = Column(String, nullable=True)
    notes = Column(String, nullable=True)
