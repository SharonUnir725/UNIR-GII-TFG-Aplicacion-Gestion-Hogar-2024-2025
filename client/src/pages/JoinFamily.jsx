// client/src/pages/JoinFamily.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function JoinFamily() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || '';
      // Buscar familias por nombre o id
      const res = await axios.get(
        `${baseUrl}/api/families/search?q=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al buscar familias');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async familyId => {
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const res = await axios.post(
        `${baseUrl}/api/families/${familyId}/join-request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      // opcional: navegar después de solicitar
      // nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar solicitud');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Asociarse a una familia</h2>
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          placeholder="Introduce nombre o ID de familia"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border p-2 rounded-l-md"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-r-md"
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map(fam => (
            <li
              key={fam._id}
              className="flex justify-between items-center border rounded-lg p-3"
            >
              <div>
                <p className="font-medium">{fam.name}</p>
                <p className="text-sm text-gray-500">ID: {fam._id}</p>
              </div>
              <button
                onClick={() => handleJoin(fam._id)}
                className="px-3 py-1 bg-green-600 text-white rounded-md"
              >
                Unirme
              </button>
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && !loading && (
        <p className="text-gray-500">No se encontraron familias.</p>
      )}
    </div>
  );
}
