import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import '../pages/ClientsPage.css'; // Reutilizamos estilos para el modal

const EditLoanModal = ({ loan, clients, associates, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    associate_id: '',
    amount: '',
    interest_rate: '',
    commission_rate: '',
    term_months: '',
    payment_frequency: 'quincenal',
  });
  const [error, setError] = useState('');

  const isEditMode = Boolean(loan);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        client_id: loan.client_id || '',
        associate_id: loan.associate_id || '',
        amount: loan.amount || '',
        interest_rate: loan.interest_rate || '',
        commission_rate: loan.commission_rate || '0',
        term_months: loan.term_months || '',
        payment_frequency: loan.payment_frequency || 'quincenal',
      });
    } else {
      // Lógica para pre-rellenar comisión si se selecciona un asociado
      const selectedAssociate = associates.find(a => a.id === Number(formData.associate_id));
      if (selectedAssociate) {
        setFormData(prev => ({
          ...prev,
          commission_rate: selectedAssociate.default_commission_rate
        }));
      } else {
         setFormData(prev => ({ ...prev, commission_rate: '0' }));
      }
    }
  }, [loan, isEditMode, formData.associate_id, associates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Conversión a tipos numéricos correctos
    const submissionData = {
      ...formData,
      client_id: Number(formData.client_id),
      associate_id: formData.associate_id ? Number(formData.associate_id) : null,
      amount: parseFloat(formData.amount),
      interest_rate: parseFloat(formData.interest_rate),
      commission_rate: parseFloat(formData.commission_rate),
      term_months: parseInt(formData.term_months, 10),
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/loans/${loan.id}`, submissionData);
      } else {
        await apiClient.post('/loans/', submissionData);
      }
      onUpdateSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || `Error al ${isEditMode ? 'actualizar' : 'crear'} el préstamo.`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{isEditMode ? 'Editar' : 'Crear'} Préstamo</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cliente:</label>
            <select name="client_id" value={formData.client_id} onChange={handleChange} required disabled={isEditMode}>
              <option value="">Seleccione un cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Asociado (Opcional):</label>
            <select name="associate_id" value={formData.associate_id} onChange={handleChange}>
              <option value="">Ninguno</option>
              {associates.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Monto:</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Tasa de Interés (% Anual):</label>
            <input type="number" step="0.01" name="interest_rate" value={formData.interest_rate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Tasa de Comisión (%):</label>
            <input type="number" step="0.01" name="commission_rate" value={formData.commission_rate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Plazo (Meses):</label>
            <input type="number" name="term_months" value={formData.term_months} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Frecuencia de Pago:</label>
            <select name="payment_frequency" value={formData.payment_frequency} onChange={handleChange} required>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="submit" className="button-primary">{isEditMode ? 'Actualizar' : 'Crear'}</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLoanModal;
