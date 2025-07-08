// src/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');  // middleware de autenticación

const {
  listNotifications,
  getNotification,
  markAsRead,
  createNotification
} = require('../controllers/notificationController');

/** Listar todas las notificaciones del usuario autenticado
 *  GET /api/notifications
 */
router.get('/', authenticate, listNotifications);

/** Obtener una notificación por ID
 *  GET /api/notifications/:nid
 */
router.get('/:nid', authenticate, getNotification);

/** Marcar notificación como leída
 *  PUT /api/notifications/:nid/read
 */
router.put('/:nid/read', authenticate, markAsRead);

/** Crear notificación(s)
 *  POST /api/notifications
 */
router.post('/', authenticate, createNotification);

module.exports = router;
