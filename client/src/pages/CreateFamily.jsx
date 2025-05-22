// client/src/pages/CreateFamily.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function CreateFamily() {
  const [name, setName]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      // Coge el token del localStorage
      const token = localStorage.getItem('token');
      const res   = await axios.post(
        '/api/families',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Family "${res.data.name}" created (ID: ${res.data._id})`);
      // redirigir al detalle de familia
      //nav(`/families/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la familia');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Create Family</h2>
      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Family name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button type="submit" style={{ marginTop: '1rem' }}>
          Create
        </button>
      </form>
    </div>
  );
}
