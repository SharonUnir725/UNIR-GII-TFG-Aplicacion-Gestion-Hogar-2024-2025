// src/controllers/joinRequestController.js
const JoinRequest  = require('../models/joinRequest');
const Notification = require('../models/notification');
const isValidId    = require('../helpers/isValidId');
const Family       = require('../models/family');
const User         = require('../models/user');

/**
 * Crear solicitud de unión a familia
 * POST /api/families/:id/join-request
 */
exports.createJoinRequest = async (req, res) => {
  try {
    const userId   = req.user.id;
    const familyId = req.params.id;

    // 1) Validar formato de ID
    if (!isValidId(familyId)) {
      return res.status(400).json({ error: 'ID de familia no válido' });
    }

    // 2) Verificar que la familia existe
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }

    // 3) Verificar que el usuario no esté ya en la familia
    const user = await User.findById(userId);
    if (user.familyId?.toString() === familyId) {
      return res.status(400).json({ error: 'El usuario ya pertenece a esta familia' });
    }

    // 4) Verificar si ya existe una solicitud pendiente
    const existing = await JoinRequest.findOne({
      user:   userId,
      family: familyId,
      status: 'pendiente'
    });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una solicitud pendiente' });
    }

    // 5) Crear la solicitud
    const joinReq = await JoinRequest.create({ user: userId, family: familyId });

    // 6) Obtener nombre completo del solicitante
    const { firstName, lastName1, lastName2 } = user;
    const userName = `${firstName} ${lastName1}${ lastName2 ? ' ' + lastName2 : '' }`;

    // 7) Crear notificación para el propietario de la familia
    await Notification.create({
      family:    familyId,
      recipient: family.owner,
      type:      'join_request',
      payload:   { requestId: joinReq._id, userName },
      status:    'pending'
    });

    return res.status(201).json({
      message:   'Solicitud de unión enviada correctamente',
      requestId: joinReq._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Aprobar solicitud de unión
 * PUT /api/families/:id/join-requests/:rid/approve
 */
exports.approveRequest = async (req, res) => {
  try {
    const familyId = req.params.id;
    const requestId = req.params.rid;
    const userId   = req.user.id;

    // 1) Validar IDs
    if (!isValidId(familyId) || !isValidId(requestId)) {
      return res.status(400).json({ error: 'ID no válido' });
    }

    // 2) Verificar que la familia existe y que el usuario es el owner
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }
    if (family.owner.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para aprobar esta solicitud' });
    }

    // 3) Verificar la solicitud y su estado
    const jr = await JoinRequest.findById(requestId);
    if (!jr || jr.family.toString() !== familyId || jr.status !== 'pendiente') {
      return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' });
    }

    // 4) Marcar la solicitud como aprobada
    jr.status = 'aprobado';
    await jr.save();

    // 5) Añadir al usuario a la familia
    await User.findByIdAndUpdate(jr.user, { familyId });

    // 6) Crear notificación de aprobación para el solicitante
    await Notification.create({
      family:    familyId,
      recipient: jr.user,
      type:      'join_approved',
      payload:   { family: familyId },
      status:    'pending'
    });

    return res.json({ message: 'Solicitud aprobada correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Rechazar solicitud de unión
 * PUT /api/families/:id/join-requests/:rid/reject
 */
exports.rejectRequest = async (req, res) => {
  try {
    const familyId  = req.params.id;
    const requestId = req.params.rid;
    const userId    = req.user.id;

    // 1) Validar IDs
    if (!isValidId(familyId) || !isValidId(requestId)) {
      return res.status(400).json({ error: 'ID no válido' });
    }

    // 2) Verificar que la familia existe y que el usuario es el owner
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }
    if (family.owner.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para rechazar esta solicitud' });
    }

    // 3) Verificar la solicitud y su estado
    const jr = await JoinRequest.findById(requestId);
    if (!jr || jr.family.toString() !== familyId || jr.status !== 'pendiente') {
      return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' });
    }

    // 4) Marcar la solicitud como denegada
    jr.status = 'denegado';
    await jr.save();

    // 5) Crear notificación de rechazo para el solicitante
    await Notification.create({
      family:    familyId,
      recipient: jr.user,
      type:      'join_rejected',
      payload:   { family: familyId },
      status:    'pending'
    });

    return res.json({ message: 'Solicitud rechazada correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
