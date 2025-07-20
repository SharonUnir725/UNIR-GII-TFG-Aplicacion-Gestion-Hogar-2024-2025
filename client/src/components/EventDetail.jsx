// client/src/components/EventDetail.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherForEvent } from '../utils/weatherApi';
import WeatherForecast from './WeatherForecast';

export default function EventDetail({ event, onClose, onEdit, onDelete }) {
  const { token } = useAuth();
  const apiBase = process.env.REACT_APP_API_URL || '';
  const [weather, setWeather] = useState(null);

  // Obtener la previsión meteorológica cuando se abre el detalle del evento
  useEffect(() => {
    if (event?._id) {
      getWeatherForEvent(event._id, token, apiBase)
        .then(data => setWeather(data))
        .catch(err => console.error('Error cargando clima', err));
    }
  }, [event, token, apiBase]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h3 className="text-2xl font-semibold mb-4">{event.title}</h3>

        <div className="space-y-2 text-gray-700">
          {event.description && (
            <p>
              <strong>Descripción:</strong> {event.description}
            </p>
          )}
          {event.locatedAt && (
            <p>
              <strong>Ubicación:</strong> {event.locatedAt.street} {event.locatedAt.number}, {event.locatedAt.city}
            </p>
          )}
          <p>
            <strong>Inicio:</strong> {new Date(event.startDateTime).toLocaleString()}
          </p>
          <p>
            <strong>Fin:</strong> {new Date(event.endDateTime).toLocaleString()}
          </p>
          {event.participants && event.participants.length > 0 && (
            <p>
              <strong>Participantes:</strong> {event.participants.map(u => u.firstName).join(', ')}
            </p>
          )}
          {event.description && (
            <p>
              <strong>Descripción:</strong> {event.description} 
            </p>
          )}
        </div>

        {/* Bloque para mostrar la previsión meteorológica */}
        <WeatherForecast weather={weather} />

        <div className="flex justify-end mt-6 space-x-2">
          {/* Botón cerrar detalle evento */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
          {/* Botón modificar evento */}
          <button
            onClick={() => onEdit(event)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Modificar evento
          </button>
          {/* Botón eliminar evento */}
          <button
            onClick={() => onDelete(event._id)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar evento
          </button>
        </div>
      </div>
    </div>
  );
}
