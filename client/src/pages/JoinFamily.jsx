// client/src/pages/JoinFamily.jsx
import React, { useState } from 'react';
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

      // Opcional: desactivar botón o refetch de lista
      // setFamilies(families.filter(f => f._id !== familyId));
    } catch (err) {
      console.error('Join error:', err.response ?? err);
      const backendMsg = err.response?.data?.error;
      setError(backendMsg || `Error al enviar la solicitud (${err.response?.status})`);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Asociarse a una familia</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Nombre o ID de familia"
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
        />
        <button type="submit" style={{ marginLeft: 8 }}>Buscar</button>
      </form>

      {error   && <p style={{ color: 'red'   }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {families.map(fam => (
          <li key={fam._id} style={{ margin: '1rem 0' }}>
            <strong>{fam.name}</strong><br/>
            ID: {fam._id}<br/>
            <button
              onClick={() => handleJoin(fam._id)}
              disabled={success}
              style={{ marginTop: 4 }}
            >
              Unirme
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => nav('/dashboard')} style={{ marginTop: '2rem' }}>
        ← Volver al Dashboard
      </button>
    </div>
  );
}
