// server/src/utils/mailer.js
// Módulo para el envío de correos electrónicos usando nodemailer.
const nodemailer = require('nodemailer');

// Configura el transporte SMTP con credenciales del entorno (.env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // Email del remitente
    pass: process.env.EMAIL_PASS    // Contraseña del email
  }
});

/**
 * Envía un correo electrónico usando la configuración SMTP
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.text - Cuerpo del correo en texto plano
 * @param {string} options.html - (Opcional) Cuerpo en HTML
 * @returns {Promise}
 */
function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendMail };
