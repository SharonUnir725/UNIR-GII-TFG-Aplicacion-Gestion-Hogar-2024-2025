// src/routes/notificationRoutes.js
const { Router } = require('express');
const authenticate = require('../middleware/auth');
const {
  listNotifications,
  getNotification,
  markAsRead
} = require('../controllers/notificationController');

const router = Router();

// Listar notificaciones pendientes
// GET /api/notifications
router.get('/', authenticate, listNotifications);

// Obtener una notificación concreta
// GET /api/notifications/:nid
router.get('/:nid', authenticate, getNotification);

// Marcar notificación como leída
// PUT /api/notifications/:nid/read
router.put('/:nid/read', authenticate, markAsRead);

module.exports = router;
