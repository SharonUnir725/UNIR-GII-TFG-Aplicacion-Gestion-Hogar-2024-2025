// client/src/components/EventForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddressForm from './AddressForm';
import AddressSelector from './AddressSelector';
import ParticipantsSelector from './ParticipantsSelector';
import { notify } from '../utils/notify';

export default function EventForm({
  slot,
  event,
  onCancel,
  onCreated,
  onUpdated
}) {
  const { token, user } = useAuth();
  const apiBase = process.env.REACT_APP_API_URL || '';

  const [title, setTitle] = useState('');
  const [addressId, setAddressId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [error, setError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const isEdit = Boolean(event);

  const toInputDateTime = dt => {
    const d = new Date(dt);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (isEdit) {
      setTitle(event.title || '');
      setAddressId(event.locatedAt && typeof event.locatedAt === 'object'
        ? event.locatedAt._id
        : event.locatedAt || '');
      setSelectedMembers(
        Array.isArray(event.participants)
          ? event.participants.map(u => u._id || u)
          :  []
      );
      setStartDateTime(toInputDateTime(event.startDateTime));
      setEndDateTime(toInputDateTime(event.endDateTime));
    } else if (slot) {
      setTitle('');
      setAddressId('');
      setSelectedMembers([]);
      const start = new Date(slot.start);
      const sameDayEnd = new Date(start);
      sameDayEnd.setHours(start.getHours() + 1);
      setStartDateTime(toInputDateTime(start));
      setEndDateTime(toInputDateTime(sameDayEnd));
    }
  }, [isEdit, event, slot]);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${apiBase}/api/address/event`, { headers })
      .then(res => setAddresses(res.data))
      .catch(() => {});
    axios.get(`${apiBase}/api/users?familyId=${user.familyId}`, { headers })
      .then(res => setMembers(res.data))
      .catch(() => {});
  }, [token, apiBase, user.familyId]);

  const handleAddressSaved = newAddr => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${apiBase}/api/address/event`, { headers })
      .then(res => setAddresses(res.data))
      .catch(() => {});
    setAddressId(newAddr._id);
    setShowAddressForm(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        title,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        locatedAt: addressId,
        participants: selectedMembers
      };
      let res;
      if (isEdit) {
        res = await axios.put(`${apiBase}/api/events/${event._id}`, body, { headers });
        onUpdated && onUpdated(res.data);
        await notify({
          type: 'modified_event',
          eventId: res.data._id,
          recipients: selectedMembers,
          payload: res.data
        });
      } else {
        res = await axios.post(`${apiBase}/api/events`, body, { headers });
        onCreated && onCreated(res.data);
        await notify({
          type: 'new_event',
          eventId: res.data._id,
          recipients: selectedMembers,
          payload: res.data
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (isEdit ? 'Error modificando evento' : 'Error creando evento')
      );
    }
  };

  if (showAddressForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">Añadir dirección de evento</h3>
          <AddressForm
            apiEndpoint="/api/address/event"
            onSaved={handleAddressSaved}
            onCancel={() => setShowAddressForm(false)}
          />
        </div>
      </div>
    );
  }

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
        <AddressSelector
          addresses={addresses}
          value={addressId}
          onChange={setAddressId}
          onAddNew={() => setShowAddressForm(true)}
        />

        {/* Participantes */}
        <ParticipantsSelector
          members={members}
          selected={selectedMembers}
          onChange={setSelectedMembers}
        />

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
