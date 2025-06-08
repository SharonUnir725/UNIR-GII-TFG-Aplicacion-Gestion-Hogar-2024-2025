// server/src/routes/addressRoutes.js

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  getAddressByFamily,
  upsertAddress
} = require('../controllers/addressController');

// Obtener la dirección (si existe)
// GET  /api/address
router.get('/',    auth, getAddressByFamily);  

// crear o actualizar la dirección (sólo owner)
// POST /api/address
router.post('/',   auth, upsertAddress); 

module.exports = router;
