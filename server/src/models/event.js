// server/src/models/event.js
// Modelo de evento para la aplicación que se muestrará en el calendario

const { Schema, model } = require('mongoose');

const EventSchema = new Schema({
  // Título del evento
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Fecha y hora de inicio del evento
  startDateTime: {
    type: Date,
    required: true
  },

  // Fecha y hora de fin del evento
  endDateTime: {
    type: Date,
    required: true
  },

  // Ubicación del evento: FK a Address
  locatedAt: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },

  // Array de identificadores de participantes (uno o varios miembros de la familia): FK a User
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],

  // Descripción del evento
  description: {
    type: String,
    default: '',
    trim: true,
  },

  // Identificador del usuario que creó el evento: FK a User
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Identificador de la familia a la que pertenece este evento: FK a Family
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },

}, {
  // Agrega automáticamente los campos createdAt y updatedAt
  timestamps: true
});

// Exportación del modelo para su uso en el resto de la aplicación
module.exports = model('Event', EventSchema);
