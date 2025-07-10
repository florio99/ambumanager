const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { skip = 0, limit = 100 } = req.query;
    const offset = parseInt(skip);
    const limitNum = parseInt(limit);
    
    const users = await User.findAll({
      offset,
      limit: limitNum,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir l'utilisateur actuel
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur récupération utilisateur actuel:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Créer un nouvel utilisateur (admin seulement)
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('username').isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis'),
  body('role').isIn(['admin', 'regulateur', 'ambulancier']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, phone, role, isActive = true } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        $or: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username ? 'Nom d\'utilisateur déjà utilisé' : 'Email déjà utilisé'
      });
    }

    // Créer le nouvel utilisateur
    const newUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      isActive
    });

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir un utilisateur par ID (admin seulement)
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour un utilisateur (admin seulement)
router.put('/:id', [
  authenticateToken,
  requireRole(['admin']),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('role').optional().isIn(['admin', 'regulateur', 'ambulancier']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour l'utilisateur
    await user.update(req.body);

    // Retourner l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;