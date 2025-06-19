// server/src/controllers/addressController.js
const Address = require('../models/address');
const Family  = require('../models/family');
const User    = require('../models/user');
const axios   = require('axios');

// ————————————————————————————————————————————————
// Helper privado: geocodifica una dirección con Nominatim
async function geocodeAddress({ street, number, postalCode, city, province, country }) {
  // Montar la query legible 
  let addressStr = `${number} ${street}, ${postalCode} ${city}, ${province}, ${country}`;
  // Normalizar tildes
  addressStr = addressStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressStr)}`;
  const resp = await axios.get(url, {
    headers: { 
      // Ajusta tu User-Agent acorde a tus datos
      'User-Agent': 'TFG-Familia/1.0 (tu_email@dominio)' 
    }
  });

  const data = resp.data;
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No se pudo geolocalizar la dirección');
  }

  const { lon, lat } = data[0];
  return {
    type: 'Point',
    coordinates: [ parseFloat(lon), parseFloat(lat) ]
  };
}
// ————————————————————————————————————————————————


/**
 * GET /api/address
 * Devuelve la dirección “home” de la familia (o null si no existe).
 */
exports.getAddressByFamily = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, 'familyId').lean();
    if (!user?.familyId) {
      return res.status(404).json({ msg: 'No perteneces a ninguna familia' });
    }
    const address = await Address.findOne({ familyId: user.familyId }).lean();
    return res.json(address || null);
  } catch (err) {
    console.error('[getAddressByFamily]', err);
    return res.status(500).json({ msg: 'Error al obtener la dirección' });
  }
};


/**
 * POST /api/address
 * Upsert de la dirección de la familia.
 * Geocodifica la ubicación con Nominatim.
 */
exports.upsertAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, 'familyId').lean();
    if (!user?.familyId) {
      return res.status(404).json({ msg: 'No perteneces a ninguna familia' });
    }

    const family = await Family.findById(user.familyId);
    if (!family) {
      return res.status(404).json({ msg: 'Familia no encontrada' });
    }
    if (family.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Solo el administrador puede editar la dirección' });
    }

    const {
      street, number, postalCode, city,
      province, country, block = '', staircase = '',
      floor = '', door = ''
    } = req.body;

    if (!street || !number || !postalCode || !city || !province || !country) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios en la dirección' });
    }

    // Geocodificar
    const location = await geocodeAddress({
      street, number, postalCode, city, province, country
    });

    const data = {
      familyId:   user.familyId,
      street, number, block, staircase,
      floor, door, postalCode, city, province, country,
      location
    };

    // Upsert manual
    let address = await Address.findOne({ familyId: user.familyId });
    if (address) {
      Object.assign(address, data);
      await address.save();
      return res.json(address);
    } else {
      const newAddr = new Address(data);
      const saved   = await newAddr.save();
      return res.status(201).json(saved);
    }

  } catch (err) {
    console.error('[upsertAddress]', err);
    return res.status(500).json({ msg: err.message || 'Error al guardar la dirección' });
  }
};


/**
 * GET /api/address/event
 * Lista todas las direcciones de la familia (para usarlas en eventos).
 */
exports.listEventAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, 'familyId').lean();
    if (!user?.familyId) {
      return res.status(404).json({ msg: 'Usuario sin familia asignada' });
    }
    const addrs = await Address.find({ familyId: user.familyId }).lean();
    return res.json(addrs);
  } catch (err) {
    console.error('[listEventAddresses]', err);
    return res.status(500).json({ msg: 'Error al listar direcciones' });
  }
};


/**
 * POST /api/address/event
 * Crea una nueva dirección de evento si no existe (busca por texto).
 * Geocodifica usando Nominatim.
 */
exports.createEventAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, 'familyId').lean();
    if (!user?.familyId) {
      return res.status(404).json({ msg: 'Usuario sin familia asignada' });
    }

    const {
      street, number, postalCode, city,
      province, country, block = '', staircase = '',
      floor = '', door = ''
    } = req.body;

    if (!street || !number || !postalCode || !city || !province || !country) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios en la dirección' });
    }

    // Construir datos base
    const base = {
      familyId:   user.familyId,
      street, number, block, staircase,
      floor, door, postalCode, city, province, country
    };

    // Intentar encontrar duplicado textual
    const existing = await Address.findOne(base).lean();
    if (existing) {
      return res.json(existing);
    }

    // Geocodificar ubicación
    const location = await geocodeAddress({ street, number, postalCode, city, province, country });

    // Crear nueva dirección
    const addr = new Address({ ...base, location });
    const saved = await addr.save();
    return res.status(201).json(saved);

  } catch (err) {
    console.error('[createEventAddress]', err);
    return res.status(500).json({ msg: err.message || 'Error al crear dirección de evento' });
  }
};
