// src/routes/AppRoutes.jsx
// Enrutamiento central de la app: declara rutas públicas y privadas, aplicando PrivateRoute
import { Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute        from '../components/PrivateRoute';
import Login               from '../pages/Login';
import Register            from '../pages/Register';
import Dashboard           from '../pages/Dashboard';
import FamilyDashboard     from '../pages/FamilyDashboard';
import CreateFamily        from '../pages/CreateFamily';
import JoinFamily          from '../pages/JoinFamily';
import Notifications       from '../pages/Notifications';
import NotificationDetail  from '../pages/NotificationDetail'; 
import ForgotPassword      from '../pages/ForgotPassword';
import ResetPassword       from '../pages/ResetPassword'
import VerifyEmail         from '../pages/VerifyEmail';
import ProfilePage         from '../pages/ProfilePage';


export default function AppRoutes() {
  return (
    <Routes>
      {/* --- Rutas públicas--- */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Rutas privadas / protegidas con PrivateRoute*/}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/family"
        element={
          <PrivateRoute>
            <FamilyDashboard />
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
      {/* Ruta de detalle de una notificacion (_id) */}
      <Route
        path="/dashboard/notifications/:nid"
        element={
          <PrivateRoute>
            <NotificationDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      {/* [POR DEFECTO] Cualquier otra ruta redirige a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
