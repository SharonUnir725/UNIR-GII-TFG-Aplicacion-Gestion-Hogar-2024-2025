//server/src/routes/userRoutes.js
const { Router } = require('express');
const User = require('../models/user'); 

const router = Router();

router.get('/', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.post('/', async (req, res) => {
  try {
    const u = new User(req.body);
    await u.save();
    res.status(201).json(u);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
