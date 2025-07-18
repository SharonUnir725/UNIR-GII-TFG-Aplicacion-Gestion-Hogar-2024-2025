// src/routes/authRoutes.js
const { Router } = require('express');
const auth       = require('../middleware/auth');
const authController = require('../controllers/authController');
const { register, login, getMe, updateMe, changePassword } = authController;

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

// Actualizar datos del usuario autenticado
// PUT /api/auth/me
router.put('/me', auth, updateMe);

// Cambiar contraseña del usuario autenticado
// POST /api/auth/change-password
router.post('/change-password', auth, changePassword);

// Verificar correo
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router;
