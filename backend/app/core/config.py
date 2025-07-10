from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/ambulance_db"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_: str = ""
    DB_NAME: str = "ambulance_db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Utiliser une chaîne séparée par des virgules
    ALLOWED_ORIGINS: str = "http://localhost:5173,https://localhost:5173,http://localhost:3000"
    
    # Application
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Ambulance Management System"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convertir la chaîne ALLOWED_ORIGINS en liste"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"

settings = Settings()