import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const EditAssociateModal = ({ associate, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    level_id: 1, // Default to 'Plata'
    contact_person: '',
    contact_email: '',
    default_commission_rate: '5.0',
  });
  const [error, setError] = useState('');

  const isEditMode = Boolean(associate);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: associate.name || '',
        level_id: associate.level_id || 1,
        contact_person: associate.contact_person || '',
        contact_email: associate.contact_email || '',
        default_commission_rate: associate.default_commission_rate?.toString() || '5.0',
      });
    }
  }, [associate, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const submissionData = {
      ...formData,
      level_id: parseInt(formData.level_id, 10),
      default_commission_rate: parseFloat(formData.default_commission_rate),
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/associates/${associate.id}`, submissionData);
      } else {
        await apiClient.post('/associates/', submissionData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || `Error al ${isEditMode ? 'actualizar' : 'crear'} el asociado.`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{isEditMode ? 'Editar' : 'Crear'} Asociado</h2>
        <form onSubmit={handleSubmit}>
          {/* Aquí irían los campos del formulario: name, level_id (como un select), etc. */}
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Persona de Contacto</label>
            <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email de Contacto</label>
            <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Comisión por Defecto (%)</label>
            <input type="number" step="0.01" name="default_commission_rate" value={formData.default_commission_rate} onChange={handleChange} required />
          </div>
          
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="modal-actions">
            <button type="submit">{isEditMode ? 'Actualizar' : 'Crear'}</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssociateModal;