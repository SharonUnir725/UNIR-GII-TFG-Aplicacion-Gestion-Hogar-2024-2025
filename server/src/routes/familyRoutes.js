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
    // creas la familia con el owner que esté «logueado»
    const family = await Family.create({
      name,
      owner:   ownerId,
      members: [ ownerId ]
    });
    // 2) Asociar el familyId al usuario admin
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
    const family = await Family
      .findById(req.params.id)
      .populate('owner', 'firstName lastName1')
      .populate('members', 'firstName lastName1');
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json(family);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
