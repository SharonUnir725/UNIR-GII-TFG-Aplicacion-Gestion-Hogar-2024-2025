import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState({
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
      .catch(err => console.error('Error al cargar perfil:', err));
  }, []);

  const handleChange = e => setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUser(prev => ({ ...prev, profileImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

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
      if (res.ok) alert('Perfil actualizado correctamente');
      else alert('Error al actualizar');
    } catch {
      alert('Error de conexión al guardar perfil');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('Las contraseñas nuevas no coinciden');
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
        alert('Contraseña actualizada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordForm(false);
      } else alert('Error al cambiar contraseña');
    } catch {
      alert('Error de conexión al cambiar contraseña');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Perfil de Usuario</h1>

      {/* Imagen de perfil */}
      <div className="flex flex-col items-center mb-8">
        {user.profileImage ? (
          <img src={user.profileImage} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-gray-400" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 mb-3 border-4 border-gray-400" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm mt-4" />
      </div>

      {/* Datos editables */}
      <h2 className="text-xl font-semibold mb-4">Datos Personales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input type="text" name="firstName" value={user.firstName} onChange={handleChange} placeholder="Nombre" className="border p-2 rounded" />
        <input type="text" name="lastName1" value={user.lastName1} onChange={handleChange} placeholder="Primer apellido" className="border p-2 rounded" />
        <input type="text" name="lastName2" value={user.lastName2} onChange={handleChange} placeholder="Segundo apellido" className="border p-2 rounded" />
        <input type="tel" name="phone" value={user.phone} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded" />
        <input type="date" name="birthDate" value={user.birthDate} onChange={handleChange} className="border p-2 rounded" />
        <select name="gender" value={user.gender} onChange={handleChange} className="border p-2 rounded">
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
        <button onClick={() => setShowPasswordForm(true)} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Cambiar contraseña</button>
      )}

      {showPasswordForm && (
        <div className="mb-6 space-y-3 border p-4 rounded bg-gray-50">
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Contraseña actual" className="border p-2 rounded w-full" />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" className="border p-2 rounded w-full" />
          <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirmar nueva contraseña" className="border p-2 rounded w-full" />
          <button onClick={handleChangePassword} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Guardar contraseña</button>
        </div>
      )}

      {/* Botones finales con mayor espacio */}
      <div className="flex flex-col md:flex-row md:space-x-8 mt-8">
        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-3 md:mb-0">Guardar cambios</button>
        <button onClick={() => nav('/dashboard')} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">← Volver al Dashboard</button>
      </div>
    </div>
  );
}
