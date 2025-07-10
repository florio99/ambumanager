const express = require('express');
const { body, validationResult } = require('express-validator');
const { hospitals } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les hôpitaux
router.get('/', authenticateToken, (req, res) => {
  const { skip = 0, limit = 100 } = req.query;
  const startIndex = parseInt(skip);
  const endIndex = startIndex + parseInt(limit);
  
  const hospitalList = hospitals.slice(startIndex, endIndex);
  res.json(hospitalList);
});

// Créer un nouvel hôpital
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'regulateur']),
  body('name').notEmpty().withMessage('Le nom de l\'hôpital est requis'),
  body('address').notEmpty().withMessage('L\'adresse est requise'),
  body('phone').notEmpty().withMessage('Le téléphone est requis'),
  body('latitude').isFloat().withMessage('Latitude invalide'),
  body('longitude').isFloat().withMessage('Longitude invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
      emergency_beds = 0,
      icu_beds = 0,
      general_beds = 0,
      specialties = [],
      is_active = true
    } = req.body;

    // Créer le nouvel hôpital
    const newHospital = {
      id: (hospitals.length + 1).toString(),
      name,
      address,
      phone,
      email: email || null,
      latitude,
      longitude,
      emergency_beds,
      icu_beds,
      general_beds,
      specialties,
      is_active,
      created_at: new Date(),
      updated_at: new Date()
    };

    hospitals.push(newHospital);
    res.status(201).json(newHospital);
  } catch (error) {
    console.error('Erreur création hôpital:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir un hôpital par ID
router.get('/:id', authenticateToken, (req, res) => {
  const hospital = hospitals.find(h => h.id === req.params.id);
  if (!hospital) {
    return res.status(404).json({ message: 'Hôpital non trouvé' });
  }
  res.json(hospital);
});

// Mettre à jour un hôpital
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'regulateur'])
], (req, res) => {
  try {
    const hospitalIndex = hospitals.findIndex(h => h.id === req.params.id);
    if (hospitalIndex === -1) {
      return res.status(404).json({ message: 'Hôpital non trouvé' });
    }

    const updateData = { ...req.body, updated_at: new Date() };
    hospitals[hospitalIndex] = { ...hospitals[hospitalIndex], ...updateData };
    
    res.json(hospitals[hospitalIndex]);
  } catch (error) {
    console.error('Erreur mise à jour hôpital:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer un hôpital
router.delete('/:id', authenticateToken, requireRole(['admin', 'regulateur']), (req, res) => {
  const hospitalIndex = hospitals.findIndex(h => h.id === req.params.id);
  if (hospitalIndex === -1) {
    return res.status(404).json({ message: 'Hôpital non trouvé' });
  }

  hospitals.splice(hospitalIndex, 1);
  res.json({ message: 'Hôpital supprimé avec succès' });
});

module.exports = router;