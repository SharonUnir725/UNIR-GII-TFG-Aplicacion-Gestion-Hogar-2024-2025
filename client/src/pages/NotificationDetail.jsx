// client/src/pages/NotificationDetail.jsx
import React, { useState, useEffect } from 'react';
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

  // Según el tipo, mostramos un subcomponente específico:
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Notificación</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {notif.type === 'join_request' ? (
        <AssocDetail notification={notif} />
      ) : (
        <p>Tipo de notificación desconocido.</p>
      )}

      <button
        onClick={() => nav('/dashboard/notifications')}
        style={{ marginTop: '2rem' }}
      >
        ← Volver a Notificaciones
      </button>
    </div>
  );
}
