# Backend API - Système de Gestion d'Ambulances

## Description

API REST développée avec FastAPI pour le système de gestion d'ambulances. Cette API fournit tous les endpoints nécessaires pour gérer les utilisateurs, ambulances, missions, hôpitaux, personnel et maintenance.

## Fonctionnalités

- **Authentification JWT** : Système d'authentification sécurisé
- **Gestion des utilisateurs** : CRUD complet avec rôles (admin, régulateur, ambulancier)
- **Gestion des ambulances** : Suivi en temps réel, statuts, localisation
- **Gestion des missions** : Création, assignation, suivi des missions d'urgence
- **Gestion des hôpitaux** : Base de données des établissements de santé
- **Gestion du personnel** : Équipes, qualifications, plannings
- **Maintenance** : Suivi des interventions et coûts

## Installation

### Prérequis

- Python 3.8+
- MySQL 8.0+
- pip

### Configuration de la base de données

1. Créer une base de données MySQL :
```sql
CREATE DATABASE ambulance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ambulance_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ambulance_db.* TO 'ambulance_user'@'localhost';
FLUSH PRIVILEGES;
```

### Installation des dépendances

```bash
cd backend
pip install -r requirements.txt
```

### Configuration

1. Copier le fichier de configuration :
```bash
cp .env.example .env
```

2. Modifier le fichier `.env` avec vos paramètres :
```env
DATABASE_URL=mysql+pymysql://ambulance_user:your_password@localhost:3306/ambulance_db
SECRET_KEY=your-secret-key-change-in-production
```

### Initialisation de la base de données

```bash
# Créer les tables
python scripts/init_db.py

# Ou utiliser Alembic pour les migrations
alembic upgrade head
```

### Démarrage du serveur

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

L'API sera accessible sur : http://localhost:8000

## Documentation

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## Endpoints principaux

### Authentification
- `POST /api/v1/auth/login` : Connexion utilisateur

### Utilisateurs
- `GET /api/v1/users/` : Liste des utilisateurs
- `POST /api/v1/users/` : Créer un utilisateur
- `GET /api/v1/users/me` : Profil utilisateur actuel
- `GET /api/v1/users/{user_id}` : Détails d'un utilisateur
- `PUT /api/v1/users/{user_id}` : Modifier un utilisateur
- `DELETE /api/v1/users/{user_id}` : Supprimer un utilisateur

### Ambulances
- `GET /api/v1/ambulances/` : Liste des ambulances
- `GET /api/v1/ambulances/available` : Ambulances disponibles
- `POST /api/v1/ambulances/` : Créer une ambulance
- `GET /api/v1/ambulances/{ambulance_id}` : Détails d'une ambulance
- `PUT /api/v1/ambulances/{ambulance_id}` : Modifier une ambulance
- `PUT /api/v1/ambulances/{ambulance_id}/location` : Mettre à jour la localisation
- `PUT /api/v1/ambulances/{ambulance_id}/status` : Changer le statut
- `DELETE /api/v1/ambulances/{ambulance_id}` : Supprimer une ambulance

### Missions
- `GET /api/v1/missions/` : Liste des missions
- `GET /api/v1/missions/active` : Missions actives
- `GET /api/v1/missions/status/{status}` : Missions par statut
- `POST /api/v1/missions/` : Créer une mission
- `GET /api/v1/missions/{mission_id}` : Détails d'une mission
- `PUT /api/v1/missions/{mission_id}` : Modifier une mission
- `POST /api/v1/missions/{mission_id}/assign` : Assigner une mission
- `PUT /api/v1/missions/{mission_id}/status` : Changer le statut
- `DELETE /api/v1/missions/{mission_id}` : Supprimer une mission

## Modèles de données

### User
- Gestion des utilisateurs avec rôles
- Authentification JWT
- Profils personnalisés

### Ambulance
- Informations véhicule
- Localisation GPS en temps réel
- Statuts et équipements
- Suivi carburant et kilométrage

### Mission
- Informations patient
- Localisation prise en charge
- Destination hôpital
- Assignation équipe
- Suivi temporel

### Hospital
- Base de données établissements
- Capacités d'accueil
- Spécialités médicales
- Coordonnées GPS

## Sécurité

- **JWT Authentication** : Tokens sécurisés
- **CORS** : Configuration des origines autorisées
- **Validation** : Pydantic pour la validation des données
- **Hachage** : Mots de passe sécurisés avec bcrypt

## Développement

### Structure du projet
```
backend/
├── app/
│   ├── api/           # Endpoints API
│   ├── core/          # Configuration et sécurité
│   ├── crud/          # Opérations base de données
│   ├── database/      # Configuration DB
│   ├── models/        # Modèles SQLAlchemy
│   └── schemas/       # Schémas Pydantic
├── alembic/           # Migrations DB
├── scripts/           # Scripts utilitaires
└── requirements.txt   # Dépendances
```

### Tests
```bash
# Installer les dépendances de test
pip install pytest pytest-asyncio httpx

# Lancer les tests
pytest
```

### Migrations
```bash
# Créer une migration
alembic revision --autogenerate -m "Description"

# Appliquer les migrations
alembic upgrade head
```

## Production

### Variables d'environnement importantes
- `SECRET_KEY` : Clé secrète pour JWT (obligatoire)
- `DATABASE_URL` : URL de connexion à la base de données
- `DEBUG` : False en production
- `ALLOWED_ORIGINS` : Origines CORS autorisées

### Déploiement
```bash
# Avec Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Support

Pour toute question ou problème, consultez la documentation Swagger à l'adresse `/docs` une fois le serveur démarré.