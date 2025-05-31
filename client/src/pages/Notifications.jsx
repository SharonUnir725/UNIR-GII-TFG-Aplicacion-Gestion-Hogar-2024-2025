// client/src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // 1) Cargar todas las notificaciones (pendientes + leídas)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifs(res.data);
      } catch {
        setNotifs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando notificaciones…</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Notificaciones</h2>

      {notifs.length === 0 ? (
        <p>No tienes notificaciones.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifs.map(n => (
            <li
              key={n._id}
              style={{
                margin: '1rem 0',
                padding: '1rem',
                border: '1px solid #ccc',
                opacity: n.status === 'read' ? 0.5 : 1
              }}
            >
              <Link
                to={`/dashboard/notifications/${n._id}`}
                style={{ textDecoration: 'none', color: '#000' }}
              >
                <strong>Solicitud de unión</strong>
                {n.status === 'pending' && (
                  <span style={{ color: 'red', marginLeft: '0.5rem' }}>• NUEVO</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => nav('/dashboard')} style={{ marginTop: '2rem' }}>
        ← Volver al Dashboard
      </button>
    </div>
  );
}
