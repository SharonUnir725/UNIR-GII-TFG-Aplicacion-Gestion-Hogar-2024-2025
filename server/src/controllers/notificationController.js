// src/controllers/notificationController.js
const Notification = require('../models/notification');
const isValidId    = require('../helpers/isValidId');

//**Listar todas las notificaciones del usuario autenticado
// GET /api/notifications
exports.listNotifications = async (req, res) => {
  try {
    const notifs = await Notification
      .find({ recipient: req.user.id})
      .sort('-createdAt')
      .lean();
    return res.json(notifs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//**Obtener una notificación por su ID
// GET /api/notifications/:nid
exports.getNotification = async (req, res) => {
  try {
    const nid = req.params.nid;
    if (!isValidId(nid)) {
      return res.status(400).json({ error: 'ID no válido' });
    }

    const notif = await Notification.findById(nid).lean();
    if (!notif || notif.recipient.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    return res.json(notif);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//**Marcar notificación como leída
// PUT /api/notifications/:nid/read
exports.markAsRead = async (req, res) => {
  try {
    const nid = req.params.nid;
    if (!isValidId(nid)) {
      return res.status(400).json({ error: 'ID no válido' });
    }

    await Notification.findByIdAndUpdate(nid, { status: 'read' });
    return res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};