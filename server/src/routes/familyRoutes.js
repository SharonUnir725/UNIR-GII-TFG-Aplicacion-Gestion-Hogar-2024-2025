// server/src/routes/familyRoutes.js
const { Router } = require('express');
const mongoose   = require('mongoose');
const auth       = require('../middleware/auth');
const Family     = require('../models/family');
const User       = require('../models/user');
const router     = Router();

// Helper para validar ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// 1) Crear familia
// POST /api/families
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId  = req.user.id;
    const family   = await Family.create({ name, owner: ownerId });
    await User.findByIdAndUpdate(ownerId, { familyId: family._id });
    res.status(201).json(family);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2) Buscar familias (por nombre parcial o ID exacto)
// GET /api/families/search?q=…
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing q parameter' });

    const regex   = new RegExp(q.trim(), 'i');
    const filters = [{ name: regex }];
    if (isValidId(q)) {
      filters.push({ _id: q });
    }

    const list = await Family.find({ $or: filters })
      .select('_id name owner createdAt updatedAt')
      .lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) Obtener familia por ID
// GET /api/families/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid family ID' });

    const family = await Family.findById(id)
      .select('_id name owner createdAt updatedAt')
      .lean();
    if (!family) return res.status(404).json({ error: 'Family not found' });

    // Contar miembros a partir de users.familyId
    const memberCount = await User.countDocuments({ familyId: id });
    res.json({ ...family, memberCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
