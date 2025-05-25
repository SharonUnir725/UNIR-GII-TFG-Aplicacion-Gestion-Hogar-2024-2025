// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const User   = require('../models/user');

//**Registrar un usuario nuevo
// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName1, lastName2, email, password, role } = req.body;

    // 1) Comprobar que no exista un usuario con ese email
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
    }

    // 2) Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Crear el nuevo usuario
    const nuevoUsuario = await User.create({
      firstName,
      lastName1,
      lastName2,
      email,
      passwordHash,
      role
    });

    // 4) Devolver respuesta de éxito
    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuarioId: nuevoUsuario._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//**Autenticar de un usuario registrado
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Buscar usuario por email
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña no válidos' });
    }

    // 2) Verificar la contraseña
    const esValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValida) {
      return res.status(401).json({ error: 'Correo o contraseña no válidos' });
    }

    // 3) Generar token JWT
    const payload = { id: usuario._id, email: usuario.email };
    const token   = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // 4) Devolver token y datos básicos del usuario
    res.json({
      mensaje: 'Inicio de sesión correcto',
      token,
      usuario: {
        usuarioId:  usuario._id,
        firstName:  usuario.firstName,
        lastName1:  usuario.lastName1,
        lastName2:  usuario.lastName2,
        email:      usuario.email,
        role:       usuario.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//**Obtener datos del usuario autenticado
// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id)
      .select('firstName lastName1 lastName2 email')
      .lean();
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
