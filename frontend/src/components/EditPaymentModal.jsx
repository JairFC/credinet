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

const EditPaymentModal = ({ payment, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    amount_paid: payment.amount_paid,
    payment_date: new Date(payment.payment_date).toISOString().split('T')[0],
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
      const response = await apiClient.put(`/loans/payments/${payment.id}`, formData);
      onUpdateSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el pago.');
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Pago (ID: {payment.id})</h2>
        <form onSubmit={handleSubmit} className="client-form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="form-group">
            <label htmlFor="edit-amount_paid">Monto Pagado</label>
            <input
              id="edit-amount_paid"
              name="amount_paid"
              type="number"
              value={formData.amount_paid}
              onChange={handleChange}
              placeholder="Monto Pagado"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-payment_date">Fecha de Pago</label>
            <input
              id="edit-payment_date"
              name="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={handleChange}
              placeholder="Fecha de Pago"
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

export default EditPaymentModal;
