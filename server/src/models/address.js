// server/src/models/address.js

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

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
  // Bloque o torre del edificio (p. ej. “B”, “3”)
  block: {
    type: String,
    default: '',
    trim: true
  },
  // Escalera o portal dentro del bloque (p. ej. “1”, “A”)
  staircase: {
    type: String,
    default: '',
    trim: true
  },
  // Planta o piso (p. ej. “2”, “PB”)
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
  // Código postal (por ejemplo “46210”)
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
  // Coordenadas geográficas (GeoJSON Point: [ longitud, latitud ])
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
  // Referencia a la familia asociada (_id de la colección “Family”)
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  }
}, {
  timestamps: true
});

// Crear un índice 2dsphere para búsquedas geoespaciales
AddressSchema.index({ location: '2dsphere' });

module.exports = model('Address', AddressSchema);
