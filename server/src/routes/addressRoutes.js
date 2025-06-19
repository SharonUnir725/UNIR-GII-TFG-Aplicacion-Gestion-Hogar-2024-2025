// server/src/routes/addressRoutes.js

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  getAddressByFamily,
  upsertAddress,
  listEventAddresses,
  createEventAddress
} = require('../controllers/addressController');

// Obtener la dirección (si existe)
// GET  /api/address
router.get('/',    auth, getAddressByFamily);  

// crear o actualizar la dirección (sólo owner)
// POST /api/address
router.post('/',   auth, upsertAddress); 

// **Listar direcciones para eventos**
// GET  /api/address/event
router.get('/event', auth, listEventAddresses);

// **Crear dirección para evento (upsert por duplicado)**
// POST /api/address/event
router.post('/event', auth, createEventAddress);

module.exports = router;
