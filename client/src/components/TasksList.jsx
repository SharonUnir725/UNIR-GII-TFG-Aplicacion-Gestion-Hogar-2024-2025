// client/src/components/TasksList.jsx
// Manteniendo toda la lógica de estado y botones de estado, con overlay al abrir formularios

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskForm from './TaskForm';
import { notify } from '../utils/notify';

// Estados de las tareas
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
};
const STATUS_NEXT = {
  pendiente: 'en_progreso',
  en_progreso: 'completada',
  completada: 'pendiente',
};
const STATUS_BUTTON_LABEL = {
  pendiente: 'Comenzar',
  en_progreso: 'Completar',
  completada: 'Reabrir',
};

export default function TasksList() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState('');
  const [overlayActive, setOverlayActive] = useState(false);

  const [currentPageOpen, setCurrentPageOpen] = useState(1);
  const [currentPageCompleted, setCurrentPageCompleted] = useState(1);
  const tasksPerPage = 3;

  const apiBase = process.env.REACT_APP_API_URL || '';

  // cargar tareas
  useEffect(() => {
    if (!token) return;
    axios.get(`${apiBase}/api/tasks`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => {
        setTasks(res.data.tasks);
        setIsOwner(res.data.isOwner);
      })
      .catch(() => setError('Error cargando tareas.'));
  }, [apiBase, token]);

  // cargar familia
  useEffect(() => {
    if (!token || !user?.familyId) return;
    axios.get(`${apiBase}/api/families/${user.familyId}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setFamily(res.data))
      .catch(() => {});
  }, [apiBase, token, user?.familyId]);

  // cargar miembros
  useEffect(() => {
    if (!token || !user?.familyId) return;
    axios.get(`${apiBase}/api/users?familyId=${user.familyId}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setMembers(res.data))
      .catch(() => {});
  }, [apiBase, token, user?.familyId]);

  // cambiar estado
  const updateTaskStatus = async task => {
    const nextStatus = STATUS_NEXT[task.status];
    try {
      const res = await axios.put(`${apiBase}/api/tasks/${task._id}`, { status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } });
      const updated = res.data;
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelectedTask(updated);
      if (updated.status === 'completada' && family?.owner) {
        notify({ type: 'task_completed', taskId: updated._id, recipients: [family.owner], payload: { message: `La tarea "${updated.title}" ha sido completada.` } });
      }
    } catch {
      setError('Error actualizando estado.');
    }
  };

  const handleCreated = newTask => {
    setTasks(prev => [newTask, ...prev]);
    setShowForm(false);
    setOverlayActive(false);
  };

  const handleUpdated = updatedTask => {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    if (selectedTask?._id === updatedTask._id) setSelectedTask(updatedTask);
    setEditingTask(null);
    setShowForm(false);
    setOverlayActive(false);
  };

  const openTasks = tasks.filter(t => t.status !== 'completada');
  const completedTasks = tasks.filter(t => t.status === 'completada');

  const totalPagesOpen = Math.ceil(openTasks.length / tasksPerPage);
  const currentOpen = openTasks.slice((currentPageOpen - 1) * tasksPerPage, currentPageOpen * tasksPerPage);

  const totalPagesCompleted = Math.ceil(completedTasks.length / tasksPerPage);
  const currentCompleted = completedTasks.slice((currentPageCompleted - 1) * tasksPerPage, currentPageCompleted * tasksPerPage);

  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="p-4 relative">
      {overlayActive && <div className="fixed inset-0 bg-black opacity-50 z-40"></div>}
      {(showForm || editingTask) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <TaskForm
            members={members}
            task={editingTask}
            onCancel={() => { setShowForm(false); setEditingTask(null); setOverlayActive(false); }}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
          />
        </div>
      )}

      {!showForm && !editingTask && (
        <>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {isOwner && (
            <button onClick={() => { setShowForm(true); setOverlayActive(true); }} className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Añadir tarea</button>
          )}

          {/* Lista de tareas abiertas */}
          <h2 className="text-lg font-bold mb-2">Tareas Abiertas</h2>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {currentOpen.map(task => (
              <div key={task._id} className="border rounded p-2 hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedTask(task)}>
                <div className="font-semibold">{task.title}</div>
                <div className="text-sm text-gray-600">Prioridad: {capitalize(task.priority)} - Estado: {STATUS_LABELS[task.status]}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-6">
            <button disabled={currentPageOpen===1} onClick={()=>setCurrentPageOpen(p=>p-1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Anterior</button>
            <button disabled={currentPageOpen===totalPagesOpen} onClick={()=>setCurrentPageOpen(p=>p+1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Siguiente</button>
          </div>

          {/* Lista de tareas completadas */}
          <h2 className="text-lg font-bold mb-2">Tareas Completadas</h2>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {currentCompleted.map(task => (
              <div key={task._id} className="border rounded p-2 hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedTask(task)}>
                <div className="font-semibold">{task.title}</div>
                <div className="text-sm text-gray-600">Prioridad: {capitalize(task.priority)} - Estado: {STATUS_LABELS[task.status]}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button disabled={currentPageCompleted===1} onClick={()=>setCurrentPageCompleted(p=>p-1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Anterior</button>
            <button disabled={currentPageCompleted===totalPagesCompleted} onClick={()=>setCurrentPageCompleted(p=>p+1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Siguiente</button>
          </div>

          {/* Detalle de tarea seleccionada */}
          {selectedTask && (
            <div className="mt-6 bg-white border rounded-lg shadow p-6 space-y-4">
              <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
              <p className="text-sm text-gray-700 font-medium">Prioridad: {capitalize(selectedTask.priority)}</p>
              <p className="text-sm text-gray-700 font-medium">⏱️ Estado: {STATUS_LABELS[selectedTask.status]}</p>
              <p className="font-semibold">¿Qué se debe hacer?</p>
              <p className="text-gray-700">{selectedTask.description || '—'}</p>
              <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:space-x-4">
                {selectedTask.dueDate && <span>📅 Vence: {new Date(selectedTask.dueDate).toLocaleDateString()}</span>}
                <span>👥 Responsables: {selectedTask.assignedTo.length > 0 ? selectedTask.assignedTo.map(u => u.firstName).join(', ') : 'Sin asignar'}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {isOwner && (
                  <button onClick={() => { setEditingTask(selectedTask); setShowForm(true); setOverlayActive(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Modificar tarea</button>
                )}
                <button onClick={() => updateTaskStatus(selectedTask)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{STATUS_BUTTON_LABEL[selectedTask.status]}</button>
                <button onClick={() => setSelectedTask(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cerrar</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
