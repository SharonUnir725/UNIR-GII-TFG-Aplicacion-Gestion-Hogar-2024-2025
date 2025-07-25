// client/src/components/TasksList.jsx
// Manteniendo toda la lógica de estado y botones de estado, con overlay al abrir formularios

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskForm from './TaskForm';
import { notify } from '../utils/notify';

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

  useEffect(() => {
    if (!token) return;
    axios.get(`${apiBase}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setTasks(res.data.tasks);
        setIsOwner(res.data.isOwner);
      })
      .catch(() => setError('Error cargando tareas.'));
  }, [apiBase, token]);

  useEffect(() => {
    if (!token || !user?.familyId) return;
    axios.get(`${apiBase}/api/families/${user.familyId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setFamily(res.data))
      .catch(() => {});
  }, [apiBase, token, user?.familyId]);

  useEffect(() => {
    if (!token || !user?.familyId) return;
    axios.get(`${apiBase}/api/users?familyId=${user.familyId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setMembers(res.data))
      .catch(() => {});
  }, [apiBase, token, user?.familyId]);

  const updateTaskStatus = async task => {
    const nextStatus = STATUS_NEXT[task.status];
    try {
      const res = await axios.put(`${apiBase}/api/tasks/${task._id}`, { status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } });
      const updated = res.data;
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelectedTask(updated);
      if (updated.status === 'completada' && family?.owner) {
        notify({ type: 'task_completed', taskId: updated._id, recipients: [family.owner], payload: { message: `🥳 La tarea "${updated.title}" ha sido completada.` } });
      }
    } catch {
      setError('Error actualizando estado.');
    }
  };

  const deleteTask = async (taskId) => {
    if (!token) return;
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar esta tarea?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`${apiBase}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setSelectedTask(null);
    } catch (err) {
      setError('Error eliminando la tarea.');
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
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
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
          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          {isOwner && (
            <div className="text-center mb-6">
              <button
                onClick={() => { setShowForm(true); setOverlayActive(true); }}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
              >
                ➕ Añadir tarea
              </button>
            </div>
          )}

          <section className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Tareas Abiertas</h3>
            {openTasks.length === 0 ? (
              <p className="text-gray-600 text-center">No hay tareas abiertas.</p>
            ) : (
              <>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {currentOpen.map(task => (
                    <li
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition duration-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-gray-600">Prioridad: {capitalize(task.priority)} — Estado: {STATUS_LABELS[task.status]}</p>
                      {task.assignedTo?.length > 0 && (
                        <p className="text-sm text-gray-500">👥 {task.assignedTo.map(u => u.firstName).join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                  <button
                    onClick={() => setCurrentPageOpen(p => Math.max(p - 1, 1))}
                    disabled={currentPageOpen === 1}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      currentPageOpen === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    ← Anterior
                  </button>
                  <p className="text-gray-700">
                    Página <span className="font-semibold">{currentPageOpen}</span> de <span className="font-semibold">{totalPagesOpen}</span>
                  </p>
                  <button
                    onClick={() => setCurrentPageOpen(p => Math.min(p + 1, totalPagesOpen))}
                    disabled={currentPageOpen === totalPagesOpen || totalPagesOpen === 0}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      currentPageOpen === totalPagesOpen || totalPagesOpen === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </>
            )}
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Tareas Completadas</h3>
            {completedTasks.length === 0 ? (
              <p className="text-gray-600 text-center">No hay tareas completadas.</p>
            ) : (
              <>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {currentCompleted.map(task => (
                    <li
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition duration-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <p className="font-semibold">{task.title}</p>
                      {task.assignedTo?.length > 0 && (
                        <p className="text-sm text-gray-500">👥 {task.assignedTo.map(u => u.firstName).join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                  <button
                    onClick={() => setCurrentPageCompleted(p => Math.max(p - 1, 1))}
                    disabled={currentPageCompleted === 1}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      currentPageCompleted === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    ← Anterior
                  </button>
                  <p className="text-gray-700">
                    Página <span className="font-semibold">{currentPageCompleted}</span> de <span className="font-semibold">{totalPagesCompleted}</span>
                  </p>
                  <button
                    onClick={() => setCurrentPageCompleted(p => Math.min(p + 1, totalPagesCompleted))}
                    disabled={currentPageCompleted === totalPagesCompleted || totalPagesCompleted === 0}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      currentPageCompleted === totalPagesCompleted || totalPagesCompleted === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </>
            )}
          </section>

          {selectedTask && (
            <div className="mt-8 bg-gray-50 border rounded-lg shadow p-6 space-y-4">
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
                  <button onClick={() => { setEditingTask(selectedTask); setShowForm(true); setOverlayActive(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Modificar</button>
                )}
                <button onClick={() => updateTaskStatus(selectedTask)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{STATUS_BUTTON_LABEL[selectedTask.status]}</button>
                <button onClick={() => setSelectedTask(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cerrar</button>
                {isOwner && (
                  <button onClick={() => deleteTask(selectedTask._id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
