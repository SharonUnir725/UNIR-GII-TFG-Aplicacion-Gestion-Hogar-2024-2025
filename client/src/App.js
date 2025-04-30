// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateFamily from './pages/CreateFamily';

function App() {
  //Comprobar localStorage tras el login
  function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token
      ? children
      : <Navigate to="/login" replace />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/dashboard"
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


