// client/src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const nav = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    nav('/login');
  };
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a tu Dashboard</h1>
      <div className="flex gap-4 mb-6">
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
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
