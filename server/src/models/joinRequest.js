// server/src/models/joinRequest.js
const { Schema, model, Types } = require('mongoose');

const JoinRequestSchema = new Schema({
  user:   { type: Types.ObjectId, ref: 'User',   required: true },
  family: { type: Types.ObjectId, ref: 'Family', required: true },
  status: { type: String, enum: ['pendiente','aprobado','denegado'], default: 'pendiente' }
}, { timestamps: true });

// Índice para acelerar búsquedas por familia y estado
JoinRequestSchema.index({ family: 1, status: 1 });

module.exports = model('JoinRequest', JoinRequestSchema);
