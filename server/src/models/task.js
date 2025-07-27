// server/src/models/task.js
// Modelo de tareas que almacena tareas asociadas a una familia

const { Schema, model, Types } = require('mongoose');

const TaskSchema = new Schema({

  // Identificador de la familia a la que pertenece la tarea: FK Family
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },

  // Lista de identifiacdores de usuarios asignados a la tarea: FK a User
  assignedTo: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },

  // Título o nombre corto de la tarea
  title: {
    type: String,
    required: true,
    trim: true,
  },

  // Descripción más detallada de la tarea
  description: {
    type: String,
    default: '',
    trim: true,
  },

  // Fecha límite de la tarea
  dueDate: {
    type: Date,
    default: null,
  },

  // Estado actual de la tarea: pendiente (por defecto), en_progreso, completada
  status: {
    type: String,
    enum: ['pendiente', 'en_progreso', 'completada'],
    default: 'pendiente',
  },

  // Nivel de prioridad de la tarea: baja, media (por defecto), alta
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media',
  },


}, {
  // Agrega automáticamente los campos createdAt y updatedAt
  timestamps: true, 
});

// Exportación del modelo para su uso en el resto de la aplicación
module.exports = model('Task', TaskSchema);
