// src/controllers/userController.js
const User = require('../models/user');
const isValidId = require('../helpers/isValidId');

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
    const user = new User(data);
    await user.save();
    res.status(201).json({ message: 'Usuario creado correctamente', user });
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