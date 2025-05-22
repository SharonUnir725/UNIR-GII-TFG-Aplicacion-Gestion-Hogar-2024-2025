// client/src/components/PrivateRoute.jsx
// Cerrar el acceso a las páginas de tu dashboard a quien no tenga un token en el localStorage

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}
