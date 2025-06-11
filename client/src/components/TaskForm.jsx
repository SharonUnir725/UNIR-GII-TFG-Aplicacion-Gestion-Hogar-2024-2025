// client/src/components/TaskForm.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

// Formulario para crear o editar tareas
export default function TaskForm({ members, task, onCancel, onCreated, onUpdated }) {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('media')
  const [assignedTo, setAssignedTo] = useState([])
  const [error, setError] = useState('')

  const apiBase = process.env.REACT_APP_API_URL || ''
  const headers = { Authorization: `Bearer ${token}` }

  // Inicializar campos cuando cambie "task"
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
      setPriority(task.priority || 'media')
      // assignedTo puede ser array de objetos o ids
      const arr = Array.isArray(task.assignedTo)
        ? task.assignedTo.map(u => u._id || u)
        : []
      setAssignedTo(arr)
    } else {
      // formulario vacío al crear
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('media')
      setAssignedTo([])
    }
  }, [task])

  const toggleAssign = (userId) => {
    setAssignedTo(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      let savedTask
      const body = { title, description, dueDate, priority, assignedTo }
      if (task) {
        // editar
        const res = await axios.put(
          `${apiBase}/api/tasks/${task._id}`,
          body,
          { headers }
        )
        savedTask = res.data
        onUpdated && onUpdated(savedTask)
      } else {
        // crear
        const res = await axios.post(
          `${apiBase}/api/tasks`,
          body,
          { headers }
        )
        savedTask = res.data
        // crear notificación, no bloquear error
        try {
          await axios.post(
            `${apiBase}/api/notifications`,
            {
              type: 'tarea',
              taskId: savedTask._id,
              recipients: assignedTo
            },
            { headers }
          )
        } catch {
          // omitimos error de notificaciones
        }
        onCreated && onCreated(savedTask)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error guardando tarea.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border rounded shadow max-w-lg">
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="mb-3">
        <label className="block mb-1 font-medium">Título</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">¿Qué se debe hacer?</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block mb-1 font-medium">Fecha límite</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Prioridad</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <p className="block mb-1 font-medium">Responsables</p>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border p-2 rounded">
          {members.map(m => (
            <label key={m._id} className="flex items-center">
              <input
                type="checkbox"
                checked={assignedTo.includes(m._id)}
                onChange={() => toggleAssign(m._id)}
                className="mr-2"
              />
              <span>{m.firstName} {m.lastName1}</span>
            </label>
          ))}
        </div>
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
          {task ? 'Guardar cambios' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
