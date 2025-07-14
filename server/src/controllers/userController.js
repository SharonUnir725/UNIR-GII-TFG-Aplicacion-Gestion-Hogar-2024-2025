// src/controllers/userController.js
const User = require('../models/user');
const isValidId = require('../helpers/isValidId');
const mailer = require('../utils/mailer');
const bcrypt = require('bcrypt');
const { generateToken, tokenExpiresIn } = require('../utils/token');


//**Listar todos los usuarios
// GET /api/users
exports.listUsers = async (req, res) => {
  try {
    const { familyId } = req.query;

    // Si viene familyId, filtramos; si no, devolvemos todos
    const filter = familyId ? { familyId } : {};

    const users = await User
      .find(filter)
      .select('-passwordHash -__v')
      .lean();

    return res.json(users);
  } catch (err) {
    console.error('[userController.listUsers]', err);
    return res
      .status(500)
      .json({ error: 'Error interno al listar usuarios' });
  }
};

//**Obtener datos de un usuario por su ID
// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID de usuario no válido' });

    const user = await User.findById(id)
      .select('-passwordHash')
      .lean();
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

//**Crear un nuevo usuario
// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const data = req.body;

    // 1. Crear token de verificación
    const token = generateToken();
    data.verificationToken = token;
    data.verificationTokenExpires = tokenExpiresIn(24); // válido por 24h

    // 2. Crear y guardar el usuario
    const user = new User(data);
    await user.save();

    // 3. Enviar correo de verificación
    const verifyUrl = `http://localhost:3000/verify-email/${token}`;
    await mailer.sendMail({
      to: user.email,
      subject: 'Verificación de correo',
      text: `Haz clic en el siguiente enlace para verificar tu cuenta: ${verifyUrl}`
    });

    res.status(201).json({ message: 'Usuario creado correctamente. Verifica tu correo.', user });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

//**Actualizar un usuario existente
// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID de usuario no válido' });

    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })
      .select('-passwordHash');
    if (!updatedUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario actualizado correctamente', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

//**Eliminar un usuario
// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID de usuario no válido' });

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

//**Recuperar contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ message: 'Correo enviado (si el email existe).' });
  }

  const token = generateToken();
  user.resetPasswordToken = token;
  user.resetPasswordExpires = tokenExpiresIn(1); // 1 hora
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${token}`;
  await mailer.sendMail({
    to: user.email,
    subject: 'Recuperar contraseña',
    text: `Haz clic en el siguiente enlace para cambiar tu contraseña: ${resetUrl}`
  });

  res.json({ message: 'Correo enviado (si el email existe).' });
};

//**Reset contraseña
// POST /api/users/reset-password/:token
exports.resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  try {
    console.log('Token recibido:', token);
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    })
    if (!user) {
      console.log('Token inválido o expirado');
      return res.status(400).json({ message: 'Token inválido o expirado' })
    }

    // Hashear nueva contraseña y guardar
    const hashedPassword = await bcrypt.hash(password, 10);
    user.passwordHash = hashedPassword;

    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    console.error('Error en resetPassword:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
};

//** Verificar correo electrónico
// GET /api/users/verify-email/:token
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() } // token válido
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.json({ message: 'Correo verificado correctamente' });
  } catch (err) {
    console.error('Error en verifyEmail:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

