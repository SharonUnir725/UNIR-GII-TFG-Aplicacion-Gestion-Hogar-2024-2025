// server/src/routes/authRoutes.js
const { Router }    = require('express');
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const User          = require('../models/user');

const router = Router();

// Ruta para registrarse
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName1, lastName2, email, password, role } = req.body;

    // 1) Validar que el email no existe
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 2) Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Crear usuario
    const newUser = await User.create({
      firstName, lastName1, lastName2,
      email, passwordHash,
      role
    });

    // 4) Responder sin token (o podrías emitirlo aquí)
    res.status(201).json({ message: 'User registered', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login del usuario
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2) Comparar password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3) Generar JWT
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // 4) Devolver token y datos básicos
    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName1: user.lastName1,
        lastName2: user.lastName2,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
