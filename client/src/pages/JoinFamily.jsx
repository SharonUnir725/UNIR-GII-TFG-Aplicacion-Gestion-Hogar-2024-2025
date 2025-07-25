import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function JoinFamily() {
  const [query, setQuery]       = useState('');
  const [families, setFamilies] = useState([]);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const nav = useNavigate();

  // 1) Buscar familias
  const handleSearch = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.get(
        `/api/families/search?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFamilies(res.data);
    } catch (err) {
      console.error('Search error:', err.response ?? err);
      setError(err.response?.data?.error || 'Error al buscar familias');
    }
  };

  // 2) Solicitar unión a familia
  const handleJoin = async familyId => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.post(
        `/api/families/${familyId}/join-request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Join response:', res.data);
      setSuccess('Solicitud enviada correctamente.');
    } catch (err) {
      console.error('Join error:', err.response ?? err);
      const backendMsg = err.response?.data?.error;
      setError(backendMsg || `Error al enviar la solicitud (${err.response?.status})`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        🤝 Asociarse a una familia
      </h2>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nombre o ID de familia"
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {/* Mensajes de error o éxito */}
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      {/* Lista de familias */}
      <ul className="space-y-4">
        {families.map(fam => (
          <li key={fam._id} className="p-4 border rounded flex justify-between items-center hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-800">{fam.name}</p>
              <p className="text-sm text-gray-500">ID: {fam._id}</p>
            </div>
            <button
              onClick={() => handleJoin(fam._id)}
              disabled={!!success}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Unirme
            </button>
          </li>
        ))}
      </ul>

      {/* Botón volver */}
      <div className="mt-6">
        <button
          onClick={() => nav('/dashboard')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
