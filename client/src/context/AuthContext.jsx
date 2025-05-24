// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1) Estado para token, usuario y loading
  const [token,   setToken]   = useState(localStorage.getItem('token'));
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // 2) Cada vez que cambie `token`, recargamos el perfil
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
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
        setUser(res.data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [token]);

  // 3) login(token): guarda y dispara recarga de perfil
  const login = newToken => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // 4) logout(): limpia todo
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
