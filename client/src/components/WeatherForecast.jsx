// client/src/components/WeatherForecast.jsx

export default function WeatherForecast({ weather }) {
  // Estado cargando
  if (!weather) {
    return (
      <div className="mt-4 p-3 border rounded bg-blue-50">
        <p className="font-medium">🌤️ Previsión meteorológica:</p>
        <p>Cargando datos de clima...</p>
      </div>
    );
  }

  // Estado sin datos disponibles
  if (weather.unavailable) {
    return (
      <div className="mt-4 p-3 border rounded bg-blue-50">
        <p className="font-medium">🌤️ Previsión meteorológica:</p>
        <p>No hay datos de clima disponibles para este evento.</p>
      </div>
    );
  }

  // Estado con datos disponibles
  return (
    <div className="mt-4 p-3 border rounded bg-blue-50">
      <p className="font-medium">🌤️ Previsión meteorológica:</p>

      {/* Fecha y hora del pronóstico si existe */}
      {weather.time ? (
        <p>
          📅 <strong>
            {new Date(weather.time).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </strong>
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Sin fecha/hora específica para este pronóstico
        </p>
      )}

      {/* Datos horarios */}
      <p>
        🌡️ Temperatura a la hora del evento:{' '}
        {weather.temperature != null ? `${weather.temperature} °C` : 'Sin datos'}
      </p>
      <p>
        ☀️ Estado:{' '}
        {weather.description && weather.description.trim() !== ''
          ? weather.description
          : 'Sin datos'}
      </p>

      {weather.icon && (
        <img
          src={weather.icon}
          alt="Icono clima"
          className="mt-2 w-12 h-12"
        />
      )}

      {/* Datos diarios */}
        {weather.temp_min != null || weather.temp_max != null ? (
        <p className="mt-2 text-sm text-gray-600">
            🔻 Mín:{' '}
            {weather.temp_min != null ? `${weather.temp_min} °C` : 'Sin datos'}
            &nbsp; | &nbsp;
            🔺 Máx:{' '}
            {weather.temp_max != null ? `${weather.temp_max} °C` : 'Sin datos'}
        </p>
        ) : (
        <p className="mt-2 text-sm text-gray-600">
            No hay datos de mín/máx para este día
        </p>
        )}

        {/* Datos adicionales: lluvia y viento */}
        {weather.precip_mm != null && (
        <p className="mt-2 text-sm text-gray-600">
            🌧️ Lluvia: {weather.precip_mm} mm
        </p>
        )}
        {weather.wind_kph != null && (
        <p className="mt-1 text-sm text-gray-600">
            💨 Viento: {weather.wind_kph} km/h
        </p>
        )}
        
    </div>
  );
}
