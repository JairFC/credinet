import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('asociado'); // Rol por defecto
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await apiClient.post('/auth/register', {
        username,
        password,
        role,
      });
      setSuccess('¡Usuario registrado con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      console.error('Error en el registro:', err.response);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px', textAlign: 'center' }}>
        <h1>Registrar Nuevo Usuario</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', margin: '8px 0' }}
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', margin: '8px 0' }}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', margin: '8px 0' }}
            />
          </div>
          <div>
            <label htmlFor="role">Rol:</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', margin: '8px 0' }}>
              <option value="asociado">Asociado</option>
              <option value="auxiliar_administrativo">Auxiliar Administrativo</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>Registrar</button>
        </form>
        <p>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
