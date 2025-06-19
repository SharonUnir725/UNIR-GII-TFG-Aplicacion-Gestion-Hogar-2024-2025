// server/src/routes/eventRoutes.js
const express = require('express');
const authenticate = require('../middleware/auth');
const {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const router = express.Router();

//** Listar todos los eventos de la familia
// GET /api/events
router.get('/', authenticate, getAllEvents);

//** Crear un nuevo evento
// POST /api/events
router.post('/', authenticate, createEvent);

//** Obtener un evento por ID
// GET /api/events/:id
router.get('/:id', authenticate, getEventById);

//** Actualizar un evento existente
// PUT /api/events/:id
router.put('/:id', authenticate, updateEvent);

//** Eliminar un evento
// DELETE /api/events/:id
router.delete('/:id', authenticate, deleteEvent);

module.exports = router;
