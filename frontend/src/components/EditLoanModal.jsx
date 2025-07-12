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

const EditLoanModal = ({ loan, distributors, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    amount: String(loan.amount), // Aseguramos que el valor inicial sea un string
    interest_rate: loan.interest_rate,
    commission_rate: loan.commission_rate || 0.0,
    term_months: loan.term_months,
    distributor_id: loan.distributor_id || '',
    payment_frequency: loan.payment_frequency || 'quincenal',
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
        amount: parseFloat(formData.amount),
        interest_rate: parseFloat(formData.interest_rate),
        commission_rate: parseFloat(formData.commission_rate) || 0.0,
        term_months: parseInt(formData.term_months),
        distributor_id: formData.distributor_id ? parseInt(formData.distributor_id) : null,
        payment_frequency: formData.payment_frequency,
      };
      const response = await apiClient.put(`/loans/${loan.id}`, updateData);
      onUpdateSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el préstamo.');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Préstamo (ID: {loan.id})</h2>
        <form onSubmit={handleSubmit} className="client-form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="form-group">
            <label htmlFor="edit-amount">Monto</label>
            <div className="input-with-adornment">
              <span className="adornment adornment-start">$</span>
              <input
                id="edit-amount"
                name="amount"
                type="text"
                className="has-start-adornment"
                value={formData.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '');
                  if (/^\d*$/.test(rawValue)) {
                    handleChange({ target: { name: 'amount', value: rawValue } });
                  }
                }}
                placeholder="Monto" required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-interestRate">Tasa de Interés</label>
            <div className="input-with-adornment">
              <input id="edit-interestRate" name="interest_rate" type="number" className="has-end-adornment" value={formData.interest_rate} onChange={handleChange} placeholder="Tasa de Interés" required />
              <span className="adornment adornment-end">%</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-commissionRate">Tasa de Comisión</label>
            <div className="input-with-adornment">
              <input id="edit-commissionRate" name="commission_rate" type="number" className="has-end-adornment" value={formData.commission_rate} onChange={handleChange} placeholder="Tasa de Comisión" />
              <span className="adornment adornment-end">%</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-termMonths">Plazo</label>
            <div className="input-with-adornment">
              <input id="edit-termMonths" name="term_months" type="number" className="has-end-adornment" value={formData.term_months} onChange={handleChange} placeholder="Plazo" required />
              <span className="adornment adornment-end">meses</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-distributor">Distribuidora</label>
            <select id="edit-distributor" name="distributor_id" value={formData.distributor_id} onChange={handleChange}>
              <option value="">-- Sin Distribuidora --</option>
              {distributors.map(dist => (
                <option key={dist.id} value={dist.id}>{dist.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="edit-paymentFrequency">Frecuencia de Pago</label>
            <select id="edit-paymentFrequency" name="payment_frequency" value={formData.payment_frequency} onChange={handleChange}>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: '10px' }}>Guardar Cambios</button>
          <button type="button" onClick={onClose} style={{ marginTop: '5px' }}>Cancelar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default EditLoanModal;