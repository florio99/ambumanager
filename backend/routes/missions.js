const express = require('express');
const { body, validationResult } = require('express-validator');
const { Mission, Ambulance, Hospital } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les missions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, limit = 100 } = req.query;
    const offset = parseInt(skip);
    const limitNum = parseInt(limit);
    
    const missions = await Mission.findAll({
      offset,
      limit: limitNum,
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(missions);
  } catch (error) {
    console.error('Erreur récupération missions:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir les missions actives
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeMissions = await Mission.findAll({
      where: {
        status: ['en_attente', 'assignee', 'en_cours']
      },
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(activeMissions);
  } catch (error) {
    console.error('Erreur récupération missions actives:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir les missions par statut
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.params;
    const missionsByStatus = await Mission.findAll({
      where: { status },
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(missionsByStatus);
  } catch (error) {
    console.error('Erreur récupération missions par statut:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
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
], async (req, res) => {
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

    // Vérifier que l'hôpital existe
    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hôpital non trouvé' });
    }

    // Créer la nouvelle mission
    const newMission = await Mission.create({
      patientName: patient_name,
      patientPhone: patient_phone,
      patientAge: patient_age,
      patientCondition: patient_condition,
      priority,
      status: 'en_attente',
      pickupAddress: pickup_address,
      pickupLatitude: pickup_latitude,
      pickupLongitude: pickup_longitude,
      hospitalId: hospital_id,
      estimatedDuration: estimated_duration,
      symptoms,
      notes
    });

    // Récupérer la mission avec les relations
    const missionWithRelations = await Mission.findByPk(newMission.id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ]
    });

    res.status(201).json(missionWithRelations);
  } catch (error) {
    console.error('Erreur création mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir une mission par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const mission = await Mission.findByPk(req.params.id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ]
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    res.json(mission);
  } catch (error) {
    console.error('Erreur récupération mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour une mission
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'regulateur'])
], async (req, res) => {
  try {
    const mission = await Mission.findByPk(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    await mission.update(req.body);

    // Récupérer la mission mise à jour avec les relations
    const updatedMission = await Mission.findByPk(mission.id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ]
    });

    res.json(updatedMission);
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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mission = await Mission.findByPk(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    const { ambulance_id, personnel_ids } = req.body;

    // Vérifier que l'ambulance existe et est disponible
    const ambulance = await Ambulance.findByPk(ambulance_id);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance non trouvée' });
    }

    if (ambulance.status !== 'disponible') {
      return res.status(400).json({ message: 'Ambulance non disponible' });
    }

    // Assigner la mission
    await mission.update({
      ambulanceId: ambulance_id,
      assignedPersonnel: personnel_ids,
      status: 'assignee',
      assignedAt: new Date()
    });

    // Mettre à jour le statut de l'ambulance
    await ambulance.update({ status: 'en_mission' });

    // Récupérer la mission mise à jour avec les relations
    const updatedMission = await Mission.findByPk(mission.id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ]
    });

    res.json(updatedMission);
  } catch (error) {
    console.error('Erreur assignation mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le statut d'une mission
router.put('/:id/status', [
  authenticateToken,
  body('status').isIn(['en_attente', 'assignee', 'en_cours', 'terminee', 'annulee']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mission = await Mission.findByPk(req.params.id, {
      include: [{ model: Ambulance, as: 'ambulance' }]
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    const { status } = req.body;
    const updateData = { status };

    // Mettre à jour les timestamps appropriés
    if (status === 'en_cours' && !mission.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === 'terminee' && !mission.completedAt) {
      updateData.completedAt = new Date();
      
      // Calculer la durée réelle
      if (mission.startedAt) {
        const duration = (new Date() - new Date(mission.startedAt)) / (1000 * 60); // en minutes
        updateData.actualDuration = Math.round(duration);
      }

      // Libérer l'ambulance
      if (mission.ambulance) {
        await mission.ambulance.update({ status: 'disponible' });
      }
    }

    await mission.update(updateData);

    // Récupérer la mission mise à jour avec les relations
    const updatedMission = await Mission.findByPk(mission.id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Ambulance, as: 'ambulance' }
      ]
    });

    res.json(updatedMission);
  } catch (error) {
    console.error('Erreur mise à jour statut mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer une mission
router.delete('/:id', authenticateToken, requireRole(['admin', 'regulateur']), async (req, res) => {
  try {
    const mission = await Mission.findByPk(req.params.id, {
      include: [{ model: Ambulance, as: 'ambulance' }]
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }

    // Libérer l'ambulance si elle était assignée
    if (mission.ambulance) {
      await mission.ambulance.update({ status: 'disponible' });
    }

    await mission.destroy();
    res.json({ message: 'Mission supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;