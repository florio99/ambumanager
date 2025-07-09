from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.mission import MissionPriority, MissionStatus

class MissionBase(BaseModel):
    patient_name: str
    patient_phone: str
    patient_age: Optional[int] = None
    patient_condition: str
    priority: MissionPriority
    pickup_address: str
    pickup_latitude: float
    pickup_longitude: float
    hospital_id: int
    estimated_duration: int = 30
    symptoms: Optional[List[str]] = []
    notes: Optional[str] = None

class MissionCreate(MissionBase):
    pass

class MissionUpdate(BaseModel):
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    patient_age: Optional[int] = None
    patient_condition: Optional[str] = None
    priority: Optional[MissionPriority] = None
    status: Optional[MissionStatus] = None
    pickup_address: Optional[str] = None
    pickup_latitude: Optional[float] = None
    pickup_longitude: Optional[float] = None
    hospital_id: Optional[int] = None
    ambulance_id: Optional[int] = None
    assigned_personnel: Optional[List[int]] = None
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None

class MissionAssignment(BaseModel):
    ambulance_id: int
    personnel_ids: List[int]

class MissionInDB(MissionBase):
    id: int
    status: MissionStatus
    ambulance_id: Optional[int] = None
    assigned_personnel: Optional[List[int]] = []
    created_at: datetime
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    actual_duration: Optional[int] = None

    class Config:
        from_attributes = True

class Mission(MissionInDB):
    pass