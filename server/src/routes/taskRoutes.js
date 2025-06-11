// server/src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// **Obtener todas las tareas de la familia
// GET /api/tasks
router.get('/', taskController.getAllTasks);

// **Crear nueva tarea
// POST /api/tasks
router.post('/', taskController.createTask);

// **Actualizar tarea existente
// PUT /api/tasks/:id
router.put('/:id', taskController.updateTask);

// **Eliminar tarea
// DELETE /api/tasks/:id
router.delete('/:id', taskController.deleteTask);

module.exports = router;