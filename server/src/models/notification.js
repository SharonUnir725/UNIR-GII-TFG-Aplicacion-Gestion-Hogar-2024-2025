// server/src/models/notification.js
// Modelo de notificaciones que permite almacenar avisos 
// para usuarios concretos sobre acciones que ocurren en una familia

const { Schema, model, Types } = require('mongoose');

const NotificationSchema = new Schema({

  // Identificador de la familia a la que pertenece la notificación: FK a Family
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },

  // Identificador del usuario que recibirá la notificación: FK a User
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Tipo de notificación (indica la acción que la generó)
  type: {
    type: String,
    enum: [
      'join_request',   // solicitud de unión a la familia
      'join_approved',  // solicitud aprobada
      'join_rejected',  // solicitud rechazada
      'new_task',       // nueva tarea creada
      'modified_task',  // tarea modificada
      'new_event',      // nuevo evento creado
      'modified_event', // evento modificado
      'task_completed'  // tarea completada
    ],
    required: true
  },

  // Información adicional relacionada con la notificación
  payload: {
    type: Schema.Types.Mixed,
    required: true
  },

  // Estado de la notificación: pendiente o leída
  status: {
    type: String,
    enum: ['pending', 'read'],
    default: 'pending'
  }

}, { 
  // Agrega automáticamente los campos createdAt y updatedAt
  timestamps: true 
});

// Exportación del modelo para su uso en el resto de la aplicación
module.exports = model('Notification', NotificationSchema);
