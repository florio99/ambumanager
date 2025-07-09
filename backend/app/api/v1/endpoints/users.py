from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.api.deps import get_current_active_user, get_admin_user
from app.crud import user as crud_user
from app.schemas.user import User, UserCreate, UserUpdate
from app.models.user import User as UserModel

router = APIRouter()

@router.get("/", response_model=List[User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user)
):
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=User)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user)
):
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)

@router.get("/me", response_model=User)
def read_user_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user

@router.get("/{user_id}", response_model=User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user)
):
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user)
):
    db_user = crud_user.update_user(db, user_id=user_id, user_update=user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_user)
):
    success = crud_user.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}