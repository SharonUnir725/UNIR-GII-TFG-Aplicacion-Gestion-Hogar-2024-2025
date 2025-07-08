import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const res = await axios.get(
          `${baseUrl}/api/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifs(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar notificaciones');
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

      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : notifs.length === 0 ? (
        <p>No tienes notificaciones.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifs.map(n => {
            let title;
            switch (n.type) {
              case 'join_request':
                title = 'Solicitud de unión';
                break;
              case 'join_approved':
                title = 'Solicitud aprobada';
                break;
              case 'join_rejected':
                title = 'Solicitud denegada';
                break;
              case 'new_task':
                title = 'Nueva tarea asignada';
                break;
              case 'modified_task':
                title = 'Tarea modificada';
                break;
              case 'new_event':
                title = 'Nuevo evento';
                break;
              case 'modified_event':
                title = 'Evento modificado';
                break;
              case 'task_completed':
                title = 'Tarea completada';
                break;
              default:
                title = 'Notificación';
            }
            const isNew = n.status === 'pending';
            const receivedAt = new Date(n.createdAt).toLocaleString();

            return (
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
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <strong>{title}</strong>
                    <span style={{
                      fontSize: '0.85em',
                      color: '#666'
                    }}>
                      {receivedAt}
                    </span>
                  </div>
                  {isNew && (
                    <span style={{
                      color: 'red',
                      marginLeft: '0.5rem',
                      fontSize: '0.9em'
                    }}>
                      • NUEVO
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={() => nav('/dashboard')}
        style={{ marginTop: '2rem' }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  );
}
