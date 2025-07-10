# Backend API - Système de Gestion d'Ambulances (Node.js Express)

## Description

API REST développée avec Node.js et Express pour le système de gestion d'ambulances. Cette API fournit tous les endpoints nécessaires pour gérer les utilisateurs, ambulances, missions et hôpitaux.

## Fonctionnalités

- **Authentification JWT** : Système d'authentification sécurisé
- **Gestion des utilisateurs** : CRUD complet avec rôles (admin, régulateur, ambulancier)
- **Gestion des ambulances** : Suivi en temps réel, statuts, localisation
- **Gestion des missions** : Création, assignation, suivi des missions d'urgence
- **Gestion des hôpitaux** : Base de données des établissements de santé
- **Middleware de sécurité** : Helmet, CORS, Rate limiting
- **Validation des données** : Express-validator

## Installation

### Prérequis

- Node.js 16+
- npm ou yarn

### Installation des dépendances

```bash
cd backend
npm install
```

### Configuration

1. Copier le fichier de configuration :
```bash
cp .env.example .env
```

2. Modifier le fichier `.env` avec vos paramètres :
```env
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173,http://localhost:3000
NODE_ENV=development
```

### Démarrage du serveur

```bash
# Mode développement avec rechargement automatique
npm run dev

# Mode production
npm start
```

L'API sera accessible sur : http://localhost:8000

## Endpoints principaux

### Authentification
- `POST /api/v1/auth/login` : Connexion utilisateur
- `POST /api/v1/auth/logout` : Déconnexion utilisateur
- `GET /api/v1/auth/verify` : Vérifier le token

### Utilisateurs
- `GET /api/v1/users/` : Liste des utilisateurs (admin)
- `POST /api/v1/users/` : Créer un utilisateur (admin)
- `GET /api/v1/users/me` : Profil utilisateur actuel
- `GET /api/v1/users/:id` : Détails d'un utilisateur (admin)
- `PUT /api/v1/users/:id` : Modifier un utilisateur (admin)
- `DELETE /api/v1/users/:id` : Supprimer un utilisateur (admin)

### Ambulances
- `GET /api/v1/ambulances/` : Liste des ambulances
- `GET /api/v1/ambulances/available` : Ambulances disponibles
- `POST /api/v1/ambulances/` : Créer une ambulance (admin/régulateur)
- `GET /api/v1/ambulances/:id` : Détails d'une ambulance
- `PUT /api/v1/ambulances/:id` : Modifier une ambulance (admin/régulateur)
- `PUT /api/v1/ambulances/:id/location` : Mettre à jour la localisation
- `PUT /api/v1/ambulances/:id/status` : Changer le statut (admin/régulateur)
- `DELETE /api/v1/ambulances/:id` : Supprimer une ambulance (admin/régulateur)

### Missions
- `GET /api/v1/missions/` : Liste des missions
- `GET /api/v1/missions/active` : Missions actives
- `GET /api/v1/missions/status/:status` : Missions par statut
- `POST /api/v1/missions/` : Créer une mission (admin/régulateur)
- `GET /api/v1/missions/:id` : Détails d'une mission
- `PUT /api/v1/missions/:id` : Modifier une mission (admin/régulateur)
- `POST /api/v1/missions/:id/assign` : Assigner une mission (admin/régulateur)
- `PUT /api/v1/missions/:id/status` : Changer le statut
- `DELETE /api/v1/missions/:id` : Supprimer une mission (admin/régulateur)

### Hôpitaux
- `GET /api/v1/hospitals/` : Liste des hôpitaux
- `POST /api/v1/hospitals/` : Créer un hôpital (admin/régulateur)
- `GET /api/v1/hospitals/:id` : Détails d'un hôpital
- `PUT /api/v1/hospitals/:id` : Modifier un hôpital (admin/régulateur)
- `DELETE /api/v1/hospitals/:id` : Supprimer un hôpital (admin/régulateur)

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête Authorization :

```
Authorization: Bearer <votre-token>
```

## Comptes de démonstration

- **Admin** : `admin` / `admin123`
- **Régulateur** : `regulateur` / `demo123`
- **Ambulancier** : `ambulancier` / `demo123`

## Structure du projet

```
backend/
├── server.js              # Point d'entrée de l'application
├── middleware/
│   └── auth.js            # Middleware d'authentification
├── routes/
│   ├── auth.js            # Routes d'authentification
│   ├── users.js           # Routes utilisateurs
│   ├── ambulances.js      # Routes ambulances
│   ├── missions.js        # Routes missions
│   └── hospitals.js       # Routes hôpitaux
├── data/
│   └── mockData.js        # Données de démonstration
├── package.json
├── .env                   # Variables d'environnement
└── README.md
```

## Sécurité

- **JWT Authentication** : Tokens sécurisés avec expiration
- **CORS** : Configuration des origines autorisées
- **Helmet** : Protection contre les vulnérabilités communes
- **Rate Limiting** : Limitation du nombre de requêtes
- **Validation** : Validation des données avec express-validator
- **Hachage** : Mots de passe sécurisés avec bcrypt

## Développement

### Ajout de nouvelles routes

1. Créer un nouveau fichier dans `routes/`
2. Définir les routes avec les middlewares appropriés
3. Importer et utiliser dans `server.js`

### Middleware d'authentification

- `authenticateToken` : Vérifier la validité du JWT
- `requireRole(['admin', 'regulateur'])` : Vérifier les permissions

### Validation des données

Utiliser `express-validator` pour valider les données d'entrée :

```javascript
body('email').isEmail().withMessage('Email invalide')
```

## Production

### Variables d'environnement importantes

- `JWT_SECRET` : Clé secrète pour JWT (obligatoire, complexe)
- `NODE_ENV` : `production` pour la production
- `PORT` : Port du serveur
- `ALLOWED_ORIGINS` : Origines CORS autorisées

### Déploiement

```bash
# Installer les dépendances de production uniquement
npm ci --only=production

# Démarrer en mode production
NODE_ENV=production npm start
```

## Monitoring et Logs

- Logs des requêtes avec Morgan
- Gestion d'erreurs centralisée
- Health check sur `/health`

## Support

L'API est documentée et testable via les endpoints. Consultez les routes dans le dossier `routes/` pour plus de détails sur les paramètres et réponses.