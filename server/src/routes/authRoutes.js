// src/routes/authRoutes.js
const { Router } = require('express');
const auth       = require('../middleware/auth');
const {
  register,
  login,
  getMe
} = require('../controllers/authController');

const router = Router();

// Registro de usuario
// POST /api/auth/register
router.post('/register', register);

// Inicio de sesión
// POST /api/auth/login
router.post('/login', login);

// Obtener datos del usuario autenticado
// GET /api/auth/me
router.get('/me', auth, getMe);

module.exports = router;
