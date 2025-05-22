// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from '../components/PrivateRoute';
import Login        from '../pages/Login';
import Register     from '../pages/Register';
import Dashboard    from '../pages/Dashboard';
import CreateFamily from '../pages/CreateFamily';
import JoinFamily   from '../pages/JoinFamily';
import Notifications from '../pages/Notifications';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/create-family"
        element={
          <PrivateRoute>
            <CreateFamily />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/join-family"
        element={
          <PrivateRoute>
            <JoinFamily />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />

      {/* [POR DEFECTO] Cualquier otra ruta redirige a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
