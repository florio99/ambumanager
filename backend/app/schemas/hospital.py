from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class HospitalBase(BaseModel):
    name: str
    address: str
    phone: str
    email: Optional[EmailStr] = None
    latitude: float
    longitude: float
    emergency_beds: int = 0
    icu_beds: int = 0
    general_beds: int = 0
    specialties: Optional[List[str]] = []
    is_active: bool = True

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    emergency_beds: Optional[int] = None
    icu_beds: Optional[int] = None
    general_beds: Optional[int] = None
    specialties: Optional[List[str]] = None
    is_active: Optional[bool] = None

class HospitalInDB(HospitalBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Hospital(HospitalInDB):
    pass