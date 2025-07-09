#!/usr/bin/env python3
"""
Script pour créer un utilisateur administrateur
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database.base import SessionLocal
from app.crud.user import create_user, get_user_by_username
from app.schemas.user import UserCreate
from app.models.user import UserRole

def create_admin_user():
    db: Session = SessionLocal()
    
    try:
        # Vérifier si l'admin existe déjà
        existing_admin = get_user_by_username(db, "admin")
        if existing_admin:
            print("L'utilisateur admin existe déjà")
            return
        
        # Créer l'utilisateur admin
        admin_user = UserCreate(
            username="admin",
            email="admin@ambulance.com",
            password="admin123",  # Changez ce mot de passe en production !
            first_name="Admin",
            last_name="Système",
            phone="+33123456789",
            role=UserRole.ADMIN,
            is_active=True
        )
        
        created_user = create_user(db, admin_user)
        print(f"Utilisateur admin créé avec succès: {created_user.username}")
        
        # Créer un régulateur de démonstration
        regulateur_user = UserCreate(
            username="regulateur",
            email="regulateur@ambulance.com",
            password="demo123",
            first_name="Marie",
            last_name="Dupont",
            phone="+33123456790",
            role=UserRole.REGULATEUR,
            is_active=True
        )
        
        created_regulateur = create_user(db, regulateur_user)
        print(f"Utilisateur régulateur créé avec succès: {created_regulateur.username}")
        
        # Créer un ambulancier de démonstration
        ambulancier_user = UserCreate(
            username="ambulancier",
            email="ambulancier@ambulance.com",
            password="demo123",
            first_name="Pierre",
            last_name="Martin",
            phone="+33123456791",
            role=UserRole.AMBULANCIER,
            is_active=True
        )
        
        created_ambulancier = create_user(db, ambulancier_user)
        print(f"Utilisateur ambulancier créé avec succès: {created_ambulancier.username}")
        
    except Exception as e:
        print(f"Erreur lors de la création des utilisateurs: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()