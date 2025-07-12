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

const EditAssociateModal = ({ associate, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: associate.name,
    contact_person: associate.contact_person || '',
    contact_email: associate.contact_email || '',
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
      await apiClient.put(`/associates/${associate.id}`, formData);
      onUpdateSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el asociado.');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Asociado</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required />
          <input name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Persona de Contacto" />
          <input name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} placeholder="Email de Contacto" />
          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancelar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default EditAssociateModal;