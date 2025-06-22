// client/src/components/EventForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddressForm from './AddressForm';

export default function EventForm({
  slot,
  event,         // objeto existente para edición (o undefined al crear)
  onCancel,
  onCreated,     // callback tras POST
  onUpdated      // callback tras PUT
}) {
  const { token, user } = useAuth();
  const apiBase = process.env.REACT_APP_API_URL || '';

  // Campos del formulario
  const [title, setTitle]                   = useState('');
  const [addressId, setAddressId]           = useState('');
  const [eventAddresses, setEventAddresses] = useState([]);
  const [participants, setParticipants]     = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [startDateTime, setStartDateTime]   = useState('');
  const [endDateTime, setEndDateTime]       = useState('');
  const [error, setError]                   = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const isEdit = Boolean(event);

  // Helper: formatea Date → "YYYY-MM-DDThh:mm"
  const toInputDateTime = dt => {
    const d = new Date(dt);
    const pad = n => n.toString().padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 1) Prefill: si editamos, usa `event`; si no, usa `slot`
  useEffect(() => {
    if (isEdit) {
      setTitle(event.title || '');
      setAddressId(event.locatedAt? event.locatedAt._id : '');
      setSelectedParticipants(event.participants?.map(u => u._id) || []);
      setStartDateTime(toInputDateTime(event.startDateTime));
      setEndDateTime(toInputDateTime(event.endDateTime));
    } else if (slot) {
      setTitle('');
      setAddressId('');
      setSelectedParticipants([]);
      setStartDateTime(toInputDateTime(slot.start));
      setEndDateTime(toInputDateTime(slot.end));
    }
  }, [isEdit, event, slot]);

  // 2) Carga direcciones y miembros
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    // direcciones de evento
    axios.get(`${apiBase}/api/address/event`, { headers })
      .then(res => setEventAddresses(res.data))
      .catch(() => {});
    // miembros de la familia
    axios.get(`${apiBase}/api/users?familyId=${user.familyId}`, { headers })
      .then(res => setParticipants(res.data))
      .catch(() => {});
  }, [token, apiBase, user.familyId]);

  const toggleParticipant = id => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 3) Tras guardar una nueva dirección
  const handleAddressSaved = newAddr => {
    const headers = { Authorization: `Bearer ${token}` };
    // recargar direcciones
    axios.get(`${apiBase}/api/address/event`, { headers })
      .then(res => setEventAddresses(res.data))
      .catch(() => {});
    // seleccionar la creada
    setAddressId(newAddr._id);
    setShowAddressForm(false);
  };

  // 4) Envío del formulario (POST o PUT)
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        title,
        startDateTime: new Date(startDateTime),
        endDateTime:   new Date(endDateTime),
        locatedAt:     addressId,
        participants:  selectedParticipants
      };
      let res;
      if (isEdit) {
        // PUT /api/events/:id
        res = await axios.put(
          `${apiBase}/api/events/${event._id}`,
          body,
          { headers }
        );
        onUpdated && onUpdated(res.data);
        // notificación de evento modificado
        await axios.post(
          `${apiBase}/api/notifications`,
          {
            type: 'modified_event',
            eventId: res.data._id,
            recipients: selectedParticipants,
            payload: {
              title: res.data.title,
              startDateTime: res.data.startDateTime,
              endDateTime: res.data.endDateTime,
              locatedAt: res.data.locatedAt,
              participants: res.data.participants
            }
          },
          { headers }
        );
      } else {
        // POST /api/events
        res = await axios.post(
          `${apiBase}/api/events`,
          body,
          { headers }
        );
        onCreated && onCreated(res.data);
        // notificación de nuevo evento
        await axios.post(
          `${apiBase}/api/notifications`,
          {
            type: 'new_event',
            eventId: res.data._id,
            recipients: selectedParticipants,
            payload: {
              title: res.data.title,
              startDateTime: res.data.startDateTime,
              endDateTime: res.data.endDateTime,
              locatedAt: res.data.locatedAt,
              participants: res.data.participants
            }
          },
          { headers }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (isEdit ? 'Error modificando evento' : 'Error creando evento')
      );
    }
  };

  // 5) Si estamos añadiendo dirección, renderizar AddressForm
  if (showAddressForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">
            Añadir dirección de evento
          </h3>
          <AddressForm
            apiEndpoint="/api/address/event"
            onSaved={handleAddressSaved}
            onCancel={() => setShowAddressForm(false)}
          />
        </div>
      </div>
    );
  }

  // 6) Formulario principal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full"
      >
        <h3 className="text-xl font-semibold mb-4">
          {isEdit ? 'Modificar Evento' : 'Nuevo Evento'}
        </h3>
        {error && <p className="text-red-600 mb-2">{error}</p>}

        {/* Título */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Ubicación */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Ubicación</label>
          <div className="flex space-x-2">
            <select
              value={addressId}
              onChange={e => setAddressId(e.target.value)}
              required
              className="flex-1 border p-2 rounded"
            >
              <option value="">-- Selecciona dirección --</option>
              {eventAddresses.map(addr => (
                <option key={addr._id} value={addr._id}>
                  {addr.street} {addr.number}, {addr.city}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAddressForm(true)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Añadir dirección
            </button>
          </div>
        </div>

        {/* Participantes */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Participantes</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
            {participants.map(u => (
              <label key={u._id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(u._id)}
                  onChange={() => toggleParticipant(u._id)}
                  className="mr-2"
                />
                {u.firstName}
              </label>
            ))}
          </div>
        </div>

        {/* Inicio */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Inicio</label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={e => setStartDateTime(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Fin */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Fin</label>
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={e => setEndDateTime(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEdit ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
