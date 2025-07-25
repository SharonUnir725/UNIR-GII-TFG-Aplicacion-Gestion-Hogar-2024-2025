// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mailer = require('../utils/mailer');
const { generateToken, tokenExpiresIn } = require('../utils/token');

//**Registrar un usuario nuevo
// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName1, lastName2, email, password, role, phone, birthDate, gender } = req.body;

    // 1) Comprobar que no exista un usuario con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
    }

    // 2) Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Generar token de verificación de correo
    const emailVerificationToken = generateToken();
    const emailVerificationExpires = tokenExpiresIn(24); // 24 horas

    // 4) Crear usuario
    const newUser = await User.create({
      firstName,
      lastName1,
      lastName2,
      email,
      passwordHash,
      role,
      phone,
      birthDate,
      gender,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: false
    });

    // 5) Enviar correo con enlace de verificación
    const verifyUrl = `http://localhost:3000/verify-email/${emailVerificationToken}`;
    await mailer.sendMail({
      to: email,
      subject: 'Verifica tu cuenta',
      text: `Haz clic en el siguiente enlace para verificar tu cuenta: ${verifyUrl}`
    });

    // 6) Respuesta
    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuarioId: newUser._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//**Verificar correo electrónico
// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email ya estaba verificado' });
    }

    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ message: 'Token expirado' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verificado correctamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

//**Autenticar un usuario registrado
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña no válidos' });
    }

    // 2) Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Correo o contraseña no válidos' });
    }

    // 3) Verificar si el correo fue confirmado
    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Debes verificar tu correo electrónico antes de iniciar sesión.' });
    }

    // 4) Generar token JWT
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // 5) Responder con token
    res.json({
      mensaje: 'Inicio de sesión correcto',
      token,
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
    const user = await User.findById(req.user.id)
      .select(
        'firstName lastName1 lastName2 email role familyId phone birthDate gender profileImage createdAt'
      )
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//**Modificar los datps del usuario autenticado
// PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firstName,
      lastName1,
      lastName2,
      phone,
      birthDate,
      gender,
      profileImage
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName1, lastName2, phone, birthDate, gender, profileImage },
      { new: true }
    ).select('firstName lastName1 lastName2 email role phone birthDate gender profileImage');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Perfil actualizado correctamente',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

//**Cambiar la contraseña del usuario autenticado
// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Buscar el usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comprobar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashed;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};


