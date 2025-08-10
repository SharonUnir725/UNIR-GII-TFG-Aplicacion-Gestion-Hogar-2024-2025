// client/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const nav = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      nav('/dashboard');
    }
  }, [user, nav]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const res = await axios.post(`${baseUrl}/api/auth/login`, form);
      login(res.data.token);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        toast.error('Debes verificar tu correo electrónico antes de iniciar sesión.');
      } else if (err.response && err.response.status === 401) {
        toast.error('Correo o contraseña incorrectos.');
      } else {
        toast.error('Error al intentar iniciar sesión.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          ¿Nuevo?{' '}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
}
