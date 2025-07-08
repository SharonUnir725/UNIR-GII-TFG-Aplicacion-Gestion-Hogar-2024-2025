// client/src/pages/NotificationDetail.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Subcomponentes para cada tipo. Hoy solo tenemo AssocDetail.
import AssocDetail from '../components/AssocDetail';

export default function NotificationDetail() {
  const { nid } = useParams();
  const nav     = useNavigate();
  const [notif, setNotif]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function fetchAndMark() {
      try {
        const token = localStorage.getItem('token');

        // 1) Obtener la notificación completa
        const resNotif = await axios.get(`/api/notifications/${nid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotif(resNotif.data);

        // 2) Si el estado es 'pending', marcarla como leída
        if (resNotif.data.status === 'pending') {
          await axios.put(
            `/api/notifications/${nid}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar la notificación');
      } finally {
        setLoading(false);
      }
    }

    fetchAndMark();
  }, [nid]);

  if (loading) return <p>Cargando detalle de notificación…</p>;
  if (!notif)  return <p>No se encontró la notificación.</p>;

  // Renderizar un bloque distinto según notif.type
  switch (notif.type) {
    case 'join_request':
      return (
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
          <h2>Solicitud de unión</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <AssocDetail notification={notif} />
          <button
            onClick={() => nav('/dashboard/notifications')}
            style={{ marginTop: '2rem' }}
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );

    case 'join_approved':
      return (
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
          <h2>Solicitud de asociación aprobada</h2>
          <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <p>Tu solicitud ha sido aprobada. ¡Bienvenido a la familia!</p>
          </div>
          <button
            onClick={() => nav('/dashboard/notifications')}
            style={{ marginTop: '2rem' }}
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );

    case 'join_rejected':
      return (
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
          <h2>Solicitud de asociación denegada</h2>
          <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <p>Lo sentimos, tu solicitud ha sido rechazada.</p>
          </div>
          <button
            onClick={() => nav('/dashboard/notifications')}
            style={{ marginTop: '2rem' }}
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );
    
      case 'new_task':
      return (
        <div className="max-w-lg mx-auto p-6 bg-white border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Nueva tarea asignada</h2>
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p><strong>Prioridad:</strong> {notif.payload.priority}</p>
          <p><strong>Vence:</strong> {new Date(notif.payload.dueDate).toLocaleDateString()}</p>
          <p><strong>Descripción:</strong> {notif.payload.description}</p>
          <button
            onClick={() => nav('/dashboard/notifications')}
            style={{ marginTop: '2rem' }}
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );
    case 'modified_task':
      return (
        <div className="max-w-lg mx-auto p-6 bg-white border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Tarea modificada</h2>
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p><strong>Prioridad:</strong> {notif.payload.priority}</p>
          <p><strong>Estado:</strong> {notif.payload.status}</p>
          <p><strong>Descripción:</strong> {notif.payload.description}</p>
          <button
            onClick={() => nav('/dashboard/notifications')}
            style={{ marginTop: '2rem' }}
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );
    
    case 'new_event':
      return (
        <div className="max-w-lg mx-auto p-6 bg-white border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Nuevo evento</h2>
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p>
            <strong>Inicio:</strong>{' '}
            {new Date(notif.payload.startDateTime).toLocaleString()}
          </p>
          <p>
            <strong>Fin:</strong>{' '}
            {new Date(notif.payload.endDateTime).toLocaleString()}
          </p>
          {notif.payload.locatedAt && (
            <p>
              <strong>Ubicación:</strong>{' '}
              {notif.payload.locatedAt.street} {notif.payload.locatedAt.number}, {notif.payload.locatedAt.city}
            </p>
          )}
          {notif.payload.participants?.length > 0 && (
            <p>
              <strong>Participantes:</strong>{' '}
              {notif.payload.participants.map(u => u.firstName).join(', ')}
            </p>
          )}
          <button
            onClick={() => nav('/dashboard/notifications')}
            className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );

    case 'modified_event':
      return (
        <div className="max-w-lg mx-auto p-6 bg-white border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Evento modificado</h2>
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p>
            <strong>Inicio:</strong>{' '}
            {new Date(notif.payload.startDateTime).toLocaleString()}
          </p>
          <p>
            <strong>Fin:</strong>{' '}
            {new Date(notif.payload.endDateTime).toLocaleString()}
          </p>
          {notif.payload.locatedAt && (
            <p>
              <strong>Ubicación:</strong>{' '}
              {notif.payload.locatedAt.street} {notif.payload.locatedAt.number}, {notif.payload.locatedAt.city}
            </p>
          )}
          {notif.payload.participants?.length > 0 && (
            <p>
              <strong>Participantes:</strong>{' '}
              {notif.payload.participants.map(u => u.firstName).join(', ')}
            </p>
          )}
          <button
            onClick={() => nav('/dashboard/notifications')}
            className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );

          case 'task_completed':
      return (
        <div className="max-w-lg mx-auto p-6 bg-white border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Tarea completada</h2>
          <p>{notif.payload.message}</p>
          <button
            onClick={() => nav('/dashboard/notifications')}
            className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );

    default:
      return (
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
          <h2>Notificación</h2>
          <p>Tipo de notificación desconocido.</p>
          <button
            onClick={() => nav('/dashboard/notifications')}
            style={{ marginTop: '2rem' }}
          >
            ← Volver a Notificaciones
          </button>
        </div>
      );
  }
}