from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.api.deps import get_current_active_user, get_admin_or_regulateur_user
from app.crud import mission as crud_mission
from app.schemas.mission import Mission, MissionCreate, MissionUpdate, MissionAssignment
from app.models.mission import MissionStatus
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Mission])
def read_missions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    missions = crud_mission.get_missions(db, skip=skip, limit=limit)
    return missions

@router.get("/active", response_model=List[Mission])
def read_active_missions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    missions = crud_mission.get_active_missions(db)
    return missions

@router.get("/status/{status}", response_model=List[Mission])
def read_missions_by_status(
    status: MissionStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    missions = crud_mission.get_missions_by_status(db, status=status)
    return missions

@router.post("/", response_model=Mission)
def create_mission(
    mission: MissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    return crud_mission.create_mission(db=db, mission=mission)

@router.get("/{mission_id}", response_model=Mission)
def read_mission(
    mission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_mission = crud_mission.get_mission(db, mission_id=mission_id)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return db_mission

@router.put("/{mission_id}", response_model=Mission)
def update_mission(
    mission_id: int,
    mission_update: MissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    db_mission = crud_mission.update_mission(db, mission_id=mission_id, mission_update=mission_update)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return db_mission

@router.post("/{mission_id}/assign", response_model=Mission)
def assign_mission(
    mission_id: int,
    assignment: MissionAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    db_mission = crud_mission.assign_mission(db, mission_id=mission_id, assignment=assignment)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return db_mission

@router.put("/{mission_id}/status", response_model=Mission)
def update_mission_status(
    mission_id: int,
    status: MissionStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_mission = crud_mission.update_mission_status(db, mission_id=mission_id, status=status)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return db_mission

@router.delete("/{mission_id}")
def delete_mission(
    mission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_regulateur_user)
):
    success = crud_mission.delete_mission(db, mission_id=mission_id)
    if not success:
        raise HTTPException(status_code=404, detail="Mission not found")
    return {"message": "Mission deleted successfully"}