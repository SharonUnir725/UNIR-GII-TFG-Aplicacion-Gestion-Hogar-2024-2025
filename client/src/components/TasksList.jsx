// client/src/components/TasksList.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import TaskForm from './TaskForm'
import { notify } from '../utils/notify'

// Mapas de estado y acciones siguientes
const STATUS_LABELS = {
  pendiente:   'Pendiente',
  en_progreso: 'En progreso',
  completada:  'Completada',
}
const STATUS_NEXT = {
  pendiente:   'en_progreso',
  en_progreso: 'completada',
  completada:  'pendiente',
}
const STATUS_BUTTON_LABEL = {
  pendiente:   'Comenzar',
  en_progreso: 'Completar',
  completada:  'Reabrir',
}

export default function TasksList() {
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [family, setFamily] = useState(null)
  const [members, setMembers] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [error, setError] = useState('')
  const apiBase = process.env.REACT_APP_API_URL || ''

  // 1) Cargar tareas y determinar si el usuario es owner
  useEffect(() => {
    if (!token) return
    axios.get(`${apiBase}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setTasks(res.data.tasks)
      setIsOwner(res.data.isOwner)
    })
    .catch(() => setError('Error cargando tareas.'))
  }, [apiBase, token])

  // 2) Cargar documento de familia (para owner)
  useEffect(() => {
    if (!token || !user?.familyId) return
    axios.get(`${apiBase}/api/families/${user.familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setFamily(res.data))
    .catch(() => {})
  }, [apiBase, token, user?.familyId])

  // 3) Cargar miembros para TaskForm
  useEffect(() => {
    if (!token || !user?.familyId) return
    axios.get(`${apiBase}/api/users?familyId=${user.familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMembers(res.data))
    .catch(() => {})
  }, [apiBase, token, user?.familyId])

  // 4) Cambiar estado de tarea; solo notificar al completarse
  const updateTaskStatus = async task => {
    const nextStatus = STATUS_NEXT[task.status]
    try {
      const res = await axios.put(
        `${apiBase}/api/tasks/${task._id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updated = res.data
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t))
      setSelectedTask(updated)
      if (updated.status === 'completada' && family?.owner) {
        notify({
          type: 'task_completed',
          taskId: updated._id,
          recipients: [family.owner],
          payload: { message: `La tarea "${updated.title}" ha sido completada.` }
        })
      }
    } catch {
      setError('Error actualizando estado.')
    }
  }

  // 5) Handlers de creación y edición (solo owner)
  const handleCreated = newTask => {
    setTasks(prev => [newTask, ...prev])
    setShowForm(false)
  }
  const handleUpdated = updatedTask => {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t))
    if (selectedTask?._id === updatedTask._id) setSelectedTask(updatedTask)
    setEditingTask(null)
    setShowForm(false)
  }

  // 6) Separar tareas abiertas y completadas
  const openTasks = tasks.filter(t => t.status !== 'completada')
  const completedTasks = tasks.filter(t => t.status === 'completada')

  // Util para capitalizar texto
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="p-4">
      {isOwner && (showForm || editingTask) && (
        <TaskForm
          members={members}
          task={editingTask}
          onCancel={() => { setShowForm(false); setEditingTask(null) }}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
        />
      )}
      {!showForm && !editingTask && (
        <>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {isOwner && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >Añadir tarea</button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-2">Tareas Abiertas</h3>
              {openTasks.length === 0 ? (
                <p className="text-gray-600">No hay tareas pendientes.</p>
              ) : (
                <ul className="space-y-1">
                  {openTasks.map(task => (
                    <li
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="cursor-pointer p-2 border rounded hover:bg-gray-100"
                    >
                      <strong className="font-medium">{task.title} </strong>
                      <span className="ml-2 text-sm text-gray-500">
                        Prioridad: {capitalize(task.priority)} - Estado: {STATUS_LABELS[task.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="text-lg font-semibold mt-6 mb-2">Tareas Completadas</h3>
              {completedTasks.length === 0 ? (
                <p className="text-gray-600">No hay tareas completadas.</p>
              ) : (
                <ul className="space-y-1">
                  {completedTasks.map(task => (
                    <li
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="cursor-pointer p-2 border rounded hover:bg-gray-100"
                    >
                      <span className="font-medium">{task.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="md:col-span-2">
              {selectedTask ? (
                <div className="bg-white border rounded-lg shadow p-6 space-y-4">
                  <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                  <p className="text-sm text-gray-700 font-medium">Prioridad: {capitalize(selectedTask.priority)}</p>
                  <p className="text-sm text-gray-700 font-medium">⏱️ Estado: {STATUS_LABELS[selectedTask.status]}</p>
                  <p><strong>¿Qué se debe hacer?</strong></p>
                  <p className="text-gray-700">{selectedTask.description || '—'}</p>
                  <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:space-x-4">
                    {selectedTask.dueDate && <span>📅 Vence: {new Date(selectedTask.dueDate).toLocaleDateString()}</span>}
                    <span>👥 Responsables: {selectedTask.assignedTo.length > 0 ? selectedTask.assignedTo.map(u => u.firstName).join(', ') : 'Sin asignar'}</span>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    {isOwner && (
                      <button
                        onClick={() => { setEditingTask(selectedTask); setShowForm(true) }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >Modificar tarea</button>
                    )}
                    <button
                      onClick={() => updateTaskStatus(selectedTask)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >{STATUS_BUTTON_LABEL[selectedTask.status]}</button>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >Cerrar</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Selecciona una tarea para ver detalles.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
