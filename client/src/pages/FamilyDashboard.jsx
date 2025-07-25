// client/src/pages/FamilyDashboard.jsx
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NavTabs from '../components/NavTabs';
import AddressForm from '../components/AddressForm';
import MembersList from '../components/MembersList';
import TasksList from '../components/TasksList';
import CalendarView from '../components/CalendarView';

export default function FamilyDashboard() {
  const { token, user, loading } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [activeTab, setActiveTab] = useState('direccion');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!token || !user?.familyId) return;
      try {
        const base = process.env.REACT_APP_API_URL || '';
        const resFam = await axios.get(`${base}/api/families/${user.familyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFamilyData(resFam.data);

        const resAddr = await axios.get(`${base}/api/address`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddressData(resAddr.data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos de la familia.');
      }
    }
    if (!loading) fetchData();
  }, [token, user, loading]);

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.familyId) return <Navigate to="/dashboard" replace />;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!familyData) return <p className="p-4">Cargando datos de familia...</p>;

  return (
  <div className="flex flex-col h-full font-sans">
    {/* Cabecera */}
    <header className="bg-gradient-to-r from-gray-200 to-white p-6 flex flex-col md:flex-row md:items-center md:justify-between text-gray-800 shadow">
      <div>
        <h1 className="text-3xl font-bold mb-1">👨‍👩‍👧‍👦 Familia {familyData.name}</h1>
        <p className="text-sm opacity-90">Administrador: {familyData.ownerName}</p>
        <p className="text-sm opacity-90">Miembros: {familyData.memberCount}</p>
      </div>
      <button
        onClick={() => nav('/dashboard')}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        ← Volver al Dashboard
      </button>
    </header>

    <div className="flex flex-1 bg-gray-50">
      {/* Tabs lateral */}
      <aside className="w-60 bg-white border-r p-4 shadow-sm">
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'direccion' && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">📍 Dirección de la familia</h2>

            {showAddressForm ? (
              <div className="max-w-lg">
                <AddressForm
                  onSaved={(newAddr) => {
                    setAddressData(newAddr);
                    setShowAddressForm(false);
                  }}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>
            ) : addressData ? (
              <div className="p-6 border rounded-lg bg-white shadow max-w-xl space-y-3">
                <p className="text-gray-700">
                  <strong>Calle:</strong> {addressData.street} {addressData.number}
                </p>
                <p className="text-gray-700">
                  <strong>Población:</strong> {addressData.postalCode} {addressData.city} {addressData.country}
                </p>
                {user._id === familyData.owner && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
                  >
                    ✏️ Modificar dirección
                  </button>
                )}
              </div>
            ) : user._id === familyData.owner ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                ➕ Añadir dirección
              </button>
            ) : (
              <p className="text-gray-600">El administrador aún no ha ingresado la dirección.</p>
            )}
          </section>
        )}

        {activeTab === 'miembros' && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">👥 Miembros de la familia</h2>
            <MembersList />
          </section>
        )}

        {activeTab === 'calendario' && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">🗓️ Calendario Familiar</h2>
            <CalendarView />
          </section>
        )}

        {activeTab === 'tareas' && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">📝 Lista de Tareas</h2>
            <TasksList />
          </section>
        )}
      </main>
    </div>
  </div>
);

}
