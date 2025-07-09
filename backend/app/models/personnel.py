from sqlalchemy import Column, Integer, String, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base
import enum

class PersonnelRole(str, enum.Enum):
    AMBULANCIER = "ambulancier"
    PARAMEDIC = "paramedic"
    MEDECIN = "medecin"
    REGULATEUR = "regulateur"

class PersonnelStatus(str, enum.Enum):
    DISPONIBLE = "disponible"
    EN_SERVICE = "en_service"
    REPOS = "repos"
    CONGE = "conge"

class Personnel(Base):
    __tablename__ = "personnel"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    role = Column(Enum(PersonnelRole), nullable=False)
    qualifications = Column(JSON)  # Liste des qualifications
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    status = Column(Enum(PersonnelStatus), default=PersonnelStatus.DISPONIBLE)
    assigned_ambulance_id = Column(Integer, ForeignKey("ambulances.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    user = relationship("User")
    assigned_ambulance = relationship("Ambulance")