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
      {/* Mensaje de error */}
      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {/* Contenedor principal de la solicitud */}
      <div className="border rounded-lg p-4 bg-white shadow mb-4">
        <p className="text-gray-800">
          El usuario <strong>{userName}</strong> solicita unirse a la familia.
        </p>
      </div>

      {/* Acciones según estado */}
      {jrStatus === 'pendiente' && (
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => handleDecision('approve')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Aprobar
          </button>
          <button
            onClick={() => handleDecision('reject')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
          >
            Rechazar
          </button>
        </div>
      )}

      {jrStatus === 'aprobado' && (
        <div className="mt-4 border rounded-lg p-4 bg-green-50 shadow text-green-700">
          <p>Has aprobado la solicitud.</p>
        </div>
      )}

      {jrStatus === 'denegado' && (
        <div className="mt-4 border rounded-lg p-4 bg-red-50 shadow text-red-700">
          <p>Has rechazado la solicitud.</p>
        </div>
      )}
    </>
  );
}
