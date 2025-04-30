// client/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login sin éxito');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" name="email"        placeholder="Email"    onChange={handleChange} required />
        <input type="password" name="password"     placeholder="Contraseña" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <p>Nuevo? <Link to="/register">Aqui se puede registrar</Link></p>
    </div>
  );
}
