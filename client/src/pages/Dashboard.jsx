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
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to your dashboard!</h1>
      <div style={{ marginBottom: '1rem' }}></div>
      <Link to="/dashboard/create-family">
         <button>Crear una familia</button>
      </Link>
      {' '}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
