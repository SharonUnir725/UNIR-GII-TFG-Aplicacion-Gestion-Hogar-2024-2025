// client/src/components/EventForm.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import AddressForm from './AddressForm'

export default function EventForm({ slot, onCancel, onCreated }) {
  const { token, user } = useAuth()
  const apiBase = process.env.REACT_APP_API_URL || ''

  // Datos del evento
  const [title, setTitle]                   = useState('')
  const [addressId, setAddressId]           = useState('')
  const [eventAddresses, setEventAddresses] = useState([])
  const [participants, setParticipants]     = useState([])
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [startDateTime, setStartDateTime]   = useState('')
  const [endDateTime, setEndDateTime]       = useState('')
  const [error, setError]                   = useState('')

  // Mostrar/ocultar subformulario de dirección de evento
  const [showAddressForm, setShowAddressForm] = useState(false)

  // Helper para formatear fecha/hora a input
  const toInputDateTime = dt => {
    const pad = n => n.toString().padStart(2, '0')
    const d = new Date(dt)
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  // 1) Pre‐llenar fechas al abrir
  useEffect(() => {
    setStartDateTime(toInputDateTime(slot.start))
    setEndDateTime(toInputDateTime(slot.end))
  }, [slot])

  // 2) Cargar direcciones y miembros
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }

    // Direcciones de evento
    axios.get(`${apiBase}/api/address/event`, { headers })
      .then(res => setEventAddresses(res.data))
      .catch(() => {})

    // Miembros de la familia
    axios.get(`${apiBase}/api/users?familyId=${user.familyId}`, { headers })
      .then(res => setParticipants(res.data))
      .catch(() => {})
  }, [token, apiBase, user.familyId])

  const toggleParticipant = id => {
    setSelectedParticipants(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  // 3) Crear evento
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const body = {
        title,
        startDateTime: new Date(startDateTime),
        endDateTime:   new Date(endDateTime),
        locatedAt:     addressId,
        participants:  selectedParticipants
      }
      const res = await axios.post(
        `${apiBase}/api/events`,
        body,
        { headers }
      )
      onCreated(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error creando evento')
    }
  }

  // 4) Tras guardar nueva dirección de evento
  const handleAddressSaved = newAddr => {
    const headers = { Authorization: `Bearer ${token}` }
    axios.get(`${apiBase}/api/address/event`, { headers })
      .then(res => setEventAddresses(res.data))
      .catch(() => {})
    setAddressId(newAddr._id)
    setShowAddressForm(false)
  }

  // 5) Si añadimos dirección, renderizamos AddressForm sólo para evento
  if (showAddressForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">Añadir dirección de evento</h3>
          <AddressForm
            apiEndpoint="/api/address/event"    // ← aquí usamos la ruta de eventos
            onSaved={handleAddressSaved}
            onCancel={() => setShowAddressForm(false)}
          />
        </div>
      </div>
    )
  }

  // 6) Formulario normal de evento
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Nuevo Evento</h3>
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
          <label className="block font-medium mb-1">Participantes: </label>
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
            Crear
          </button>
        </div>
      </form>
    </div>
  )
}
