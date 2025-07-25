// client/src/pages/Register.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName1: '', lastName2: '',
    email: '', password: '', confirmPassword: '',
    role: 'otro', phone: '', birthDate: '', gender: ''
  });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    // Validar contraseñas iguales
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const payload = {
        firstName: form.firstName,
        lastName1: form.lastName1,
        lastName2: form.lastName2,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        birthDate: form.birthDate || null,
        gender: form.gender || null
      };
      await axios.post('/api/auth/register', payload);
      nav('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'No se ha podido registrar correctamente.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">Página de registro</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="firstName"
          placeholder="Nombre"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="lastName1"
          placeholder="Primer apellido"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="lastName2"
          placeholder="Segundo apellido"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Repite la contraseña"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Teléfono"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="birthDate"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="gender"
          onChange={handleChange}
          value={form.gender}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecciona sexo</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>

        <select
          name="role"
          onChange={handleChange}
          value={form.role}
          className="w-full p-2 border rounded"
        >
          <option value="madre">Madre</option>
          <option value="padre">Padre</option>
          <option value="hijo">Hijo</option>
          <option value="hija">Hija</option>
          <option value="otro">Otro</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Registrar
        </button>
      </form>

      <p className="mt-4 text-center">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
