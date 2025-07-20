import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, loginAction } = useAuth();
  const navigate = useNavigate();

  // Redirige si el usuario ya está logueado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      loginAction(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      console.error('Error en el login:', err.response);
    }
  };

  // No renderizar el formulario si el usuario ya está autenticado para evitar un "flash"
  if (user) {
    return null;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
      <div style={{ width: '320px', textAlign: 'center', padding: '2rem', background: 'var(--color-surface)', borderRadius: '8px' }}>
        <h1>Iniciar Sesión en Credinet</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-text-primary)' }}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
