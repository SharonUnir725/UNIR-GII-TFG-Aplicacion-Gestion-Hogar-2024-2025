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

      setSuccess(`Family "${family.name}" created (ID: ${family._id})`);
      // redirigir al detalle de familia (Después de crear la familia) - en progreso
      // nav(`/families/${family._id}`);
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
      <button onClick={() => nav('/dashboard')} style={{ marginTop: '2rem' }}>
        ← Volver al Dashboard
      </button>
    </div>
  );
}
