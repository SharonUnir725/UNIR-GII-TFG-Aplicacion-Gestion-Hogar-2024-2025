// client/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  // Ahora extraemos token, user, loading y logout
  const { token, user, loading, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  // Cargar notificaciones pendientes al montar
  useEffect(() => {
    async function fetchNotifs() {
      if (!token) return; // si no hay token, no intentamos
      try {
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const res = await axios.get(
          `${baseUrl}/api/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pendingOnly = res.data.filter(n => n.status === 'pending');
        setNotifCount(pendingOnly.length);
      } catch (err) {
        console.error('Error al obtener notificaciones:', err);
      }
    }
    fetchNotifs();
  }, [token]);

  if (loading) {
    return <p>Cargando perfil...</p>;
  }

  // Si no hay usuario válido (o token), redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <p className="text-lg mb-4">
        Hola, {user.firstName} {user.lastName1} {user.lastName2}
      </p>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bienvenido a tu Dashboard</h1>
        <Link to="/dashboard/notifications" className="relative">
          <span role="img" aria-label="notificaciones" className="text-2xl">
            🔔
          </span>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {notifCount}
            </span>
          )}
        </Link>
      </div>

<div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          {/* Si NO tienes familia, mostramos Crear/Asociarse */}
          {!user.familyId && (
            <>
              <Link to="/dashboard/create-family">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
                  Crear una familia
                </button>
              </Link>
              <Link to="/dashboard/join-family">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                  Asociarse a una familia
                </button>
              </Link>
            </>
          )}

          {/* Logout siempre visible */}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Botón “Ver Mi Familia” si existe familyId */}
        {user.familyId && (
          <Link to="/family">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
              Ver Mi Familia
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
