// server/src/controllers/eventController.js
const Event  = require('../models/event');
const User   = require('../models/user');
const { getWeatherForDateTime } = require('../utils/weatherService');

/**
 * GET /api/events
 * Listar todos los eventos de la familia
 * Admite filtros opcionales por usuario (userId) y rango de fechas (startDate, endDate)
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    // 1) Obtener familyId del usuario
    const user = await User.findById(req.user.id, 'familyId');
    if (!user?.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }

    // 2) Construir filtro base
    const filter = { familyId: user.familyId };

    // 3) Filtros opcionales
    const { userId, startDate, endDate } = req.query;

    if (userId) {
      // Buscar eventos donde el usuario es participante
      filter.participants = userId;
    }

    if (startDate || endDate) {
      filter.startDateTime = {};
      if (startDate) filter.startDateTime.$gte = new Date(startDate);
      if (endDate) filter.startDateTime.$lte = new Date(endDate);
    }

    // 4) Buscar y poblar
    let events = await Event.find(filter)
      .populate('locatedAt')
      .populate('participants', 'firstName lastName1')
      .exec();

    // 5) Eliminar posibles null en participants
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
 * Obtener un evento por ID
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
    const { title, startDateTime, endDateTime, locatedAt, participants = [], description } = req.body;
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
      description,
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
    const { title, startDateTime, endDateTime, locatedAt, participants = [], description } = req.body;
    const cleanParts = Array.isArray(participants)
      ? participants.filter(id => id)
      : [];

    // 3) Actualizar y poblar
    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, familyId },
      { title, startDateTime, endDateTime, locatedAt, participants: cleanParts, description },
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
 * Eliminar un evento existente de la familia
 */
  exports.deleteEvent = async (req, res, next) => {
    try {
      // 1) Obtener familyId del usuario autenticado
      const user = await User.findById(req.user.id, 'familyId');
      if (!user?.familyId) {
        return res.status(400).json({ msg: 'Usuario sin familia asignada' });
      }
      const familyId = user.familyId;

      // 2) Eliminar el evento asociado a esa familia
      const result = await Event.deleteOne({ _id: req.params.id, familyId });
      if (result.deletedCount === 0) {
        // Evento no encontrado o no pertenece a esta familia
        return res.status(404).json({ msg: 'Evento no encontrado' });
      }

      // 3) Respuesta sin contenido tras eliminar correctamente
      return res.status(204).end();
    } catch (err) {
      // Manejo de errores
      next(err);
    }
  };

/**
 * GET /api/events/:id/weather
 * Consultar y mostrar previsión meteorológica
 */
exports.getWeatherForEvent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, 'familyId');

    if (!user?.familyId) {
      return res.status(400).json({ msg: 'Usuario sin familia asignada' });
    }

    const ev = await Event.findOne({ _id: req.params.id, familyId: user.familyId })
      .populate('locatedAt')
      .exec();

    if (!ev || !ev.locatedAt || !ev.locatedAt.location) {
      return res.status(404).json({ msg: 'Evento no encontrado o sin ubicación' });
    }

    // Extraer coordenadas
    const lon = ev.locatedAt.location.coordinates[0];
    const lat = ev.locatedAt.location.coordinates[1];

    if (lat == null || lon == null) {
      return res.status(400).json({ msg: 'El evento no tiene coordenadas válidas' });
    }

    // Obtener fecha/hora del evento
    const dateTime = new Date(ev.startDateTime);
    
    const eventDateOnly = new Date(dateTime.getTime());
    eventDateOnly.setHours(0, 0, 0, 0);

    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);

    const diffTime = eventDateOnly - todayDateOnly;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Validaciones de rango de fechas
    if (diffDays < 0) {
      return res.json({
        unavailable: true
      });
    }
    if (diffDays > 3) {
      return res.json({
        unavailable: true
      });
    }

    // Llamada al servicio de clima
    const weather = await getWeatherForDateTime(lat, lon, dateTime);

    // Validar que realmente tengamos datos útiles
    if (
      !weather ||
      (
        weather.temperature == null &&
        weather.temp_min == null &&
        weather.temp_max == null &&
        (!weather.description || weather.description.trim() === '')
      )
    ) {
      return res.json({
        unavailable: true,
        msg: 'No hay datos de clima disponibles para este evento.'
      });
    }
    res.json(weather);

  } catch (err) {
    res.status(500).json({ msg: 'Error obteniendo clima' });
  }
};
