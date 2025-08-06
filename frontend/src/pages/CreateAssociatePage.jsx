import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const CreateAssociatePage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    // Campos específicos del asociado
    level_id: 1, // Valor por defecto, se puede cargar dinámicamente
    default_commission_rate: 5.0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validatePhoneNumber = (number) => {
    const digits_only = number.replace(/\D/g, '');
    return digits_only.length === 10;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones previas al envío
    if (!validatePhoneNumber(formData.phone_number)) {
      setError('El formato del número de teléfono es incorrecto.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const userData = {
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        roles: ['asociado'], // Rol de asociado
        associate_data: {
          name: `${formData.first_name} ${formData.last_name}`,
          level_id: parseInt(formData.level_id, 10),
          contact_person: `${formData.first_name} ${formData.last_name}`,
          contact_email: formData.email,
          default_commission_rate: parseFloat(formData.default_commission_rate),
        },
      };

      await apiClient.post('/auth/users', userData);
      
      setSuccess('¡Asociado registrado con éxito! Redirigiendo a la lista de asociados...');
      setTimeout(() => {
        navigate('/associates');
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ocurrió un error inesperado al crear el asociado.';
      setError(errorMessage);
      console.error('Error en el registro de asociado:', err.response);
    }
  };

  return (
    <div className="clients-page">
      <Link to="/associates" className="back-link">← Volver a Asociados</Link>
      <h1>Crear Nuevo Asociado</h1>
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

        {/* Campos específicos del asociado */}
        <div className="form-group">
          <label>Nivel de Asociado (ID)</label>
          <input type="number" name="level_id" value={formData.level_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Tasa de Comisión por Defecto (%)</label>
          <input type="number" step="0.01" name="default_commission_rate" value={formData.default_commission_rate} onChange={handleChange} required />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="modal-actions">
          <button type="submit">Crear Asociado</button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssociatePage;