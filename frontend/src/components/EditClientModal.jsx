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
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '400px',
};

const EditClientModal = ({ client, users, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: client.first_name,
    last_name: client.last_name,
    email: client.email || '',
    user_id: client.user_id || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_id: formData.user_id ? parseInt(formData.user_id) : null,
      };
      await apiClient.put(`/clients/${client.id}`, updateData);
      onUpdateSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el cliente.');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Cliente</h2>
        <form onSubmit={handleSubmit}>
          <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nombre" required />
          <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Apellido" required />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          <select name="user_id" value={formData.user_id} onChange={handleChange}>
            <option value="">-- Sin Asignar --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancelar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default EditClientModal;