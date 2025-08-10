// client/src/utils/notify.js
// Envía una notificación persistente al backend mediante POST /api/notifications.
import axios from 'axios';

export function notify({ type, taskId, eventId, recipients, payload }) {
   // 1) Token de autenticación (JWT) guardado por el login
  const token = localStorage.getItem('token');

  // 2) Cuerpo mínimo; añade taskId/eventId solo si existen
  const body = { type, recipients, payload };
  if (taskId)  body.taskId  = taskId;
  if (eventId) body.eventId = eventId;

  // 3) Llamada al endpoint; errores silenciados a propósito
  return axios.post(
    `${process.env.REACT_APP_API_URL || ''}/api/notifications`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).catch(() => {});  
}
