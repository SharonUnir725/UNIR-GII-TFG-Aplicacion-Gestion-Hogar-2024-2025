// client/src/pages/CreateFamily.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateFamily() {
  const [name, setName]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const nav = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Coge el token del localStorage
      const token = localStorage.getItem('token');
      const res   = await axios.post(
        '/api/families',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Ajuste: extrae el objeto family de la respuesta
      const { family } = res.data;
      setSuccess(`✅ Familia "${family.name}" creada!`);
      nav(`/family`);
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.error || '❌ Error al crear la familia');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Crear nueva familia</h2>

      {/* Mensajes de error y éxito */}
      {error && <p className="mb-2 text-red-600 font-medium">{error}</p>}
      {success && <p className="mb-2 text-green-600 font-medium">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Nombre de la familia</label>
          <input
            type="text"
            placeholder="Ej. Familia Pérez"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-blue-300 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-medium py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Crear familia
        </button>
      </form>

      <button
        onClick={() => nav('/dashboard')}
        className="mt-4 w-full bg-gray-300 text-gray-800 font-medium py-2 rounded hover:bg-gray-400 transition-colors"
      >
        ← Volver al Dashboard
      </button>
    </div>
  );
}
