// src/routes/familyRoutes.js
const { Router } = require('express');
const auth     = require('../middleware/auth');
const { createFamily, searchFamilies, getFamilyById } = require('../controllers/familyController');
const { createJoinRequest } = require('../controllers/joinRequestController');

const router = Router();

// Crear nueva familia
// POST /api/families
router.post('/', auth, createFamily);

// Buscar familias por nombre o ID
// GET /api/families/search
router.get('/search', auth, searchFamilies);

// Obtener datos de una familia por su ID
// GET /api/families/:id
router.get('/:id', auth, getFamilyById);

// Crear solicitud de unión a familia
// POST /api/families/:id/join-request
router.post('/:id/join-request', auth, createJoinRequest);

module.exports = router;

