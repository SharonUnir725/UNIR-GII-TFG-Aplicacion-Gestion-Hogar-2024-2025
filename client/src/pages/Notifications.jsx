// client/src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  // Cargar notificaciones pendientes al montar el componente
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const res = await axios.get(
          `${baseUrl}/api/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(res.data);
        setError(''); // Limpiar cualquier error previo
      } catch (err) {
        // Si no existe el endpoint o no hay notificaciones, tratamos como lista vacía
        if (err.response && (err.response.status === 404 || err.response.status === 204)) {
          setNotifications([]);
          setError('');
        } else {
          setError(err.response?.data?.error || 'Error al cargar notificaciones');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  // Manejar acción (aprobar o rechazar) de una notificación
  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const note = notifications.find(n => n._id === id);
      const url = `${baseUrl}/api/families/${note.family}/join-requests/${note.payload.requestId}/${action}`;
      await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Eliminar la notificación de la lista tras procesarla
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error en la acción de notificación:', err);
    }
  };

  if (loading) return <p>Cargando notificaciones...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Notificaciones</h2>
      {notifications.length === 0 ? (
        <p>No tienes notificaciones pendientes.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map(note => (
            <li key={note._id} className="border rounded-lg p-4">
              <p className="mb-2">
                El usuario <strong>{note.payload.user}</strong> solicita unirse a la familia.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(note._id, 'approve')}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleAction(note._id, 'reject')}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg"
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => nav('/dashboard')} className="mt-6 text-blue-600">
        ← Volver al Dashboard
      </button>
    </div>
  );
}
