// server/src/utils/token.js
const crypto = require('crypto');

/**
 * Genera un token seguro en formato hexadecimal.
 * @param {number} length - Número de bytes (por defecto 32)
 * @returns {string}
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Devuelve una marca de tiempo de expiración a partir de ahora.
 * @param {number} hours - Cuántas horas dura el token
 * @returns {number} timestamp
 */
function tokenExpiresIn(hours = 1) {
  return Date.now() + hours * 60 * 60 * 1000;
}

module.exports = {
  generateToken,
  tokenExpiresIn
};
