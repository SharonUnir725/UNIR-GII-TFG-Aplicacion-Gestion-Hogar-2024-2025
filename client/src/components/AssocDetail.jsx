// client/src/components/AssocDetail.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Subcomponente para detalle de “join_request”.
 * Recibe:
 *   - notification: { family, payload: { requestId, userName } }
 * Implementa:
 *   - Carga el estado real de la solicitud desde /api/families/:family/join-requests
 *   - Si estado 'pendiente', muestra botones “Aprobar” / “Rechazar”
 *   - Si estado 'aprobado', muestra mensaje “Has aprobado la solicitud.”
 *   - Si estado 'denegado', muestra mensaje “Has rechazado la solicitud.”
 */
export default function AssocDetail({ notification }) {
  const [error, setError] = useState('');
  const { family, payload } = notification;
  const { requestId, userName } = payload;
  const [jrStatus, setJrStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener el estado actual de la solicitud de unión
    async function fetchJoinRequest() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `/api/families/${family}/join-requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Buscar la solicitud por ID
        // Comparar jr._id (ObjectId) convertido a string con requestId
        const match = res.data.find(jr => jr._id.toString() === requestId);
        if (match) {
          setJrStatus(match.status); // 'pendiente' | 'aprobado' | 'denegado'
        } else {
          setError('Solicitud no encontrada.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al obtener estado de la solicitud');
      } finally {
        setLoading(false);
      }
    }
    fetchJoinRequest();
  }, [family, requestId]);

  // Handle: aprobar / rechazar
  const handleDecision = async (action) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/families/${family}/join-requests/${requestId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Actualizar estado local para reflejar cambio
      setJrStatus(action === 'approve' ? 'aprobado' : 'denegado');
    } catch (err) {
      const backendMsg = err.response?.data?.error;
      setError(backendMsg || 'Error al procesar la solicitud');
    }
  };

  if (loading) return <p>Cargando datos de la solicitud…</p>;

  return (
    <>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <p>
          El usuario <strong>{userName}</strong> solicita unirse a la familia.
        </p>
      </div>

      {jrStatus === 'pendiente' && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => handleDecision('approve')}
            style={{ marginRight: 8 }}
          >
            Aprobar
          </button>
          <button onClick={() => handleDecision('reject')}>Rechazar</button>
        </div>
      )}

      {jrStatus === 'aprobado' && (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <p>Has aprobado la solicitud.</p>
        </div>
      )}

      {jrStatus === 'denegado' && (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <p>Has rechazado la solicitud.</p>
        </div>
      )}
    </>
  );
}
