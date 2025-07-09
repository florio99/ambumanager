from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base
import enum

class MissionPriority(str, enum.Enum):
    CRITIQUE = "critique"
    URGENTE = "urgente"
    NORMALE = "normale"
    FAIBLE = "faible"

class MissionStatus(str, enum.Enum):
    EN_ATTENTE = "en_attente"
    ASSIGNEE = "assignee"
    EN_COURS = "en_cours"
    TERMINEE = "terminee"
    ANNULEE = "annulee"

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(100), nullable=False)
    patient_phone = Column(String(20), nullable=False)
    patient_age = Column(Integer)
    patient_condition = Column(String(200), nullable=False)
    priority = Column(Enum(MissionPriority), nullable=False)
    status = Column(Enum(MissionStatus), default=MissionStatus.EN_ATTENTE)
    
    # Localisation de prise en charge
    pickup_address = Column(String(500), nullable=False)
    pickup_latitude = Column(Float, nullable=False)
    pickup_longitude = Column(Float, nullable=False)
    
    # Destination
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    
    # Assignation
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"))
    assigned_personnel = Column(JSON)  # Liste des IDs du personnel assigné
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    assigned_at = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    estimated_duration = Column(Integer, default=30)  # minutes
    actual_duration = Column(Integer)  # minutes
    
    # Informations supplémentaires
    symptoms = Column(JSON)  # Liste des symptômes
    notes = Column(Text)
    
    # Relations
    hospital = relationship("Hospital")
    ambulance = relationship("Ambulance")