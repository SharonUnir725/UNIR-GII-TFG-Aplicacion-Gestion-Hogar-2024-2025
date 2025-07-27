// server/src/models/joinRequest.js
// Modelo de solicitud de unión a una familia.
// Representa la petición de un usuario para unirse a una familia existente,

const { Schema, model, Types } = require('mongoose');

const JoinRequestSchema = new Schema(
  {
    // Identificador del usuario que solicita unirse: FK a User
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Identificador de la familia a la que desea unirse: FK a Family
    family: {
      type: Types.ObjectId,
      ref: 'Family',
      required: true
    },

    // Estado actual de la solicitud
    // - pendiente: solicitud recién creada, aún no revisada (por defecto)
    // - aprobado: solicitud aceptada
    // - denegado: solicitud rechazada
    status: {
      type: String,
      enum: ['pendiente', 'aprobado', 'denegado'],
      default: 'pendiente'
    }

  },{
    // Agrega automáticamente los campos createdAt y updatedAt
    timestamps: true
  });

// Índice para mejorar el rendimiento de búsquedas por familia y estado (createJoinRequest + listJoinRequestsByFamily)
JoinRequestSchema.index({ family: 1, status: 1 });

// Exportación del modelo para su uso en el resto de la aplicación
module.exports = model('JoinRequest', JoinRequestSchema);
