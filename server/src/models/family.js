// server/src/models/family.js
// Modelo de familia utilizado para agrupar a los usuarios en un núcleo familiar.

const { Schema, model, Types } = require('mongoose');

const FamilySchema = new Schema({

  // Nombre de la familia 
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Identificador del propietario o administrador de la familia: FK a User
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  }
  
}, {
  // Agrega automáticamente los campos createdAt y updatedAt
  timestamps: true,
});

// Exportación del modelo para su uso en el resto de la aplicación
module.exports = model('Family', FamilySchema);
