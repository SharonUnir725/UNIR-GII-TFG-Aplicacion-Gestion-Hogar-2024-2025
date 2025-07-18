// client/src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  // 👉 estado para la paginación
  const itemsPerPage = 8; // cantidad por página
  const [currentPage, setCurrentPage] = useState(1);

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

  if (loading) return <p className="text-center mt-6">Cargando notificaciones…</p>;

  // 👉 lógica de paginación
  const totalPages = Math.ceil(notifs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = notifs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">📌 Notificaciones</h2>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : notifs.length === 0 ? (
        <p className="text-gray-700">No tienes notificaciones.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentItems.map((n) => {
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
                  className={`border rounded p-4 shadow-sm hover:shadow-md transition ${
                    n.status === 'read' ? 'opacity-50' : ''
                  }`}
                >
                  <Link
                    to={`/dashboard/notifications/${n._id}`}
                    className="flex flex-col justify-between h-full text-black no-underline"
                  >
                    <div>
                      <strong className="text-lg">{title}</strong>
                      {isNew && (
                        <span className="text-red-500 ml-2 text-sm font-semibold">• NUEVO</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm mt-2">{receivedAt}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Controles de paginación */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded text-white ${
                currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              ← Anterior
            </button>
            <p className="text-gray-700">
              Página {currentPage} de {totalPages}
            </p>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded text-white ${
                currentPage === totalPages
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      <div className="mt-8 flex justify-start">
        <button
          onClick={() => nav('/dashboard')}
          className="inline-block px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
        >
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
