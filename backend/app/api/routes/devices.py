from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import Device
from app.schemas.DeviceSchema import DeviceOut, DeviceCreate
from typing import List
from uuid import UUID, uuid4
from datetime import datetime, timezone

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# ALL DEVICES
@router.get("/", response_model=List[DeviceOut])
def get_devices(db: Session = Depends(get_db)):
    return db.query(Device).all()

# SPECIFIC DEVICE
@router.get("/{device_id}", response_model=DeviceOut)
def get_device_by_id(device_id: UUID, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")
    return device

# ADD DEVICE
@router.post("/", response_model=DeviceOut, status_code=status.HTTP_201_CREATED)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    existing_device = db.query(Device).filter(Device.mac_address == device.mac_address).first()

    if existing_device:
        raise HTTPException(status_code=400, detail="Device already exists.")
    
    new_device = Device(
        id = uuid4(),
        ip_address = str(device.ip_address),
        mac_address = device.mac_address,
        hostname = device.hostname,
        vendor = device.vendor,
        is_authorized = device.is_authorized,
        first_seen = datetime.now(timezone.utc),
        last_seen = datetime.now(timezone.utc)
    )

    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device

# UPDATE DEVICE
@router.put("/{device_id}", response_model=DeviceOut)
def update_device(device_id: UUID, device_details: DeviceCreate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")
    
    update_data = device_details.model_dump(exclude_unset=True)

    if 'ip_address' in update_data:
        update_data['ip_address'] = str(update_data['ip_address'])

    for field, value in update_data.items():
        setattr(device, field, value)

    device.last_seen = datetime.now(timezone.utc)

    db.commit()
    db.refresh(device)
    return device

# DELETE DEVICE
@router.delete("/{device_id}", response_model=DeviceOut)
def delete_device(device_id: UUID, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")
    
    db.delete(device)
    db.commit()
    return device