// server/src/models/task.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  assignedTo: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_progreso', 'completada'],
    default: 'pendiente',
  },
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media',
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('Task', TaskSchema);
