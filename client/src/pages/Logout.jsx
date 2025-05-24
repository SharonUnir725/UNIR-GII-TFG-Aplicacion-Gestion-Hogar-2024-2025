// client/src/pages/Logout.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Logout() {
  const { logout } = useAuth();
  const nav        = useNavigate();

  useEffect(() => {
    // 1) Limpia contexto y localStorage
    logout();
    // 2) Tras 5 segundos, redirige automáticamente al login
    const timer = setTimeout(() => {
      nav('/login');
    }, 5000);

    // Cleanup por si el usuario cierra la pestaña antes
    return () => clearTimeout(timer);
  }, [logout, nav]);

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-4">Has cerrado sesión</h2>
      <p>En breve volverás a la página de Login...</p>
    </div>
  );
}
