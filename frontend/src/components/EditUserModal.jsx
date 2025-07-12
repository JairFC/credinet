import React, { useState } from 'react';
import apiClient from '../services/api';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '400px',
};

const EditUserModal = ({ user, onUpdateSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await apiClient.put(`/auth/users/${user.id}`, { password });
      onUpdateSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el usuario.');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Usuario (ID: {user.id})</h2>
        <form onSubmit={handleSubmit} className="client-form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="form-group">
            <label htmlFor="edit-password">Nueva Contraseña</label>
            <input
              id="edit-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva Contraseña"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-confirmPassword">Confirmar Nueva Contraseña</label>
            <input
              id="edit-confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Nueva Contraseña"
              required
            />
          </div>
          <button type="submit" style={{ marginTop: '10px' }}>Guardar Cambios</button>
          <button type="button" onClick={onClose} style={{ marginTop: '5px' }}>Cancelar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default EditUserModal;
