import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Si hay un token en localStorage al cargar la app, decodifícalo.
    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch (error) {
        // Si el token es inválido, lo limpiamos
        logoutAction();
      }
    }
  }, [token]);

  const loginAction = (data) => {
    const newToken = data.access_token;
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    setUser(jwtDecode(newToken)); // Decodificamos y guardamos el usuario
    navigate('/dashboard'); // Redirige al dashboard después del login
  };

  const logoutAction = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  const value = {
    token,
    user,
    loginAction,
    logoutAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};