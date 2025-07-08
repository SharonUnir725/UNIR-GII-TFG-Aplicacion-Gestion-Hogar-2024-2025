// src/controllers/notificationController.js
const Notification = require('../models/notification');
const User         = require('../models/user');
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

//**Crear una o varias notificaciones
// POST /api/notifications
exports.createNotification = async (req, res, next) => {
  try {
    // 1) Recuperar familyId del usuario autenticado
    const userRecord = await User.findById(req.user.id, 'familyId');
    if (!userRecord?.familyId) {
      return res.status(400).json({ message: 'Usuario sin familia asignada' });
    }
    const familyId = userRecord.familyId;

    // 2) Extraer datos de la petición
    const { type, taskId, eventId, recipients = [], payload = {} } = req.body;
    const resourceId = taskId || eventId;   
    const recs = Array.isArray(recipients) ? recipients : [recipients];

    // 3) Construir un documento por destinatario
    const docs = recs.map(userId => ({
      family:     familyId,
      recipient:  userId,
      type,
      payload,
      resourceId,
      status:     'pending'
    }));

    // 4) Insertar en bloque y devolver
    const created = await Notification.insertMany(docs);
    return res.status(201).json(created);

  } catch (err) {
    next(err);
  }
};