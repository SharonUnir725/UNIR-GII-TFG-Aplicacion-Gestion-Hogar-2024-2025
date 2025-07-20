// client/src/utils/weatherApi.js
import axios from 'axios';

/**
 * Obtiene la previsión meteorológica de un evento
 * @param {string} eventId - ID del evento
 * @param {string} token   - Token de autenticación
 * @param {string} apiBase - Base URL de la API
 * @returns {Promise<Object>} { temperature, description, icon }
 */
export async function getWeatherForEvent(eventId, token, apiBase = '') {
  try {
    const response = await axios.get(`${apiBase}/api/events/${eventId}/weather`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    console.error('Error obteniendo previsión meteorológica:', err);
    throw err;
  }
}
 