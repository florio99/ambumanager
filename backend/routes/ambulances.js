const express = require('express');
const { body, validationResult } = require('express-validator');
const { Ambulance } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les ambulances
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, limit = 100 } = req.query;
    const offset = parseInt(skip);
    const limitNum = parseInt(limit);
    
    const ambulances = await Ambulance.findAll({
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    });

    res.json(ambulances);
  } catch (error) {
    console.error('Erreur récupération ambulances:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir les ambulances disponibles
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const availableAmbulances = await Ambulance.findAll({
      where: { status: 'disponible' },
      order: [['createdAt', 'DESC']]
    });

    res.json(availableAmbulances);
  } catch (error) {
    console.error('Erreur récupération ambulances disponibles:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Créer une nouvelle ambulance
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'regulateur']),
  body('plate_number').notEmpty().withMessage('Le numéro de plaque est requis'),
  body('model').notEmpty().withMessage('Le modèle est requis'),
  body('capacity').isInt({ min: 1 }).withMessage('La capacité doit être un nombre positif')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plate_number, model, capacity, status = 'disponible', latitude, longitude, equipment = [], fuel_level = 100, mileage = 0 } = req.body;

    // Vérifier si la plaque existe déjà
    const existingAmbulance = await Ambulance.findOne({ where: { plateNumber: plate_number } });
    if (existingAmbulance) {
      return res.status(400).json({ message: 'Numéro de plaque déjà enregistré' });
    }

    // Créer la nouvelle ambulance
    const newAmbulance = await Ambulance.create({
      plateNumber: plate_number,
      model,
      capacity,
      status,
      latitude: latitude || 48.8566,
      longitude: longitude || 2.3522,
      locationUpdatedAt: new Date(),
      equipment,
      fuelLevel: fuel_level,
      mileage
    });

    res.status(201).json(newAmbulance);
  } catch (error) {
    console.error('Erreur création ambulance:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir une ambulance par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ambulance = await Ambulance.findByPk(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }
    res.json(ambulance);
  } catch (error) {
    console.error('Erreur récupération ambulance:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour une ambulance
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'regulateur'])
], async (req, res) => {
  try {
    const ambulance = await Ambulance.findByPk(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    const updateData = { ...req.body };
    
    // Mettre à jour la timestamp de localisation si les coordonnées changent
    if (updateData.latitude || updateData.longitude) {
      updateData.locationUpdatedAt = new Date();
    }

    await ambulance.update(updateData);
    res.json(ambulance);
  } catch (error) {
    console.error('Erreur mise à jour ambulance:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour la localisation d'une ambulance
router.put('/:id/location', [
  authenticateToken,
  body('latitude').isFloat().withMessage('Latitude invalide'),
  body('longitude').isFloat().withMessage('Longitude invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ambulance = await Ambulance.findByPk(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    const { latitude, longitude } = req.body;
    await ambulance.update({
      latitude,
      longitude,
      locationUpdatedAt: new Date()
    });

    res.json(ambulance);
  } catch (error) {
    console.error('Erreur mise à jour localisation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le statut d'une ambulance
router.put('/:id/status', [
  authenticateToken,
  requireRole(['admin', 'regulateur']),
  body('status').isIn(['disponible', 'en_mission', 'en_panne', 'maintenance']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ambulance = await Ambulance.findByPk(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    await ambulance.update({ status: req.body.status });
    res.json(ambulance);
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer une ambulance
router.delete('/:id', authenticateToken, requireRole(['admin', 'regulateur']), async (req, res) => {
  try {
    const ambulance = await Ambulance.findByPk(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    await ambulance.destroy();
    res.json({ message: 'Ambulance supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression ambulance:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;