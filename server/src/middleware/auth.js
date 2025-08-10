// server/src/middleware/auth.js
// Middleware para proteger rutas privadas mediante la verificación de tokens JWT.
const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  // Extraer la cabecera de autorización de la solicitud
  const authHeader = req.headers.authorization;

  // Verificar que la cabecera contenga un token en formato Bearer
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  // Extraer el token desde la cabecera
  const token = authHeader.split(' ')[1];

  try {
    // Verificar la validez del token usando la clave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Almacenar los datos del usuario en la solicitud para su uso posterior
    req.user = payload;
    // Continuar con el siguiente middleware o controlador       
    next();
  } catch (err) {
    // En caso de error de validación del token, responder con error 401
    res.status(401).json({ error: 'Token not valid' });
  }
};
