const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { users } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  const { skip = 0, limit = 100 } = req.query;
  const startIndex = parseInt(skip);
  const endIndex = startIndex + parseInt(limit);
  
  const userList = users
    .slice(startIndex, endIndex)
    .map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

  res.json(userList);
});

// Obtenir l'utilisateur actuel
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  });
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
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username ? 'Nom d\'utilisateur déjà utilisé' : 'Email déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const newUser = {
      id: (users.length + 1).toString(),
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role,
      isActive,
      createdAt: new Date(),
      lastLogin: null
    };

    users.push(newUser);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir un utilisateur par ID (admin seulement)
router.get('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const { password, ...userResponse } = user;
  res.json(userResponse);
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

    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const { password, ...updateData } = req.body;
    
    // Si un nouveau mot de passe est fourni, le hasher
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour l'utilisateur
    users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date() };

    const { password: _, ...userResponse } = users[userIndex];
    res.json(userResponse);
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'Utilisateur supprimé avec succès' });
});

module.exports = router;