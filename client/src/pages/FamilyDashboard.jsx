// client/src/pages/FamilyDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavTabs     from '../components/NavTabs';
import AddressForm from '../components/AddressForm';
import MembersList from '../components/MembersList';
import TasksList from '../components/TasksList'
import CalendarView from '../components/CalendarView';

export default function FamilyDashboard() {
  const { token, user, loading } = useAuth();
  const [familyData, setFamilyData]     = useState(null);
  const [addressData, setAddressData]   = useState(null);
  const [activeTab, setActiveTab]       = useState('direccion');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError]               = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!token || !user?.familyId) return;
      try {
        const base = process.env.REACT_APP_API_URL || '';
        const resFam = await axios.get(
          `${base}/api/families/${user.familyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFamilyData(resFam.data);
        const resAddr = await axios.get(
          `${base}/api/address`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddressData(resAddr.data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos de la familia.');
      }
    }
    if (!loading) fetchData();
  }, [token, user, loading]);

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (!user)    return <Navigate to="/login" replace />;
  if (!user.familyId) return <Navigate to="/dashboard" replace />;

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!familyData) return <p className="p-4">Cargando datos de familia...</p>;

  return (
    <div className="flex h-full font-sans">
      <aside className="w-48 bg-gray-100 border-r p-4">
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      <main className="flex-1 p-6">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">{familyData.name}</h1>
          <p className="text-gray-700">Administrador: {familyData.ownerName}</p>
          <p className="text-gray-700">Miembros: {familyData.memberCount}</p>
        </header>

        {activeTab === 'direccion' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Dirección de la familia</h2>

            {/* Mostrar formulario si se solicitó */}
            {showAddressForm ? (
              <div className="max-w-md">
                <AddressForm
                  onSaved={(newAddr) => {
                    setAddressData(newAddr);
                    setShowAddressForm(false);
                  }}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>

            ) : addressData ? (
              <div className="p-4 border rounded bg-gray-50 space-y-2 max-w-lg">
                <p><strong>Calle:</strong> {addressData.street} {addressData.number}</p>
                <p><strong>Población:</strong> {addressData.postalCode} {addressData.city} {addressData.country}</p>
                {user._id === familyData.owner && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Modificar dirección
                  </button>
                )}
              </div>

            ) : user._id === familyData.owner ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Añadir dirección
              </button>

            ) : (
              <p>El administrador aún no ha ingresado la dirección.</p>
            )}
          </section>
        )}

        {activeTab === 'miembros' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Miembros de la familia</h2>
            <MembersList />
          </section>
        )}

        {activeTab === 'calendario' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Calendario Familiar</h2>
            <CalendarView />
          </section>
        )}

        {activeTab === 'tareas' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Lista de Tareas</h2>
            <TasksList />
          </section>
        )}
      </main>
      <button onClick={() => nav('/dashboard')} style={{ marginTop: '2rem' }}>
        ← Volver al Dashboard
      </button>
    </div>
  );
}
