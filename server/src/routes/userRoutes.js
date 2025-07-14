// src/routes/userRoutes.js
const { Router } = require('express');
const auth = require('../middleware/auth');
const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const router = Router();
const userController = require('../controllers/userController');

// Listar todos los usuarios
// GET /api/users
router.get('/', listUsers);

// Obtener un usuario por su ID
// GET /api/users/:id
router.get('/:id', getUserById);

// Crear nuevo usuario
// POST /api/users
router.post('/', createUser);

// Actualizar un usuario existente
// PUT /api/users/:id
router.put('/:id', auth, updateUser);

// Eliminar un usuario
// DELETE /api/users/:id
router.delete('/:id', deleteUser);

// Recuperar la contraseña de un usuario
router.post('/forgot-password', userController.forgotPassword);

// Resetear la contraseña
router.post('/reset-password/:token', userController.resetPassword);

// Verificar correo electrónico
router.get('/verify-email/:token', userController.verifyEmail);

module.exports = router;
