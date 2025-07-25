import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const {user, setUser} = useAuth({
    profileImage: '',
    firstName: '',
    lastName1: '',
    lastName2: '',
    email: '',
    role: '',
    phone: '',
    birthDate: '',
    gender: '',
    createdAt: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async res => {
        if (!res.ok) return;
        const data = await res.json();
        setUser(prev => ({
          ...prev,
          firstName: data.firstName || '',
          lastName1: data.lastName1 || '',
          lastName2: data.lastName2 || '',
          email: data.email || '',
          role: data.role || '',
          phone: data.phone || '',
          birthDate: data.birthDate ? data.birthDate.substring(0, 10) : '',
          gender: data.gender || '',
          profileImage: data.profileImage || '',
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ''
        }));
      })
      .catch(err => {
        console.error('Error al cargar perfil:', err);
        toast.error('Error al cargar el perfil.');
      });
  }, [setUser]);

  // Actualiza valores de campos
  const handleChange = e => {
    setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Maneja cambios de imagen
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUser(prev => ({ ...prev, profileImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Guarda los cambios en el perfil
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName1: user.lastName1,
          lastName2: user.lastName2,
          phone: user.phone,
          birthDate: user.birthDate,
          gender: user.gender,
          profileImage: user.profileImage
        })
      });
      if (res.ok) {
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.error('Error al actualizar el perfil');
      }
    } catch {
      toast.error('Error de conexión al guardar perfil');
    }
  };

  // Cambiar la contraseña
  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) {
        toast.success('Contraseña actualizada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordForm(false);
      } else {
        toast.error('Error al cambiar contraseña');
      }
    } catch {
      toast.error('Error de conexión al cambiar contraseña');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Perfil de Usuario</h1>

      {/* Imagen de perfil */}
      <div className="flex flex-col items-center mb-8">
        {/* Foto de perfil o avatar genérico */}
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-gray-400"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 mb-3 border-4 border-gray-400" />
        )}

        {/* Controles para gestionar la imagen */}
        <div className="flex flex-col items-center space-y-3">
          {/* Subir nueva imagen */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm"
          />

          {/* Botón para borrar la foto de perfil */}
          {user.profileImage && (
            <button
              type="button"
              onClick={() =>
                setUser(prev => ({ ...prev, profileImage: '' }))
              }
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Borrar foto
            </button>
          )}
        </div>
      </div>

      {/* Datos editables */}
      <h2 className="text-xl font-semibold mb-4">Datos Personales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="firstName"
          value={user.firstName}
          onChange={handleChange}
          placeholder="Nombre"
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="lastName1"
          value={user.lastName1}
          onChange={handleChange}
          placeholder="Primer apellido"
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="lastName2"
          value={user.lastName2}
          onChange={handleChange}
          placeholder="Segundo apellido"
          className="border p-2 rounded"
        />
        <input
          type="tel"
          name="phone"
          value={user.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="birthDate"
          value={user.birthDate}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <select
          name="gender"
          value={user.gender}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Selecciona género</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {/* Datos no editables */}
      <h2 className="text-xl font-semibold mb-4">Información de la cuenta</h2>
      <div className="mb-6 space-y-1 text-gray-700">
        <p><strong>Correo:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role}</p>
        <p><strong>Perfil creado:</strong> {user.createdAt}</p>
        <p><strong>Contraseña:</strong> ******</p>
      </div>

      {/* Cambiar contraseña */}
      {!showPasswordForm && (
        <button
          onClick={() => setShowPasswordForm(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Cambiar contraseña
        </button>
      )}

      {showPasswordForm && (
        <div className="mb-6 space-y-3 border p-4 rounded bg-gray-50">
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Contraseña actual"
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            placeholder="Confirmar nueva contraseña"
            className="border p-2 rounded w-full"
          />
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            onClick={handleChangePassword}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Guardar contraseña
          </button>
        </div>
      )}

      {/* Botones finales */}
      <div className="flex flex-col md:flex-row md:space-x-8 mt-8">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-3 md:mb-0"
        >
          Guardar cambios
        </button>
        <button
          onClick={() => nav('/dashboard')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
