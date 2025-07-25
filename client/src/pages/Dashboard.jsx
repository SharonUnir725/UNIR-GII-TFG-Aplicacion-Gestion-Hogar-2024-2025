// client/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';

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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Cabecera con avatar y bienvenida */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.profileImage && user.profileImage.trim() !== '' ? user.profileImage : defaultAvatar}
          alt="Avatar de perfil"
          className="w-20 h-20 rounded-full border object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">👋 Hola {user.firstName}!</h1>
        </div>
        <Link to="/dashboard/notifications" className="ml-auto relative">
          <span role="img" aria-label="notificaciones" className="text-3xl">
            🔔
          </span>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {notifCount}
            </span>
          )}
        </Link>
      </div>

      {/* Botones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!user.familyId && (
          <>
            <Link to="/dashboard/create-family">
              <button className="w-full py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
                Crear una familia
              </button>
            </Link>
            <Link to="/dashboard/join-family">
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                Asociarse a una familia
              </button>
            </Link>
          </>
        )}
        {user.familyId && (
          <Link to="/family">
            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
              Ver Mi Familia
            </button>
          </Link>
        )}
        <Link to="/profile">
          <button className="w-full py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700">
            Ver / Editar mi Perfil
          </button>
        </Link>
        <button
          onClick={logout}
          className="w-full py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
