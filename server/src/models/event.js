// server/src/models/event.js

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

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

  // Ubicación del evento: FK a la dirección del evento Address
  locatedAt: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },

  // Array de participantes (uno o varios miembros de la familia)
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

  // Usuario que creó el evento
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Referencia a la familia a la que pertenece este evento
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },

}, {
  timestamps: true
});


module.exports = model('Event', EventSchema);
