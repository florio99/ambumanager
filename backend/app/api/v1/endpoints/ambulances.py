from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.api.deps import get_current_active_user, get_admin_or_regulateur_user
from app.crud import ambulance as crud_ambulance
from app.schemas.ambulance import Ambulance, AmbulanceCreate, AmbulanceUpdate, AmbulanceLocation
from app.models.ambulance import AmbulanceStatus
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Ambulance])
def read_ambulances(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    ambulances = crud_ambulance.get_ambulances(db, skip=skip, limit=limit)
    return ambulances

@router.get("/available", response_model=List[Ambulance])
def read_available_ambulances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    ambulances = crud_ambulance.get_available_ambulances(db)
    return ambulances

@router.post("/", response_model=Ambulance)
def create_ambulance(
    ambulance: AmbulanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    db_ambulance = crud_ambulance.get_ambulance_by_plate(db, plate_number=ambulance.plate_number)
    if db_ambulance:
        raise HTTPException(status_code=400, detail="Plate number already registered")
    return crud_ambulance.create_ambulance(db=db, ambulance=ambulance)

@router.get("/{ambulance_id}", response_model=Ambulance)
def read_ambulance(
    ambulance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_ambulance = crud_ambulance.get_ambulance(db, ambulance_id=ambulance_id)
    if db_ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return db_ambulance

@router.put("/{ambulance_id}", response_model=Ambulance)
def update_ambulance(
    ambulance_id: int,
    ambulance_update: AmbulanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    db_ambulance = crud_ambulance.update_ambulance(db, ambulance_id=ambulance_id, ambulance_update=ambulance_update)
    if db_ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return db_ambulance

@router.put("/{ambulance_id}/location", response_model=Ambulance)
def update_ambulance_location(
    ambulance_id: int,
    location: AmbulanceLocation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_ambulance = crud_ambulance.update_ambulance_location(db, ambulance_id=ambulance_id, location=location)
    if db_ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return db_ambulance

@router.put("/{ambulance_id}/status", response_model=Ambulance)
def update_ambulance_status(
    ambulance_id: int,
    status: AmbulanceStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    db_ambulance = crud_ambulance.update_ambulance_status(db, ambulance_id=ambulance_id, status=status)
    if db_ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return db_ambulance

@router.delete("/{ambulance_id}")
def delete_ambulance(
    ambulance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    success = crud_ambulance.delete_ambulance(db, ambulance_id=ambulance_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return {"message": "Ambulance deleted successfully"}