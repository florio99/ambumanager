const express = require('express');
const { body, validationResult } = require('express-validator');
const { missions, ambulances } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les missions
router.get('/', authenticateToken, (req, res) => {
  const { skip = 0, limit = 100 } = req.query;
  const startIndex = parseInt(skip);
  const endIndex = startIndex + parseInt(limit);
  
  const missionList = missions.slice(startIndex, endIndex);
  res.json(missionList);
});

// Obtenir les missions actives
router.get('/active', authenticateToken, (req, res) => {
  const activeMissions = missions.filter(m => 
    ['en_attente', 'assignee', 'en_cours'].includes(m.status)
  );
  res.json(activeMissions);
});

// Obtenir les missions par statut
router.get('/status/:status', authenticateToken, (req, res) => {
  const { status } = req.params;
  const missionsByStatus = missions.filter(m => m.status === status);
  res.json(missionsByStatus);
});

// Créer une nouvelle mission
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'regulateur']),
  body('patient_name').notEmpty().withMessage('Le nom du patient est requis'),
  body('patient_phone').notEmpty().withMessage('Le téléphone du patient est requis'),
  body('patient_condition').notEmpty().withMessage('La condition du patient est requise'),
  body('priority').isIn(['critique', 'urgente', 'normale', 'faible']).withMessage('Priorité invalide'),
  body('pickup_address').notEmpty().withMessage('L\'adresse de prise en charge est requise'),
  body('pickup_latitude').isFloat().withMessage('Latitude de prise en charge invalide'),
  body('pickup_longitude').isFloat().withMessage('Longitude de prise en charge invalide'),
  body('hospital_id').notEmpty().withMessage('L\'hôpital de destination est requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patient_name,
      patient_phone,
      patient_age,
      patient_condition,
      priority,
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      hospital_id,
      estimated_duration = 30,
      symptoms = [],
      notes = ''
    } = req.body;

    // Créer la nouvelle mission
    const newMission = {
      id: (missions.length + 1).toString(),
      patient_name,
      patient_phone,
      patient_age: patient_age || null,
      patient_condition,
      priority,
      status: 'en_attente',
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      hospital_id,
      ambulance_id: null,
      assigned_personnel: [],
      estimated_duration,
      actual_duration: null,
      symptoms,
      notes,
      created_at: new Date(),
      assigned_at: null,
      started_at: null,
      completed_at: null
    };

    missions.push(newMission);
    res.status(201).json(newMission);
  } catch (error) {
    console.error('Erreur création mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir une mission par ID
router.get('/:id', authenticateToken, (req, res) => {
  const mission = missions.find(m => m.id === req.params.id);
  if (!mission) {
    return res.status(404).json({ message: 'Mission non trouvée' });
  }
  res.json(mission);
});

// Mettre à jour une mission
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'regulateur'])
], (req, res) => {
  try {
    const missionIndex = missions.findIndex(m => m.id === req.params.id);
    if (missionIndex === -1) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    const updateData = { ...req.body };
    missions[missionIndex] = { ...missions[missionIndex], ...updateData };
    
    res.json(missions[missionIndex]);
  } catch (error) {
    console.error('Erreur mise à jour mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Assigner une mission
router.post('/:id/assign', [
  authenticateToken,
  requireRole(['admin', 'regulateur']),
  body('ambulance_id').notEmpty().withMessage('L\'ID de l\'ambulance est requis'),
  body('personnel_ids').isArray().withMessage('La liste du personnel doit être un tableau')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const missionIndex = missions.findIndex(m => m.id === req.params.id);
    if (missionIndex === -1) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    const { ambulance_id, personnel_ids } = req.body;

    // Vérifier que l'ambulance existe et est disponible
    const ambulance = ambulances.find(a => a.id === ambulance_id);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    if (ambulance.status !== 'disponible') {
      return res.status(400).json({ message: 'Ambulance non disponible' });
    }

    // Assigner la mission
    missions[missionIndex].ambulance_id = ambulance_id;
    missions[missionIndex].assigned_personnel = personnel_ids;
    missions[missionIndex].status = 'assignee';
    missions[missionIndex].assigned_at = new Date();

    // Mettre à jour le statut de l'ambulance
    const ambulanceIndex = ambulances.findIndex(a => a.id === ambulance_id);
    if (ambulanceIndex !== -1) {
      ambulances[ambulanceIndex].status = 'en_mission';
      ambulances[ambulanceIndex].updated_at = new Date();
    }

    res.json(missions[missionIndex]);
  } catch (error) {
    console.error('Erreur assignation mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le statut d'une mission
router.put('/:id/status', [
  authenticateToken,
  body('status').isIn(['en_attente', 'assignee', 'en_cours', 'terminee', 'annulee']).withMessage('Statut invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const missionIndex = missions.findIndex(m => m.id === req.params.id);
    if (missionIndex === -1) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    const { status } = req.body;
    const mission = missions[missionIndex];

    // Mettre à jour le statut et les timestamps appropriés
    mission.status = status;

    if (status === 'en_cours' && !mission.started_at) {
      mission.started_at = new Date();
    } else if (status === 'terminee' && !mission.completed_at) {
      mission.completed_at = new Date();
      
      // Calculer la durée réelle
      if (mission.started_at) {
        const duration = (new Date() - new Date(mission.started_at)) / (1000 * 60); // en minutes
        mission.actual_duration = Math.round(duration);
      }

      // Libérer l'ambulance
      if (mission.ambulance_id) {
        const ambulanceIndex = ambulances.findIndex(a => a.id === mission.ambulance_id);
        if (ambulanceIndex !== -1) {
          ambulances[ambulanceIndex].status = 'disponible';
          ambulances[ambulanceIndex].updated_at = new Date();
        }
      }
    }

    res.json(mission);
  } catch (error) {
    console.error('Erreur mise à jour statut mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer une mission
router.delete('/:id', authenticateToken, requireRole(['admin', 'regulateur']), (req, res) => {
  const missionIndex = missions.findIndex(m => m.id === req.params.id);
  if (missionIndex === -1) {
    return res.status(404).json({ message: 'Mission non trouvée' });
  }

  const mission = missions[missionIndex];

  // Libérer l'ambulance si elle était assignée
  if (mission.ambulance_id) {
    const ambulanceIndex = ambulances.findIndex(a => a.id === mission.ambulance_id);
    if (ambulanceIndex !== -1) {
      ambulances[ambulanceIndex].status = 'disponible';
      ambulances[ambulanceIndex].updated_at = new Date();
    }
  }

  missions.splice(missionIndex, 1);
  res.json({ message: 'Mission supprimée avec succès' });
});

module.exports = router;