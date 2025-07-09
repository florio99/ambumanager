from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.database.base import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    address = Column(String(500), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    emergency_beds = Column(Integer, default=0)
    icu_beds = Column(Integer, default=0)
    general_beds = Column(Integer, default=0)
    specialties = Column(JSON)  # Liste des spécialités
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())