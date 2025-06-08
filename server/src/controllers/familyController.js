// src/controllers/familyController.js
const Family    = require('../models/family');
const User      = require('../models/user');
const isValidId = require('../helpers/isValidId');

//**Crear nueva familia
// POST /api/families
exports.createFamily = async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId  = req.user.id;

    // Crear documento de familia
    const family = await Family.create({ name, owner: ownerId });

    // Asignar familyId al usuario que crea la familia
    await User.findByIdAndUpdate(ownerId, { familyId: family._id });

    res.status(201).json({ message: 'Familia creada correctamente', family });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

//**Buscar familias por nombre parcial o ID
// GET /api/families/search?q=<texto|id>
exports.searchFamilies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Falta el parámetro de búsqueda "q"' });

    const regex = new RegExp(q.trim(), 'i');
    const filters = [{ name: regex }];
    if (isValidId(q)) filters.push({ _id: q });

    const families = await Family.find({ $or: filters })
      .select('_id name owner createdAt updatedAt')
      .lean();

    res.json(families);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//**Obtener datos de una familia por su ID (incluye recuento de miembros y nombre del administrador)
// GET /api/families/:id
exports.getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'ID de familia no válido' });
    }

    // 1) Obtener la familia
    const family = await Family.findById(id)
      .select('_id name owner createdAt updatedAt')
      .lean();
    if (!family) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }

    // 2) Contar miembros con este familyId
    const memberCount = await User.countDocuments({ familyId: id });

    // 3) Obtener nombre del administrador (owner)
    const ownerUser = await User.findById(family.owner)
      .select('firstName lastName1 lastName2')
      .lean();
    const ownerName = ownerUser
      ? `${ownerUser.firstName} ${ownerUser.lastName1} ${ownerUser.lastName2}`
      : '';

    // 4) Responder con todos los datos
    return res.json({
      _id:         family._id,
      name:        family.name,
      owner:       family.owner,
      createdAt:   family.createdAt,
      updatedAt:   family.updatedAt,
      memberCount,
      ownerName
    });
  } catch (err) {
    console.error('[familyController.getFamilyById]', err);
    return res.status(500).json({ error: 'Error interno al obtener la familia' });
  }
};
