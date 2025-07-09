from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.schemas.ambulance import AmbulanceCreate, AmbulanceUpdate, AmbulanceLocation
from datetime import datetime

def get_ambulance(db: Session, ambulance_id: int) -> Optional[Ambulance]:
    return db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()

def get_ambulance_by_plate(db: Session, plate_number: str) -> Optional[Ambulance]:
    return db.query(Ambulance).filter(Ambulance.plate_number == plate_number).first()

def get_ambulances(db: Session, skip: int = 0, limit: int = 100) -> List[Ambulance]:
    return db.query(Ambulance).offset(skip).limit(limit).all()

def get_available_ambulances(db: Session) -> List[Ambulance]:
    return db.query(Ambulance).filter(Ambulance.status == AmbulanceStatus.DISPONIBLE).all()

def create_ambulance(db: Session, ambulance: AmbulanceCreate) -> Ambulance:
    db_ambulance = Ambulance(
        plate_number=ambulance.plate_number,
        model=ambulance.model,
        capacity=ambulance.capacity,
        status=ambulance.status,
        latitude=ambulance.latitude,
        longitude=ambulance.longitude,
        location_updated_at=datetime.utcnow() if ambulance.latitude and ambulance.longitude else None,
        equipment=ambulance.equipment,
        fuel_level=ambulance.fuel_level,
        mileage=ambulance.mileage
    )
    db.add(db_ambulance)
    db.commit()
    db.refresh(db_ambulance)
    return db_ambulance

def update_ambulance(db: Session, ambulance_id: int, ambulance_update: AmbulanceUpdate) -> Optional[Ambulance]:
    db_ambulance = get_ambulance(db, ambulance_id)
    if db_ambulance:
        update_data = ambulance_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_ambulance, field, value)
        
        # Mettre à jour la timestamp de localisation si les coordonnées changent
        if 'latitude' in update_data or 'longitude' in update_data:
            db_ambulance.location_updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_ambulance)
    return db_ambulance

def update_ambulance_location(db: Session, ambulance_id: int, location: AmbulanceLocation) -> Optional[Ambulance]:
    db_ambulance = get_ambulance(db, ambulance_id)
    if db_ambulance:
        db_ambulance.latitude = location.latitude
        db_ambulance.longitude = location.longitude
        db_ambulance.location_updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_ambulance)
    return db_ambulance

def update_ambulance_status(db: Session, ambulance_id: int, status: AmbulanceStatus) -> Optional[Ambulance]:
    db_ambulance = get_ambulance(db, ambulance_id)
    if db_ambulance:
        db_ambulance.status = status
        db.commit()
        db.refresh(db_ambulance)
    return db_ambulance

def delete_ambulance(db: Session, ambulance_id: int) -> bool:
    db_ambulance = get_ambulance(db, ambulance_id)
    if db_ambulance:
        db.delete(db_ambulance)
        db.commit()
        return True
    return False