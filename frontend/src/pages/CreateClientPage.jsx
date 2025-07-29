
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const CreateClientPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });
  const [beneficiaryData, setBeneficiaryData] = useState({
    full_name: '',
    relationship: '',
    phone_number: '',
  });
  const [isBeneficiaryVisible, setIsBeneficiaryVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState({});

  const validatePhoneNumber = (number) => {
    const digits_only = number.replace(/\D/g, '');
    return digits_only.length === 10;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone_number') {
      if (!validatePhoneNumber(value)) {
        setFormErrors(prev => ({...prev, phone_number: 'El teléfono debe tener 10 dígitos.'}));
      } else {
        setFormErrors(prev => ({...prev, phone_number: ''}));
      }
    }
  };

  const handleBeneficiaryChange = (e) => {
    const { name, value } = e.target;
    setBeneficiaryData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone_number') {
      if (value && !validatePhoneNumber(value)) {
        setFormErrors(prev => ({...prev, beneficiary_phone: 'El teléfono del beneficiario debe tener 10 dígitos.'}));
      } else {
        setFormErrors(prev => ({...prev, beneficiary_phone: ''}));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Re-validar todo antes de enviar
    if (!validatePhoneNumber(formData.phone_number)) {
      setError('El formato del número de teléfono del cliente es incorrecto.');
      return;
    }
    if (isBeneficiaryVisible && beneficiaryData.full_name && !validatePhoneNumber(beneficiaryData.phone_number)) {
      setError('El formato del número de teléfono del beneficiario es incorrecto.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const userData = {
        ...formData,
        roles: ['cliente'],
        beneficiary: isBeneficiaryVisible && beneficiaryData.full_name ? beneficiaryData : null,
      };

      await apiClient.post('/auth/users', userData);
      
      setSuccess('¡Cliente registrado con éxito! Redirigiendo a la lista de clientes...');
      setTimeout(() => {
        navigate('/clients');
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ocurrió un error inesperado al crear el cliente.';
      setError(errorMessage);
      console.error('Error en el registro de cliente:', err.response);
    }
  };

  return (
    <div className="clients-page">
      <Link to="/clients" className="back-link">← Volver a Clientes</Link>
      <h1>Crear Nuevo Cliente</h1>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Nombre(s)</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Apellido(s)</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
          {formErrors.phone_number && <span className="field-error-message">{formErrors.phone_number}</span>}
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </div>

        <div className="collapsible-section">
          <button type="button" onClick={() => setIsBeneficiaryVisible(!isBeneficiaryVisible)} className="collapsible-header">
            Beneficiario (Opcional) {isBeneficiaryVisible ? '▲' : '▼'}
          </button>
          {isBeneficiaryVisible && (
            <div className="collapsible-content">
              <div className="form-group">
                <label>Nombre Completo del Beneficiario</label>
                <input type="text" name="full_name" value={beneficiaryData.full_name} onChange={handleBeneficiaryChange} />
              </div>
              <div className="form-group">
                <label>Parentesco</label>
                <input type="text" name="relationship" value={beneficiaryData.relationship} onChange={handleBeneficiaryChange} />
              </div>
              <div className="form-group">
                <label>Teléfono del Beneficiario</label>
                <input type="text" name="phone_number" value={beneficiaryData.phone_number} onChange={handleBeneficiaryChange} />
                {formErrors.beneficiary_phone && <span className="field-error-message">{formErrors.beneficiary_phone}</span>}
              </div>
            </div>
          )}
        </div>
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="modal-actions">
          <button type="submit">Crear Cliente</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClientPage;
