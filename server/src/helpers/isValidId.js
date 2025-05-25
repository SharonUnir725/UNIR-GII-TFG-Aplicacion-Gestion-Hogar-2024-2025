// src/helpers/isValidId.js
const { Types } = require('mongoose');

/**
 * Comprueba si un string es un ObjectId válido de MongoDB.
 * @param {string} id - El id a validar.
 * @returns {boolean}
 */
function isValidId(id) {
  return Types.ObjectId.isValid(id);
}

module.exports = isValidId;