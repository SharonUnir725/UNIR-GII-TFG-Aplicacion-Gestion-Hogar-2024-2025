// client/src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const nav = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    nav('/login');
  };
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to your dashboard!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
