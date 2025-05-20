// server/src/routes/familyRoutes.js
const { Router } = require('express');
const Family     = require('../models/family');
const User       = require('../models/user');
const router     = Router();

// POST /api/families
// Crea una nueva familia; req.body.name + req.user.id (owner)
router.post('/', async (req, res) => {
  try {
    const { name }     = req.body;       // sólo se recibe el nombre
    const ownerId       = req.user.id;   // inyectado por el middleware
    // Crear la familia con el owner que esté «logueado»
    const family = await Family.create({
      name,
      owner:   ownerId,
    });
    // Asociar el familyId al usuario admin
    await User.findByIdAndUpdate(ownerId, { familyId: family._id });
    res.status(201).json(family);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/families/:id
// Devuelve una familia concreta, con owners y members poblados
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener datos de la familia
    const family = await Family
      .findById(id)
      .select('_id name owner createdAt updatedAt')
      .lean();

    if (!family) return res.status(404).json({ error: 'Family not found' });

    // Calcular número de miembros consultando users
    const memberCount = await User.countDocuments({ familyId: id });

    res.json({ ...family, memberCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
