const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ambulanceRoutes = require('./routes/ambulances');
const missionRoutes = require('./routes/missions');
const hospitalRoutes = require('./routes/hospitals');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ambulances', ambulanceRoutes);
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Ambulance Management System API with MySQL',
    version: '1.0.0',
    status: 'running',
    database: 'MySQL with Sequelize ORM'
  });
});

// Route de santé
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL établie');

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 API disponible sur http://localhost:${PORT}`);
      console.log(`🏥 Documentation: http://localhost:${PORT}/api/v1`);
      console.log(`💾 Base de données: MySQL avec Sequelize ORM`);
    });
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;