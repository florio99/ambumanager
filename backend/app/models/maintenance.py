from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base
import enum

class MaintenanceType(str, enum.Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    URGENTE = "urgente"

class MaintenanceStatus(str, enum.Enum):
    PLANIFIEE = "planifiee"
    EN_COURS = "en_cours"
    TERMINEE = "terminee"
    REPORTEE = "reportee"

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=False)
    type = Column(Enum(MaintenanceType), nullable=False)
    description = Column(Text, nullable=False)
    cost = Column(Float, default=0.0)
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    completed_date = Column(DateTime(timezone=True))
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.PLANIFIEE)
    technician = Column(String(100), nullable=False)
    parts = Column(JSON)  # Liste des pièces utilisées
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    ambulance = relationship("Ambulance")