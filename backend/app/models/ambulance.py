from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, JSON, Text
from sqlalchemy.sql import func
from app.database.base import Base
import enum

class AmbulanceStatus(str, enum.Enum):
    DISPONIBLE = "disponible"
    EN_MISSION = "en_mission"
    EN_PANNE = "en_panne"
    MAINTENANCE = "maintenance"

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), unique=True, index=True, nullable=False)
    model = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False, default=2)
    status = Column(Enum(AmbulanceStatus), nullable=False, default=AmbulanceStatus.DISPONIBLE)
    latitude = Column(Float)
    longitude = Column(Float)
    location_updated_at = Column(DateTime(timezone=True))
    equipment = Column(JSON)  # Liste des équipements
    fuel_level = Column(Integer, default=100)  # Pourcentage
    mileage = Column(Integer, default=0)  # Kilométrage
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())