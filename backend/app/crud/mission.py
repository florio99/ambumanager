from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.mission import Mission, MissionStatus
from app.schemas.mission import MissionCreate, MissionUpdate, MissionAssignment
from datetime import datetime

def get_mission(db: Session, mission_id: int) -> Optional[Mission]:
    return db.query(Mission).filter(Mission.id == mission_id).first()

def get_missions(db: Session, skip: int = 0, limit: int = 100) -> List[Mission]:
    return db.query(Mission).offset(skip).limit(limit).all()

def get_missions_by_status(db: Session, status: MissionStatus) -> List[Mission]:
    return db.query(Mission).filter(Mission.status == status).all()

def get_active_missions(db: Session) -> List[Mission]:
    active_statuses = [MissionStatus.EN_ATTENTE, MissionStatus.ASSIGNEE, MissionStatus.EN_COURS]
    return db.query(Mission).filter(Mission.status.in_(active_statuses)).all()

def create_mission(db: Session, mission: MissionCreate) -> Mission:
    db_mission = Mission(
        patient_name=mission.patient_name,
        patient_phone=mission.patient_phone,
        patient_age=mission.patient_age,
        patient_condition=mission.patient_condition,
        priority=mission.priority,
        pickup_address=mission.pickup_address,
        pickup_latitude=mission.pickup_latitude,
        pickup_longitude=mission.pickup_longitude,
        hospital_id=mission.hospital_id,
        estimated_duration=mission.estimated_duration,
        symptoms=mission.symptoms,
        notes=mission.notes
    )
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission

def update_mission(db: Session, mission_id: int, mission_update: MissionUpdate) -> Optional[Mission]:
    db_mission = get_mission(db, mission_id)
    if db_mission:
        update_data = mission_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_mission, field, value)
        db.commit()
        db.refresh(db_mission)
    return db_mission

def assign_mission(db: Session, mission_id: int, assignment: MissionAssignment) -> Optional[Mission]:
    db_mission = get_mission(db, mission_id)
    if db_mission:
        db_mission.ambulance_id = assignment.ambulance_id
        db_mission.assigned_personnel = assignment.personnel_ids
        db_mission.status = MissionStatus.ASSIGNEE
        db_mission.assigned_at = datetime.utcnow()
        db.commit()
        db.refresh(db_mission)
    return db_mission

def update_mission_status(db: Session, mission_id: int, status: MissionStatus) -> Optional[Mission]:
    db_mission = get_mission(db, mission_id)
    if db_mission:
        db_mission.status = status
        
        if status == MissionStatus.EN_COURS and not db_mission.started_at:
            db_mission.started_at = datetime.utcnow()
        elif status == MissionStatus.TERMINEE and not db_mission.completed_at:
            db_mission.completed_at = datetime.utcnow()
            if db_mission.started_at:
                duration = (datetime.utcnow() - db_mission.started_at).total_seconds() / 60
                db_mission.actual_duration = int(duration)
        
        db.commit()
        db.refresh(db_mission)
    return db_mission

def delete_mission(db: Session, mission_id: int) -> bool:
    db_mission = get_mission(db, mission_id)
    if db_mission:
        db.delete(db_mission)
        db.commit()
        return True
    return False