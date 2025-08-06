import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

const EditLoanModal = ({ loan, users, associates, onUpdateSuccess, onClose, isPage = false }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    associate_id: '',
    amount: '',
    interest_rate: '',
    commission_rate: '',
    term_months: '6',
    payment_frequency: 'quincenal',
  });
  const [error, setError] = useState('');

  const isEditMode = Boolean(loan);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        user_id: loan.user_id || '',
        associate_id: loan.associate_id || '',
        amount: loan.amount || '',
        interest_rate: loan.interest_rate || '',
        commission_rate: loan.commission_rate || '0',
        term_months: loan.term_months || '6',
        payment_frequency: loan.payment_frequency || 'quincenal',
      });
    }
  }, [loan, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const selectedAssociate = associates?.find(a => a.id === Number(formData.associate_id));
      if (selectedAssociate) {
        setFormData(prev => ({ ...prev, commission_rate: selectedAssociate.default_commission_rate }));
      }
    }
  }, [formData.associate_id, associates, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(rawValue)) {
      setFormData(prev => ({ ...prev, amount: rawValue }));
    }
  };

  const formattedAmount = formData.amount ? parseInt(formData.amount, 10).toLocaleString('en-US') : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const submissionData = {
      ...formData,
      user_id: Number(formData.user_id),
      associate_id: formData.associate_id ? Number(formData.associate_id) : null,
      amount: parseFloat(formData.amount),
      interest_rate: parseFloat(formData.interest_rate),
      commission_rate: parseFloat(formData.commission_rate),
      term_months: parseFloat(formData.term_months),
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

  const quincenaOptions = [];
  for (let i = 1; i <= 48; i++) {
    quincenaOptions.push({
      label: `${i} quincena${i > 1 ? 's' : ''} (${i / 2} mes${i / 2 > 1 ? 'es' : ''})`,
      value: i / 2,
    });
  }

  const formContent = (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group">
        <label>Usuario (Cliente):</label>
        <select name="user_id" value={formData.user_id} onChange={handleChange} required disabled={isEditMode}>
          <option value="">Seleccione un usuario</option>
          {users && users.map(u => (
            <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Asociado (Opcional):</label>
        <select name="associate_id" value={formData.associate_id} onChange={handleChange}>
          <option value="">Ninguno</option>
          {associates && associates.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Monto:</label>
        <input type="text" name="amount" value={formattedAmount} onChange={handleAmountChange} required placeholder="Ej: 50,000" />
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
        <label>Plazo:</label>
        <select name="term_months" value={formData.term_months} onChange={handleChange} required>
          {quincenaOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Frecuencia de Pago:</label>
        <select name="payment_frequency" value={formData.payment_frequency} onChange={handleChange} required>
          <option value="quincenal">Quincenal</option>
          <option value="mensual">Mensual</option>
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="modal-actions">
        <button type="submit">{isEditMode ? 'Actualizar' : 'Crear'}</button>
        {!isPage && <button type="button" onClick={onClose}>Cancelar</button>}
        {isPage && <Link to="/loans"><button type="button">Cancelar</button></Link>}
      </div>
    </form>
  );

  const containerClass = isPage ? '' : 'modal-backdrop';
  const contentClass = isPage ? '' : 'modal-content';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <h2>{isEditMode ? 'Editar' : 'Crear'} Préstamo</h2>
        {formContent}
      </div>
    </div>
  );
};

export default EditLoanModal;
