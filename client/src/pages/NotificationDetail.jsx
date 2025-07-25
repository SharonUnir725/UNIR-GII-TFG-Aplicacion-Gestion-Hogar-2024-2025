// client/src/pages/NotificationDetail.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AssocDetail from '../components/AssocDetail';

export default function NotificationDetail() {
  const { nid } = useParams();
  const nav = useNavigate();
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAndMark() {
      try {
        const token = localStorage.getItem('token');
        // Obtener la notificación completa
        const resNotif = await axios.get(`/api/notifications/${nid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotif(resNotif.data);

        // Si está pendiente, marcar como leída
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

  if (loading) return <p className="text-center text-gray-600 mt-6">Cargando detalle de notificación…</p>;
  if (!notif) return <p className="text-center text-red-600 mt-6">No se encontró la notificación.</p>;

  // Botón volver reutilizable
  const BackButton = () => (
    <button
      onClick={() => nav('/dashboard/notifications')}
      className="mt-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
    >
      ← Volver a Notificaciones
    </button>
  );

  // Contenedor base para homogeneidad
  const Container = ({ title, children }) => (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded-lg shadow border">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-2">{children}</div>
      <BackButton />
    </div>
  );

  // Render según tipo
  switch (notif.type) {
    case 'join_request':
      return (
        <Container title="Solicitud de unión">
          <AssocDetail notification={notif} />
        </Container>
      );

    case 'join_approved':
      return (
        <Container title="Solicitud de asociación aprobada">
          <p>🥳 Tu solicitud ha sido aprobada. ¡Bienvenido a la familia!</p>
        </Container>
      );

    case 'join_rejected':
      return (
        <Container title="Solicitud de asociación denegada">
          <p>😞 Lo sentimos, tu solicitud ha sido rechazada.</p>
        </Container>
      );

    case 'new_task':
      return (
        <Container title="Nueva tarea asignada">
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p><strong>Prioridad:</strong> {notif.payload.priority}</p>
          <p><strong>Vence:</strong> {new Date(notif.payload.dueDate).toLocaleDateString()}</p>
          <p><strong>Descripción:</strong> {notif.payload.description}</p>
        </Container>
      );

    case 'modified_task':
      return (
        <Container title="Tarea modificada">
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p><strong>Prioridad:</strong> {notif.payload.priority}</p>
          <p><strong>Estado:</strong> {notif.payload.status}</p>
          <p><strong>Descripción:</strong> {notif.payload.description}</p>
        </Container>
      );

    case 'new_event':
      return (
        <Container title="Nuevo evento">
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p><strong>Inicio:</strong> {new Date(notif.payload.startDateTime).toLocaleString()}</p>
          <p><strong>Fin:</strong> {new Date(notif.payload.endDateTime).toLocaleString()}</p>
          {notif.payload.locatedAt && (
            <p><strong>Ubicación:</strong> {notif.payload.locatedAt.street} {notif.payload.locatedAt.number}, {notif.payload.locatedAt.city}</p>
          )}
          {notif.payload.participants?.length > 0 && (
            <p><strong>Participantes:</strong> {notif.payload.participants.map(u => u.firstName).join(', ')}</p>
          )}
        </Container>
      );

    case 'modified_event':
      return (
        <Container title="Evento modificado">
          <p><strong>Título:</strong> {notif.payload.title}</p>
          <p><strong>Inicio:</strong> {new Date(notif.payload.startDateTime).toLocaleString()}</p>
          <p><strong>Fin:</strong> {new Date(notif.payload.endDateTime).toLocaleString()}</p>
          {notif.payload.locatedAt && (
            <p><strong>Ubicación:</strong> {notif.payload.locatedAt.street} {notif.payload.locatedAt.number}, {notif.payload.locatedAt.city}</p>
          )}
          {notif.payload.participants?.length > 0 && (
            <p><strong>Participantes:</strong> {notif.payload.participants.map(u => u.firstName).join(', ')}</p>
          )}
        </Container>
      );

    case 'task_completed':
      return (
        <Container title="Tarea completada">
          <p>{notif.payload.message}</p>
        </Container>
      );

    default:
      return (
        <Container title="Notificación">
          <p>Tipo de notificación desconocido.</p>
        </Container>
      );
  }
}
