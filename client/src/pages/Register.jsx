// client/src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName1: '', lastName2: '',
    email: '', password: '', role: 'otro'
  });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', form);
      nav('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'No se ha podido registrar correctamente.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Página de registro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="firstName"    placeholder="Nombre"   onChange={handleChange} required />
        <input name="lastName1"     placeholder="Primer apellido"   onChange={handleChange} required />
        <input name="lastName2"     placeholder="Segundo apellido"   onChange={handleChange} required />
        <input type="email" name="email"     placeholder="Email"         onChange={handleChange} required />
        <input type="password" name="password"  placeholder="Contraseña"      onChange={handleChange} required />
        <select name="role" onChange={handleChange} value={form.role}>
          <option value="madre">Madre</option>
          <option value="padre">Padre</option>
          <option value="hijo">Hijo</option>
          <option value="hija">Hija</option>
          <option value="otro">Otro</option>
        </select>
        <button type="submit">Registrar</button>
      </form>
      <p>Ya tienes una cuenta? <Link to="/login">Login</Link></p>
    </div>
  );
}
