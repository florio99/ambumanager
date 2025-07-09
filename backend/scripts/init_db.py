#!/usr/bin/env python3
"""
Script d'initialisation de la base de données avec des données de démonstration
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database.base import SessionLocal, engine, Base
from app.crud.user import create_user
from app.crud.ambulance import create_ambulance
from app.crud.mission import create_mission
from app.schemas.user import UserCreate
from app.schemas.ambulance import AmbulanceCreate
from app.schemas.mission import MissionCreate
from app.models.user import UserRole
from app.models.ambulance import AmbulanceStatus
from app.models.mission import MissionPriority
from app.models.user import User
from app.models.ambulance import Ambulance
from app.models.hospital import Hospital
from app.models.mission import Mission

def init_database():
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        print("Initialisation de la base de données...")
        
        # Créer les utilisateurs de démonstration
        users_data = [
            {
                "username": "admin",
                "email": "admin@ambulance.com",
                "password": "admin123",
                "first_name": "Admin",
                "last_name": "Système",
                "phone": "+33123456789",
                "role": UserRole.ADMIN
            },
            {
                "username": "regulateur",
                "email": "regulateur@ambulance.com",
                "password": "demo123",
                "first_name": "Marie",
                "last_name": "Dupont",
                "phone": "+33123456790",
                "role": UserRole.REGULATEUR
            },
            {
                "username": "ambulancier",
                "email": "ambulancier@ambulance.com",
                "password": "demo123",
                "first_name": "Pierre",
                "last_name": "Martin",
                "phone": "+33123456791",
                "role": UserRole.AMBULANCIER
            }
        ]
        
        for user_data in users_data:
            user = UserCreate(**user_data)
            created_user = create_user(db, user)
            print(f"Utilisateur créé: {created_user.username}")
        
        # Créer les ambulances de démonstration
        ambulances_data = [
            {
                "plate_number": "AMB-001",
                "model": "Mercedes Sprinter",
                "capacity": 2,
                "status": AmbulanceStatus.DISPONIBLE,
                "latitude": 48.8566,
                "longitude": 2.3522,
                "equipment": ["Défibrillateur", "Respirateur", "Brancard", "Oxygène"],
                "fuel_level": 85,
                "mileage": 45230
            },
            {
                "plate_number": "AMB-002",
                "model": "Volkswagen Crafter",
                "capacity": 2,
                "status": AmbulanceStatus.EN_MISSION,
                "latitude": 48.8606,
                "longitude": 2.3376,
                "equipment": ["Défibrillateur", "Respirateur", "Brancard", "Oxygène"],
                "fuel_level": 62,
                "mileage": 38750
            },
            {
                "plate_number": "AMB-003",
                "model": "Ford Transit",
                "capacity": 1,
                "status": AmbulanceStatus.MAINTENANCE,
                "latitude": 48.8534,
                "longitude": 2.3488,
                "equipment": ["Défibrillateur", "Brancard", "Oxygène"],
                "fuel_level": 95,
                "mileage": 52100
            }
        ]
        
        for ambulance_data in ambulances_data:
            ambulance = AmbulanceCreate(**ambulance_data)
            created_ambulance = create_ambulance(db, ambulance)
            print(f"Ambulance créée: {created_ambulance.plate_number}")
        
        print("Base de données initialisée avec succès!")
        
    except Exception as e:
        print(f"Erreur lors de l'initialisation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()