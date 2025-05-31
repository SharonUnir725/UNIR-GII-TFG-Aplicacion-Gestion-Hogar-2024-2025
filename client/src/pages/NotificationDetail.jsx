// client/src/pages/NotificationDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Importar el subcomponente para "join_request"
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
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotif(resNotif.data);

        // 2) Marcar como leída si está en "pending"
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

  // Manejar la decisión de aprobar/rechazar
  const handleDecision = async (action) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Llamar al endpoint de approve/reject para join_request
      await axios.put(
        `/api/families/${notif.family}/join-requests/${notif.payload.requestId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Volver a lista de notificaciones
      nav('/dashboard/notifications');
    } catch {
      setError('Error al procesar la solicitud');
    }
  };

  if (loading) return <p>Cargando detalle de notificación…</p>;
  if (!notif)  return <p>No se encontró la notificación.</p>;

  // Escoger subcomponente según el tipo de notificación
  let DetailComponent;
  switch (notif.type) {
    case 'join_request':
      DetailComponent = () => <AssocDetail notification={notif} onDecision={handleDecision} />;
      break;
    default:
      DetailComponent = () => <p>Tipo de notificación desconocido.</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Notificación</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <DetailComponent />
      <button
        onClick={() => nav('/dashboard/notifications')}
        style={{ marginTop: '2rem' }}
      >
        ← Volver a Notificaciones
      </button>
    </div>
  );
}