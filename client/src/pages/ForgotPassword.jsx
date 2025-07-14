import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post('/api/users/forgot-password', { email });
      setMessage('Si el correo está registrado, se ha enviado un enlace de recuperación.');
    } catch (err) {
      setError('Error al intentar enviar el correo de recuperación.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Recuperar contraseña</h2>
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Enviar enlace
        </button>
      </form>
    </div>
  );
}
