// src/models/notification.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema de notificaciones para distintos eventos: solicitudes de unión, aprobaciones y rechazos.
const NotificationSchema = new Schema({
  family:    { type: Schema.Types.ObjectId, ref: 'Family', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User',   required: true },
  type:      { type: String, enum: ['modified_task','new_task','join_request','join_approved','join_rejected'], required: true },
  payload:   { type: Schema.Types.Mixed, required: true },
  status:    { type: String, enum: ['pending','read'], default: 'pending' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);

