// client/src/components/EventDetail.jsx
export default function EventDetail({ event, onClose, onEdit }) {
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

        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
          <button
            onClick={() => onEdit(event)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Modificar evento
          </button>
        </div>
      </div>
    </div>
  );
}
