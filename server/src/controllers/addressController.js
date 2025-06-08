// server/src/controllers/addressController.js
const Address = require('../models/address');
const Family  = require('../models/family');
const User    = require('../models/user');
const axios   = require('axios');

/**
 * GET /api/address
 * Devuelve la dirección asociada a la familia del usuario autenticado (o null si no existe).
 */
exports.getAddressByFamily = async (req, res) => {
  try {
    // Identificar usuario y su familia guardada en DB
    const userId = req.user.id;
    const user = await User.findById(userId).lean();
    if (!user || !user.familyId) {
      return res.status(404).json({ msg: 'No perteneces a ninguna familia' });
    }
    const familyId = user.familyId;

    // Buscar dirección por familyId
    const address = await Address.findOne({ familyId }).lean();
    return res.json(address || null);
  } catch (err) {
    console.error('[addressController.getAddressByFamily]', err);
    return res.status(500).json({ msg: 'Error al obtener la dirección' });
  }
};

/**
 * POST /api/address
 * Crea o actualiza (upsert) la dirección de la familia del usuario autenticado.
 * Siempre calcula coordenadas usando OpenStreetMap Nominatim y las guarda.
 */
exports.upsertAddress = async (req, res) => {
  try {
    // 1) Identificar usuario y familia
    const userId = req.user.id;
    const user   = await User.findById(userId).lean();
    if (!user || !user.familyId) {
      return res.status(404).json({ msg: 'No perteneces a ninguna familia' });
    }
    const familyId = user.familyId;

    // 2) Verificar permisos: solo el owner
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ msg: 'Familia no encontrada' });
    }
    if (family.owner.toString() !== userId) {
      return res.status(403).json({ msg: 'Solo el administrador puede editar la dirección' });
    }

    // 3) Extraer y validar campos del body
    const {
      street,
      number,
      postalCode,
      city,
      province,
      country,
      block     = '',
      staircase = '',
      floor     = '',
      door      = ''
    } = req.body;
    if (!street || !number || !postalCode || !city || !province || !country) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios en la dirección' });
    }

    // 4) Construir y normalizar string para geocoding
    let addressStr = `${street} ${number}, ${postalCode} ${city}, ${province}, ${country}`;
    addressStr = addressStr.normalize('NFD').replace(/[̀-ͯ]/g, '');

    // 5) Geocoding con Nominatim
    const nomUrl =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressStr)}`;
    const geoRes = await axios.get(nomUrl, {
      headers: { 'User-Agent': 'TFG-Familia/1.0 (sharonursula.delille725@comunidadunir.net)' }
    });
    if (!Array.isArray(geoRes.data) || !geoRes.data.length) {
      return res.status(400).json({ msg: 'No se pudo geolocalizar la dirección. Verifica la información.' });
    }
    const { lat, lon } = geoRes.data[0];
    const location = { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] };

    // 6) Datos a guardar
    const data = {
      street,
      number,
      block,
      staircase,
      floor,
      door,
      postalCode,
      city,
      province,
      country,
      location
    };

    // 7) Upsert: actualizar si existe, si no crear nuevo
    let address = await Address.findOne({ familyId });
    if (address) {
      Object.assign(address, data);
      await address.save();
      return res.json(address);
    } else {
      const newAddr = new Address({ familyId, ...data });
      const saved = await newAddr.save();
      return res.status(201).json(saved);
    }
  } catch (err) {
    console.error('[addressController.upsertAddress]', err);
    return res.status(500).json({ msg: 'Error al guardar la dirección', detail: err.message });
  }
};
