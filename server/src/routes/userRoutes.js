// src/routes/userRoutes.js
// Rutas relacionadas con la gestión de usuarios en la aplicación.
const { Router } = require('express');
const auth = require('../middleware/auth');
const { 
    listUsers, 
    getUserById, 
    deleteUser, 
    forgotPassword, 
    resetPassword
} = require('../controllers/userController');
const router = Router();

// Listar todos los usuarios
// GET /api/users
router.get('/', listUsers);

// Obtener un usuario por su ID
// GET /api/users/:id
router.get('/:id', getUserById);

// Eliminar un usuario
// DELETE /api/users/:id
router.delete('/:id', deleteUser);

// Recuperar la contraseña de un usuario
// POST /api/users/forgot-password
router.post('/forgot-password', forgotPassword);

// Resetear la contraseña
// POST /api/users/reset-password/:token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
