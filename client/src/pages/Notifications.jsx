// client/src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  // estado para la paginación
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

  if (loading) return <p className="text-center mt-6 text-gray-700">Cargando notificaciones…</p>;

  // lógica de paginación
  const totalPages = Math.ceil(notifs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = notifs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">📌 Notificaciones</h2>

      {error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : notifs.length === 0 ? (
        <p className="text-gray-700 text-center">No tienes notificaciones.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className={`border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition duration-200 shadow-sm hover:shadow-md ${
                    n.status === 'read' ? 'opacity-60' : ''
                  }`}
                >
                  <Link
                    to={`/dashboard/notifications/${n._id}`}
                    className="flex flex-col justify-between h-full text-gray-800 no-underline"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-lg font-semibold">{title}</strong>
                      {isNew && (
                        <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          NUEVO
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm mt-3">{receivedAt}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Controles de paginación */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                currentPage === 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              ← Anterior
            </button>
            <p className="text-gray-700">
              Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
            </p>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white font-medium ${
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

      <div className="mt-10 text-center">
        <button
          onClick={() => nav('/dashboard')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
