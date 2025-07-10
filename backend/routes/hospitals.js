const express = require('express');
const { body, validationResult } = require('express-validator');
const { Hospital } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les hôpitaux
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, limit = 100 } = req.query;
    const offset = parseInt(skip);
    const limitNum = parseInt(limit);
    
    const hospitals = await Hospital.findAll({
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    });

    res.json(hospitals);
  } catch (error) {
    console.error('Erreur récupération hôpitaux:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
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
], async (req, res) => {
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
    const newHospital = await Hospital.create({
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
      emergencyBeds: emergency_beds,
      icuBeds: icu_beds,
      generalBeds: general_beds,
      specialties,
      isActive: is_active
    });

    res.status(201).json(newHospital);
  } catch (error) {
    console.error('Erreur création hôpital:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir un hôpital par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hôpital non trouvé' });
    }
    res.json(hospital);
  } catch (error) {
    console.error('Erreur récupération hôpital:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour un hôpital
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'regulateur'])
], async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hôpital non trouvé' });
    }

    await hospital.update(req.body);
    res.json(hospital);
  } catch (error) {
    console.error('Erreur mise à jour hôpital:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer un hôpital
router.delete('/:id', authenticateToken, requireRole(['admin', 'regulateur']), async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hôpital non trouvé' });
    }

    await hospital.destroy();
    res.json({ message: 'Hôpital supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression hôpital:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;