// src/routes/userRoutes.js
const { Router } = require('express');
const auth = require('../middleware/auth');
const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');

const router = Router();

// Listar todos los usuarios
// GET /api/users
router.get('/', auth, listUsers);

// Obtener un usuario por su ID
// GET /api/users/:id
router.get('/:id', auth, getUserById);

// Crear nuevo usuario
// POST /api/users
router.post('/', createUser);

// Actualizar un usuario existente
// PUT /api/users/:id
router.put('/:id', auth, updateUser);

// Eliminar un usuario
// DELETE /api/users/:id
router.delete('/:id', auth, deleteUser);

module.exports = router;
