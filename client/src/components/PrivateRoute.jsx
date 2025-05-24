// client/src/components/PrivateRoute.jsx
// Cerrar el acceso a las páginas de tu dashboard a quien no tenga un token en el localStorage

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rutas para usuarios autenticados.
 * Mientras carga el perfil muestra un indicador.
 * Si no hay usuario, redirige al login.
 */
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>Cargando usuario...</p>;
  }
  return user
    ? children
    : <Navigate to="/login" replace />;
}
