// client/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const nav               = useNavigate();
  const { login, user }   = useAuth();

  // Si ya hay usuario en contexto, redirige al Dashboard
  useEffect(() => {
    if (user) {
      nav('/dashboard');
    }
  }, [user, nav]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const res     = await axios.post(
        `${baseUrl}/api/auth/login`,
        form
      );
      // Guarda el token en el contexto (actualiza estado y dispara recarga de perfil)
      login(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login sin éxito');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center">
        Nuevo? <Link to="/register" className="text-blue-600 hover:underline">Regístrate aquí</Link>
      </p>
    </div>
  );
}
