from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, ambulances, missions

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ambulances.router, prefix="/ambulances", tags=["ambulances"])
api_router.include_router(missions.router, prefix="/missions", tags=["missions"])