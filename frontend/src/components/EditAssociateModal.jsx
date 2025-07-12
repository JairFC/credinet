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

const EditAssociateModal = ({ associate, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: associate.name,
    contact_person: associate.contact_person || '',
    contact_email: associate.contact_email || '',
    default_commission_rate: associate.default_commission_rate || '5.0',
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
        ...formData,
        default_commission_rate: parseFloat(formData.default_commission_rate),
      };
      const response = await apiClient.put(`/associates/${associate.id}`, updateData);
      onUpdateSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el asociado.');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Asociado (ID: {associate.id})</h2>
        <form onSubmit={handleSubmit} className="client-form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="form-group">
            <label htmlFor="edit-name">Nombre del Asociado</label>
            <input id="edit-name" name="name" type="text" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="edit-contact_person">Persona de Contacto</label>
            <input id="edit-contact_person" name="contact_person" type="text" value={formData.contact_person} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-contact_email">Email de Contacto</label>
            <input id="edit-contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-default_commission_rate">Tasa de Comisión por Defecto (%)</label>
            <input id="edit-default_commission_rate" name="default_commission_rate" type="number" value={formData.default_commission_rate} onChange={handleChange} />
          </div>
          <button type="submit" style={{ marginTop: '10px' }}>Guardar Cambios</button>
          <button type="button" onClick={onClose} style={{ marginTop: '5px' }}>Cancelar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default EditAssociateModal;
