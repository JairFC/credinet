import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // El payload ahora tiene un campo "roles" que es una lista
        setUser({ ...decoded, roles: decoded.roles || [] });
      } catch (error) {
        logoutAction();
      }
    }
  }, [token]);

  const loginAction = (data) => {
    const newToken = data.access_token;
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    const decoded = jwtDecode(newToken);
    setUser({ ...decoded, roles: decoded.roles || [] });
    navigate('/dashboard');
  };

  const logoutAction = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/login');
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