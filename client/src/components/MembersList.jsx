// client/src/components/MembersList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MembersList() {
  const { token, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchMembers() {
      if (!token || !user.familyId) return;
      try {
        // GET /api/users?familyId=... devuelve el array de usuarios
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const res = await axios.get(
          `${baseUrl}/api/users?familyId=${user.familyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMembers(res.data); 
      } catch (err) {
        console.error('Error al cargar miembros de familia:', err);
        setError('No se pudo cargar la lista de miembros.');
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [token, user.familyId]);

  if (loading) {
    return <p className="p-4 font-sans">Cargando miembros…</p>;
  }
  if (error) {
    return <p className="p-4 font-sans text-red-600">{error}</p>;
  }

  if (!members.length) {
    return <p className="p-4 font-sans">No hay miembros en esta familia.</p>;
  }

  return (
    <div className="overflow-auto max-w-lg">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="px-4 py-2 border">Nombre completo</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Rol</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                {m.firstName} {m.lastName1} {m.lastName2}
              </td>
              <td className="px-4 py-2 border">{m.email}</td>
              <td className="px-4 py-2 border">{m.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
