// server/src/models/address.js
// Modelo de dirección utilizado para almacenar ubicaciones asociadas a usuarios 

const { Schema, model } = require('mongoose');

const AddressSchema = new Schema({
  // Nombre de la vía o calle
  street: {
    type: String,
    required: true,
    trim: true
  },
  // Número de portal o vivienda
  number: {
    type: String,
    required: true,
    trim: true
  },
  // Bloque o torre del edificio
  block: {
    type: String,
    default: '',
    trim: true
  },
  // Escalera o portal dentro del bloque
  staircase: {
    type: String,
    default: '',
    trim: true
  },
  // Planta o piso
  floor: {
    type: String,
    default: '',
    trim: true
  },
  // Número o letra de la puerta/vivienda
  door: {
    type: String,
    default: '',
    trim: true
  },
  // Código postal
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  // Localidad
  city: {
    type: String,
    required: true,
    trim: true
  },
  // Provincia
  province: {
    type: String,
    required: true,
    trim: true
  },
  // País
  country: {
    type: String,
    required: true,
    trim: true
  },
  // Campo de ubicación geográfica en formato GeoJSON.
  // Se almacena como un punto con coordenadas [longitud, latitud].
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      required: true
    }
  },
  // Identificador de la familia asociada: FK a familia a la que pertenece la dirección
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  }
  
}, {
  // Agrega automáticamente los campos createdAt y updatedAt
  timestamps: true
});

// Crear un índice 2dsphere para búsquedas geoespaciales
AddressSchema.index({ location: '2dsphere' });

// Exportación del modelo para su uso en el resto de la aplicación
module.exports = model('Address', AddressSchema);
