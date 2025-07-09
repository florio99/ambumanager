from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.ambulance import AmbulanceStatus

class AmbulanceBase(BaseModel):
    plate_number: str
    model: str
    capacity: int = 2
    status: AmbulanceStatus = AmbulanceStatus.DISPONIBLE
    equipment: Optional[List[str]] = []
    fuel_level: int = 100
    mileage: int = 0

class AmbulanceCreate(AmbulanceBase):
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AmbulanceUpdate(BaseModel):
    plate_number: Optional[str] = None
    model: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[AmbulanceStatus] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    equipment: Optional[List[str]] = None
    fuel_level: Optional[int] = None
    mileage: Optional[int] = None

class AmbulanceLocation(BaseModel):
    latitude: float
    longitude: float

class AmbulanceInDB(AmbulanceBase):
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_updated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Ambulance(AmbulanceInDB):
    pass