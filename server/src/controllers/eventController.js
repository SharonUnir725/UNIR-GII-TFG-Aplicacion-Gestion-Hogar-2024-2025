// server/src/controllers/eventController.js
const Event = require('../models/event');
const User  = require('../models/user');

/**
 * 1) Listar eventos de la familia
 * GET /api/events
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    // Recuperar familyId real del usuario
    const userRecord = await User.findById(req.user.id, 'familyId');
    if (!userRecord || !userRecord.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId = userRecord.familyId;

    // Buscar eventos de la familia y poblar campos
    const events = await Event.find({ familyId })
      .populate('locatedAt')
      .populate('participants', 'firstName lastName1')
      .exec();

    res.json(events);
  } catch (err) {
    next(err);
  }
};

/**
 * 2) Crear un nuevo evento
 * POST /api/events
 */
exports.createEvent = async (req, res, next) => {
  try {
    const { title, startDateTime, endDateTime, locatedAt, participants } = req.body;
    const userRecord = await User.findById(req.user.id, 'familyId');
    if (!userRecord || !userRecord.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId  = userRecord.familyId;
    const createdBy = req.user.id;

    const event = new Event({
      title,
      startDateTime,
      endDateTime,
      locatedAt,
      participants,
      createdBy,
      familyId
    });
    const saved = await event.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

/**
 * 3) Obtener un evento por ID
 * GET /api/events/:id
 */
exports.getEventById = async (req, res, next) => {
  try {
    const userRecord = await User.findById(req.user.id, 'familyId');
    if (!userRecord || !userRecord.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId = userRecord.familyId;

    const ev = await Event.findOne({ _id: req.params.id, familyId })
      .populate('locatedAt')
      .populate('participants', 'firstName lastName1')
      .exec();
    if (!ev) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json(ev);
  } catch (err) {
    next(err);
  }
};

/**
 * 4) Actualizar evento
 * PUT /api/events/:id
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const userRecord = await User.findById(req.user.id, 'familyId');
    if (!userRecord || !userRecord.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId = userRecord.familyId;

    const update = {
      title:         req.body.title,
      startDateTime: req.body.startDateTime,
      endDateTime:   req.body.endDateTime,
      locatedAt:     req.body.locatedAt,
      participants:  req.body.participants
    };
    const ev = await Event.findOneAndUpdate(
      { _id: req.params.id, familyId },
      update,
      { new: true }
    ).exec();
    if (!ev) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json(ev);
  } catch (err) {
    next(err);
  }
};

/**
 * 5) Eliminar evento
 * DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const userRecord = await User.findById(req.user.id, 'familyId');
    if (!userRecord || !userRecord.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId = userRecord.familyId;

    const ev = await Event.findOneAndDelete({ _id: req.params.id, familyId }).exec();
    if (!ev) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    next(err);
  }
};
