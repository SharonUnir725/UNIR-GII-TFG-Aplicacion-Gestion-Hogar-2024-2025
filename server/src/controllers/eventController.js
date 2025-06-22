// server/src/controllers/eventController.js
const Event  = require('../models/event');
const User   = require('../models/user');

/**
 * GET /api/events
 * Listar todos los eventos de la familia, sin nulls en participantes
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    // 1) Obtener familyId del usuario
    const user = await User.findById(req.user.id, 'familyId');
    if (!user?.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }

    // 2) Buscar y poblar
    let events = await Event.find({ familyId: user.familyId })
      .populate('locatedAt')
      .populate('participants', 'firstName lastName1')
      .exec();

    // 3) Eliminar posibles null en participants
    events = events.map(ev => {
      ev.participants = (ev.participants || []).filter(u => !!u);
      return ev;
    });

    return res.json(events);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/events/:id
 * Obtener un evento por ID, sin nulls en participantes
 */
exports.getEventById = async (req, res, next) => {
  try {
    // 1) Obtener familyId del usuario
    const user = await User.findById(req.user.id, 'familyId');
    if (!user?.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }

    // 2) Buscar evento y poblar
    const ev = await Event.findOne({ _id: req.params.id, familyId: user.familyId })
      .populate('locatedAt')
      .populate('participants', 'firstName lastName1')
      .exec();

    if (!ev) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // 3) Filtrar nulls
    ev.participants = (ev.participants || []).filter(u => !!u);

    return res.json(ev);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/events
 * Crear un nuevo evento y poblar participantes
 */
exports.createEvent = async (req, res, next) => {
  try {
    // 1) familyId
    const user = await User.findById(req.user.id, 'familyId');
    if (!user?.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId  = user.familyId;
    const createdBy = req.user.id;

    // 2) Limpiar y asignar participantes
    const { title, startDateTime, endDateTime, locatedAt, participants = [] } = req.body;
    const cleanParts = Array.isArray(participants)
      ? participants.filter(id => id)
      : [];

    // 3) Guardar
    const ev = new Event({
      title,
      startDateTime,
      endDateTime,
      locatedAt,
      participants: cleanParts,
      createdBy,
      familyId
    });
    const saved = await ev.save();

    // 4) Poblar antes de responder
    await saved.populate('locatedAt');
    await saved.populate('participants', 'firstName lastName1');
    saved.participants = saved.participants.filter(u => !!u);

    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/events/:id
 * Actualizar un evento y poblar participantes
 */
exports.updateEvent = async (req, res, next) => {
  try {
    // 1) familyId
    const user = await User.findById(req.user.id, 'familyId');
    if (!user?.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId = user.familyId;

    // 2) Limpiar participantes
    const { title, startDateTime, endDateTime, locatedAt, participants = [] } = req.body;
    const cleanParts = Array.isArray(participants)
      ? participants.filter(id => id)
      : [];

    // 3) Actualizar y poblar
    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, familyId },
      { title, startDateTime, endDateTime, locatedAt, participants: cleanParts },
      { new: true, runValidators: true }
    )
      .populate('locatedAt')
      .populate('participants', 'firstName lastName1')
      .exec();

    if (!updated) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    updated.participants = updated.participants.filter(u => !!u);

    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/events/:id
 * Eliminar un evento
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, 'familyId');
    if (!user?.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }
    const familyId = user.familyId;

    const result = await Event.deleteOne({ _id: req.params.id, familyId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};
