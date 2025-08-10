// client/src/context/AuthContext.jsx
// Contexto global de autenticación para toda la aplicación React
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Crear contexto de autenticación
const AuthContext = createContext();

// Proveedor del contexto
export function AuthProvider({ children }) {
  // Estados globales: token JWT, usuario logueado y estado de carga
  const [token,   setToken]   = useState(localStorage.getItem('token'));
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect: cada vez que cambie el token, se actualiza el perfil del usuario
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);

      // Si no hay token, se resetea el estado
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const res = await axios.get(
          `${baseUrl}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data); // Guardar usuario obtenido del backend
      } catch {
        // Si el token es inválido o expiró
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [token]);

  // login(): guarda token en localStorage y actualiza el estado
  const login = newToken => {
    localStorage.setItem('token', newToken);
    console.log('🔐 Token guardado en localStorage:', localStorage.getItem('token'))
    setToken(newToken);
  };

  // logout(): limpia token y estado de usuario
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Proporcionar estado y funciones a los componentes hijos
  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}
