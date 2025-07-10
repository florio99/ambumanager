const express = require('express');
const { body, validationResult } = require('express-validator');
const { ambulances } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les ambulances
router.get('/', authenticateToken, (req, res) => {
  const { skip = 0, limit = 100 } = req.query;
  const startIndex = parseInt(skip);
  const endIndex = startIndex + parseInt(limit);
  
  const ambulanceList = ambulances.slice(startIndex, endIndex);
  res.json(ambulanceList);
});

// Obtenir les ambulances disponibles
router.get('/available', authenticateToken, (req, res) => {
  const availableAmbulances = ambulances.filter(a => a.status === 'disponible');
  res.json(availableAmbulances);
});

// Créer une nouvelle ambulance
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'regulateur']),
  body('plate_number').notEmpty().withMessage('Le numéro de plaque est requis'),
  body('model').notEmpty().withMessage('Le modèle est requis'),
  body('capacity').isInt({ min: 1 }).withMessage('La capacité doit être un nombre positif')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plate_number, model, capacity, status = 'disponible', latitude, longitude, equipment = [], fuel_level = 100, mileage = 0 } = req.body;

    // Vérifier si la plaque existe déjà
    const existingAmbulance = ambulances.find(a => a.plate_number === plate_number);
    if (existingAmbulance) {
      return res.status(400).json({ message: 'Numéro de plaque déjà enregistré' });
    }

    // Créer la nouvelle ambulance
    const newAmbulance = {
      id: (ambulances.length + 1).toString(),
      plate_number,
      model,
      capacity,
      status,
      latitude: latitude || 48.8566,
      longitude: longitude || 2.3522,
      location_updated_at: new Date(),
      equipment,
      fuel_level,
      mileage,
      created_at: new Date(),
      updated_at: new Date()
    };

    ambulances.push(newAmbulance);
    res.status(201).json(newAmbulance);
  } catch (error) {
    console.error('Erreur création ambulance:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir une ambulance par ID
router.get('/:id', authenticateToken, (req, res) => {
  const ambulance = ambulances.find(a => a.id === req.params.id);
  if (!ambulance) {
    return res.status(404).json({ message: 'Ambulance non trouvée' });
  }
  res.json(ambulance);
});

// Mettre à jour une ambulance
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'regulateur'])
], (req, res) => {
  try {
    const ambulanceIndex = ambulances.findIndex(a => a.id === req.params.id);
    if (ambulanceIndex === -1) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    const updateData = { ...req.body, updated_at: new Date() };
    
    // Mettre à jour la timestamp de localisation si les coordonnées changent
    if (updateData.latitude || updateData.longitude) {
      updateData.location_updated_at = new Date();
    }

    ambulances[ambulanceIndex] = { ...ambulances[ambulanceIndex], ...updateData };
    res.json(ambulances[ambulanceIndex]);
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
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ambulanceIndex = ambulances.findIndex(a => a.id === req.params.id);
    if (ambulanceIndex === -1) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    const { latitude, longitude } = req.body;
    ambulances[ambulanceIndex].latitude = latitude;
    ambulances[ambulanceIndex].longitude = longitude;
    ambulances[ambulanceIndex].location_updated_at = new Date();
    ambulances[ambulanceIndex].updated_at = new Date();

    res.json(ambulances[ambulanceIndex]);
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
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ambulanceIndex = ambulances.findIndex(a => a.id === req.params.id);
    if (ambulanceIndex === -1) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    ambulances[ambulanceIndex].status = req.body.status;
    ambulances[ambulanceIndex].updated_at = new Date();

    res.json(ambulances[ambulanceIndex]);
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer une ambulance
router.delete('/:id', authenticateToken, requireRole(['admin', 'regulateur']), (req, res) => {
  const ambulanceIndex = ambulances.findIndex(a => a.id === req.params.id);
  if (ambulanceIndex === -1) {
    return res.status(404).json({ message: 'Ambulance non trouvée' });
  }

  ambulances.splice(ambulanceIndex, 1);
  res.json({ message: 'Ambulance supprimée avec succès' });
});

module.exports = router;