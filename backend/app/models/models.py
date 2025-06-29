import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Device(Base):
    __tablename__ = "devices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ip_address = Column(INET, nullable=False)
    mac_address = Column(String, nullable=False, unique=True)
    hostname = Column(String)
    vendor = Column(String)
    is_authorized = Column(Boolean, default=False)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

    usage_records = relationship("Usage", back_populates="device", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="device", cascade="all, delete-orphan")

class Usage(Base):
    __tablename__ = "usage"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    bytes_sent = Column(BigInteger, default=0)
    bytes_received = Column(BigInteger, default=0)
    interface = Column(String, nullable=True)

    device = relationship("Device", back_populates="usage_records")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=True)
    type = Column(String, nullable=False)
    message = Column(String)
    triggered_at = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)

    device = relationship("Device", back_populates="alerts")
