// client/src/components/TaskForm.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import useMembers from '../hooks/useMembers'
import ParticipantsSelector from '../components/ParticipantsSelector'
import { notify } from '../utils/notify'

export default function TaskForm({ task, onCancel, onCreated, onUpdated }) {
  const { token } = useAuth()
  const apiBase = process.env.REACT_APP_API_URL || ''
  const members = useMembers()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('media')
  const [assignedTo, setAssignedTo] = useState([])
  const [error, setError] = useState('')

  const isEdit = Boolean(task)

  useEffect(() => {
    if (isEdit) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
      setPriority(task.priority || 'media')
      setAssignedTo(
        Array.isArray(task.assignedTo)
          ? task.assignedTo.map(u => u._id || u)
          : []
      )
    } else {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('media')
      setAssignedTo([])
    }
  }, [isEdit, task])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const headers = { Authorization: `Bearer ${token}` }
    const body = { title, description, dueDate, priority, assignedTo }

    try {
      let res
      if (isEdit) {
        res = await axios.put(
          `${apiBase}/api/tasks/${task._id}`,
          body,
          { headers }
        )
        onUpdated?.(res.data)
        notify({
          type: 'modified_task',
          taskId: res.data._id,
          recipients: assignedTo,
          payload: {
            title: res.data.title,
            description: res.data.description,
            dueDate: res.data.dueDate,
            priority: res.data.priority,
            status: res.data.status
          }
        })
      } else {
        res = await axios.post(
          `${apiBase}/api/tasks`,
          body,
          { headers }
        )
        onCreated?.(res.data)
        notify({
          type: 'new_task',
          taskId: res.data._id,
          recipients: assignedTo,
          payload: {
            title: res.data.title,
            description: res.data.description,
            dueDate: res.data.dueDate,
            priority: res.data.priority,
            status: res.data.status
          }
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la tarea')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full"
      >
        <h3 className="text-xl font-semibold mb-4">
          {isEdit ? 'Modificar Tarea' : 'Nueva Tarea'}
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

        <div className="mb-3">
          <label className="block font-medium mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Fecha límite</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Prioridad</label>
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

        {/* Participantes */}
        <ParticipantsSelector
          members={members}
          selected={assignedTo}
          onChange={setAssignedTo}
        />


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
            {isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}
