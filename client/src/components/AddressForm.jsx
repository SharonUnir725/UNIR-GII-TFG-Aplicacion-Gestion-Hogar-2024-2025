// client/src/components/AddressForm.jsx
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function AddressForm({
  onSaved,
  onCancel,
  apiEndpoint = '/api/address'   // ← endpoint dinámico (por defecto la dirección de la familia)
}) {
  const { token } = useAuth()
  const apiBase = process.env.REACT_APP_API_URL || ''

  const [street, setStreet]         = useState('')
  const [number, setNumber]         = useState('')
  const [block, setBlock]           = useState('')
  const [staircase, setStaircase]   = useState('')
  const [floor, setFloor]           = useState('')
  const [door, setDoor]             = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity]             = useState('')
  const [province, setProvince]     = useState('')
  const [country, setCountry]       = useState('')
  const [error, setError]           = useState(null)
  const [loading, setLoading]       = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    // Validación básica
    if (!street || !number || !postalCode || !city || !province || !country) {
      setError('Por favor completa todos los campos obligatorios (*)')
      return
    }

    const payload = {
      street, number, block, staircase, floor, door,
      postalCode, city, province, country
    }

    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      const res = await axios.post(
        `${apiBase}${apiEndpoint}`,  // ← usa el endpoint que le pases
        payload,
        { headers }
      )
      onSaved(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al guardar la dirección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block font-medium">Calle *</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={street}
          onChange={e => setStreet(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Número *</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={number}
          onChange={e => setNumber(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Bloque</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={block}
          onChange={e => setBlock(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Escalera</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={staircase}
          onChange={e => setStaircase(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Piso</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={floor}
          onChange={e => setFloor(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Puerta</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={door}
          onChange={e => setDoor(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Código Postal *</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={postalCode}
          onChange={e => setPostalCode(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Localidad *</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Provincia *</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={province}
          onChange={e => setProvince(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">País *</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={country}
          onChange={e => setCountry(e.target.value)}
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Guardando…' : 'Guardar Dirección'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
)
}
