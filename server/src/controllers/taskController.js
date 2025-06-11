// server/src/controllers/taskController.js
const Task = require('../models/task');
const User = require('../models/user');
const Family = require('../models/family');

// GET /api/tasks
// Owner ve todas las tareas; el resto solo sus asignadas
exports.getAllTasks = async (req, res, next) => {
  try {
    // 1) Obtener familyId del usuario
    const userRecord = await User.findById(req.user.id, 'familyId');
    if (!userRecord?.familyId) {
      return res.status(400).json({ message: 'Usuario sin familia asignada' });
    }

    // 2) Recuperar familia para leer el owner
    const family = await Family.findById(userRecord.familyId, 'owner');
    if (!family) {
      return res.status(404).json({ message: 'Familia no encontrada' });
    }
    const isOwner = family.owner.toString() === req.user.id;

    // 3) Montar filtro. Base: tareas de la familia
    const filter = { familyId: userRecord.familyId };
    // 4) Si no es owner, limitar a las que le asignaron
    if (!isOwner) {
      filter.assignedTo = req.user.id;
    }

    // 5) Ejecutar consulta y poblar assignedTo con nombre
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName1')
      .exec();

    // 6) Devolver both tasks y flag isOwner
    return res.json({ tasks, isOwner });
  } catch (err) {
    next(err);
  }
};

// **Crear nueva tarea
// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    // Obtener familyId
    const user = await User.findById(req.user.id, 'familyId');
    if (!user || !user.familyId) {
      return res.status(400).json({ message: 'Usuario sin familia asignada' });
    }

    const { title, description, dueDate, assignedTo = [], status, priority } = req.body;
    const assignedUsers = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

    const task = new Task({
      familyId: user.familyId,
      title,
      description,
      dueDate,
      assignedTo: assignedUsers,
      status,
      priority,
    });
    const saved = await task.save();
    // Poblar responsables antes de devolver
    const populated = await saved.populate('assignedTo', 'firstName lastName1');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// **Actualizar tarea existente
// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    // Obtener familyId para validar pertenencia
    const user = await User.findById(req.user.id, 'familyId');
    if (!user || !user.familyId) {
      return res.status(400).json({ message: 'Usuario sin familia asignada' });
    }

    const { assignedTo, ...rest } = req.body;
    const updates = { ...rest, updatedAt: new Date() };
    if (assignedTo !== undefined) {
      updates.assignedTo = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, familyId: user.familyId },
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'firstName lastName1');

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// **Eliminar tarea
// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    // Obtener familyId para validar pertenencia
    const user = await User.findById(req.user.id, 'familyId');
    if (!user || !user.familyId) {
      return res.status(400).json({ message: 'Usuario sin familia asignada' });
    }

    const result = await Task.deleteOne({ _id: req.params.id, familyId: user.familyId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
