// server/src/models/user.js
// Modelo de usuario para la aplicación que contiene información personal.
const { Schema, model, Types } = require('mongoose');

const UserSchema = new Schema({

  // Nombre del usuario
  firstName: {
    type: String,
    required: true,
    trim: true
  },

  // Primer apellido
  lastName1: {
    type: String,
    required: true,
    trim: true
  },

  // Segundo apellido
  lastName2: {
    type: String,
    trim: true
  },

  // Correo electrónico utilizado como identificador único
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Hash de la contraseña para autenticación
  passwordHash: {
    type: String,
    required: true
  },

  // Rol del usuario dentro del núcleo familiar
  role: {
    type: String,
    required: true,
    enum: ['madre', 'padre', 'hijo', 'hija', 'otro'],
    default: 'otro'
  },

  // Identificador de la familia a la que pertenece el usuario: FK a Family
  familyId: {
    type: Types.ObjectId,
    ref: 'Family'
  },

  // Ruta o URL de la imagen de perfil
  profileImage: {
    type: String
  },

  // Número de teléfono
  phone: {
    type: String,
    trim: true
  },

  // Fecha de nacimiento
  birthDate: {
    type: Date
  },

  // Género del usuario
  gender: {
    type: String,
    enum: ['masculino', 'femenino', 'otro']
  },

  // Token y expiración para recuperación de contraseña
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Verificación de correo electrónico
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date

}, {
  // Agrega automáticamente los campos createdAt y updatedAt
  timestamps: true
});

// Exportación del modelo para su uso en el resto de la aplicación
module.exports = model('User', UserSchema);
