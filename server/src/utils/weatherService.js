// server/src/utils/weatherService.js
// Servicio para consultar el clima en una ubicación y momento determinados usando la API de WeatherAPI.
const axios = require('axios');

/**
 * Obtiene el pronóstico del clima para una ubicación y hora específicas
 * @param {number} lat - Latitud de la ubicación
 * @param {number} lon - Longitud de la ubicación
 * @param {Date} eventDateTime - Fecha y hora del evento
 * @returns {Promise<Object>} - Datos meteorológicos del momento más cercano
 */
async function getWeatherForDateTime(lat, lon, eventDateTime) {
  const apiKey = process.env.WEATHERAPI_KEY;

  // Extraer la fecha en formato YYYY-MM-DD
  const eventDate = eventDateTime.toISOString().split('T')[0];

  // Petición HTTP a la API del clima
  const resp = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
    params: {
      key: apiKey,
      q: `${lat},${lon}`,
      days: 3, 
      lang: 'es',
      aqi: 'no',
      alerts: 'no'
    }
  });

  // Buscar pronóstico para la fecha del evento
  const forecastDay = resp.data.forecast.forecastday.find(d => d.date === eventDate);
  if (!forecastDay) {
    throw new Error('No se encontró pronóstico para esa fecha');
  }

  // Buscar la hora más cercana a la hora del evento
  let closestHour = forecastDay.hour[0];
  let minDiff = Infinity;
  for (const h of forecastDay.hour) {
    const diff = Math.abs(new Date(h.time).getTime() - eventDateTime.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closestHour = h;
    }
  }

  // Devolver datos relevantes del clima
  return {
    temperature: closestHour.temp_c,
    description: closestHour.condition.text,
    icon: `https:${closestHour.condition.icon}`,
    time: closestHour.time,
    temp_min: forecastDay.day.mintemp_c,
    temp_max: forecastDay.day.maxtemp_c,
    wind_kph: closestHour.wind_kph,
    wind_dir: closestHour.wind_dir,
    precip_mm: closestHour.precip_mm
  };
}

module.exports = { getWeatherForDateTime };
