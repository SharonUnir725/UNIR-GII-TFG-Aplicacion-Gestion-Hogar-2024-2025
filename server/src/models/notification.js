// server/src/models/notification.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'join_request',
      'join_approved',
      'join_rejected',
      'new_task',
      'modified_task',
      'new_event',
      'modified_event',
      'task_completed'
    ],
    required: true
  },
  payload: {
    type: Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'read'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
