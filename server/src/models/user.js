// server/src/models/user.js
const { Schema, model, Types } = require('mongoose');

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName1: {
    type: String,
    required: true,
    trim: true
  },
  lastName2: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,      // "username" para login
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: [
      'madre',
      'padre',
      'hijo',
      'hija',
      'otro'
    ],
    default: 'otro'
  },
  familyId: {
    type: Types.ObjectId,
    ref: 'Family'
  },

  // Campos para recuperación de contraseña
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Campos para verificación correo electrónico
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

}, {
  timestamps: true
});

module.exports = model('User', UserSchema);