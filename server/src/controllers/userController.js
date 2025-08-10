// src/controllers/userController.js
// Controlador de usuarios: define la lógica de negocio relacionada con la gestión de usuarios.
const User = require('../models/user');
const isValidId = require('../helpers/isValidId');
const mailer = require('../utils/mailer');
const bcrypt = require('bcrypt');
const { generateToken, tokenExpiresIn } = require('../utils/token');


/**Listar todos los usuarios
  * GET /api/users
  * Devuelve todos los usuarios o filtra por familyId si se proporciona el query param.
  */
exports.listUsers = async (req, res) => {
  try {
    const { familyId } = req.query;

    // Solamente si se detecta familyId, se filtra
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

/**
 * Obtener un usuario por ID
 * GET /api/users/:id
 * - Valida formato de ObjectId.
 * - Excluye passwordHash de la respuesta.
 * - 400 si el ID no es válido; 404 si no existe.
 */
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

/**
 * Eliminar un usuario
 * DELETE /api/users/:id
 * - Valida ID; 404 si no existe.
 */
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

/**
 * Solicitar recuperación de contraseña
 * POST /api/users/forgot-password
 * Body: { email }
 * Genera token de un solo uso y caducidad (1h); envía email con enlace.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // No revelar existencia de la cuenta
    return res.status(200).json({ message: 'Correo enviado (si el email existe).' });
  }

  // Token de reset + expiración
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

/**
 * Resetear contraseña con token
 * POST /api/users/reset-password/:token
 * Body: { password }
 * - Comprueba token válido (no expirado).
 * - Hashea la nueva contraseña y limpia el token de un solo uso.
 * - 400 si token inválido/expirado; 200 si OK.
 */
exports.resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  try {
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
    // Limpiar credenciales de reset (un solo uso)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    console.error('Error en resetPassword:', err)
    res.status(500).json({ message: 'Error del servidor' })
  }
};
