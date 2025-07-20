const axios = require('axios');

async function getWeatherForDateTime(lat, lon, eventDateTime) {
  const apiKey = process.env.WEATHERAPI_KEY;

  // Fecha en formato YYYY-MM-DD
  const eventDate = eventDateTime.toISOString().split('T')[0];

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

  const forecastDay = resp.data.forecast.forecastday.find(d => d.date === eventDate);
  if (!forecastDay) {
    throw new Error('No se encontró pronóstico para esa fecha');
  }

  // Buscar la hora más cercana
  let closestHour = forecastDay.hour[0];
  let minDiff = Infinity;
  for (const h of forecastDay.hour) {
    const diff = Math.abs(new Date(h.time).getTime() - eventDateTime.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closestHour = h;
    }
  }

  return {
  // datos horarios
  temperature: closestHour.temp_c,
  description: closestHour.condition.text,
  icon: `https:${closestHour.condition.icon}`,
  time: closestHour.time,

  // datos diarios
  temp_min: forecastDay.day.mintemp_c,
  temp_max: forecastDay.day.maxtemp_c,
  wind_kph: closestHour.wind_kph,
  wind_dir: closestHour.wind_dir,
  precip_mm: closestHour.precip_mm
};

}

module.exports = { getWeatherForDateTime };
