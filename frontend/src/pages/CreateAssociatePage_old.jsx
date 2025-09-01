import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { getAssociateLevels, createAssociate } from '../services/associateService';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { ErrorModal } from '../components/ErrorModal';

const CreateAssociatePage = () => {
  const [formData, setFormData] = useState({
    // Información personal
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    curp: '',
    birth_date: '',
    // Información de cuenta (autogenerada)
    username: '',
    password: '',
    confirmPassword: '',
    // Campos específicos del asociado
    level_id: 1,
    default_commission_rate: 5.0,
    // Rol adicional
    also_client: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [levels, setLevels] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  const [isValidatingCurp, setIsValidatingCurp] = useState(false);
  const navigate = useNavigate();

  // Carga de los niveles de asociado
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await getAssociateLevels();
        setLevels(response.data || []);
        if (response.data?.length > 0) {
          setFormData(prev => ({ ...prev, level_id: response.data[0].id }));
        }
      } catch (err) {
        console.error('Error al cargar los niveles de asociado:', err);
        setError('No se pudieron cargar los niveles de asociado.');
      }
    };
    fetchLevels();
  }, []);

  // Autogenerar username cuando cambien nombre y apellido
  useEffect(() => {
    if (formData.first_name && formData.last_name) {
      const baseUsername = `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z.]/g, ''); // Solo letras minúsculas y puntos

      setFormData(prev => ({
        ...prev,
        username: baseUsername,
        password: 'Sparrow20', // Contraseña por defecto
        confirmPassword: 'Sparrow20'
      }));
    }
  }, [formData.first_name, formData.last_name]);

  const validatePhoneNumber = (number) => {
    const digits_only = number.replace(/\D/g, '');
    return digits_only.length === 10;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateCurp = (curp) => {
    const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    return curpRegex.test(curp.toUpperCase());
  };

  const validateUsername = async (username) => {
    if (!username || username.length < 3) return false;

    try {
      setIsValidatingUsername(true);
      const response = await apiClient.get(`/utils/validate-username?username=${username}`);
      return response.data.available;
    } catch (error) {
      console.error('Error validating username:', error);
      return false;
    } finally {
      setIsValidatingUsername(false);
    }
  };

  const validateCurpUnique = async (curp) => {
    if (!validateCurp(curp)) return false;

    try {
      setIsValidatingCurp(true);
      const response = await apiClient.get(`/utils/validate-curp?curp=${curp.toUpperCase()}`);
      return response.data.available;
    } catch (error) {
      console.error('Error validating CURP:', error);
      return false;
    } finally {
      setIsValidatingCurp(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Validaciones en tiempo real
    switch (name) {
      case 'phone_number':
        if (!validatePhoneNumber(value)) {
          setFormErrors(prev => ({ ...prev, phone_number: 'El teléfono debe tener 10 dígitos.' }));
        } else {
          setFormErrors(prev => ({ ...prev, phone_number: '' }));
        }
        break;
      case 'email':
        if (!validateEmail(value)) {
          setFormErrors(prev => ({ ...prev, email: 'El formato del email es incorrecto.' }));
        } else {
          setFormErrors(prev => ({ ...prev, email: '' }));
        }
        break;
      case 'curp':
        if (value && !validateCurp(value)) {
          setFormErrors(prev => ({ ...prev, curp: 'El formato del CURP es incorrecto.' }));
        } else if (value && value.length === 18) {
          // Validar CURP único cuando esté completo
          const isUnique = await validateCurpUnique(value);
          if (!isUnique) {
            setFormErrors(prev => ({ ...prev, curp: 'Este CURP ya está registrado.' }));
          } else {
            setFormErrors(prev => ({ ...prev, curp: '' }));
          }
        } else {
          setFormErrors(prev => ({ ...prev, curp: '' }));
        }
        break;
      case 'username':
        if (value && value.length >= 3) {
          const isValid = await validateUsername(value);
          if (!isValid) {
            setFormErrors(prev => ({ ...prev, username: 'Este nombre de usuario no está disponible.' }));
          } else {
            setFormErrors(prev => ({ ...prev, username: '' }));
          }
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          setFormErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden.' }));
        } else {
          setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.username) {
      errors.username = 'El nombre de usuario es obligatorio';
      isValid = false;
    }

    if (!validatePhoneNumber(formData.phone_number)) {
      errors.phone_number = 'El formato del número de teléfono es incorrecto';
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      errors.email = 'El formato del email es incorrecto';
      isValid = false;
    }

    if (formData.curp && !validateCurp(formData.curp)) {
      errors.curp = 'El formato del CURP es incorrecto';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    if (!formData.first_name || !formData.last_name) {
      errors.name = 'El nombre y apellido son obligatorios';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones previas al envío
    if (!validateForm()) {
      setShowErrorModal(true);
      return;
    }

    try {
      const roles = ['asociado'];
      if (formData.also_client) {
        roles.push('cliente');
      }

      const userData = {
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        curp: formData.curp || null,
        birth_date: formData.birth_date || null,
        roles: roles,
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
    <div className="page-container">
      <Link to="/associates" className="back-link">← Volver a Asociados</Link>
      <h1 className="page-title">Crear Nuevo Asociado</h1>

      {/* Modal de errores */}
      {showErrorModal && (
        <ErrorModal
          title="Error en el formulario"
          message="Por favor, corrija los errores en el formulario antes de continuar."
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="form-container">
        {/* INFORMACIÓN PERSONAL - PRIMERA SECCIÓN */}
        <CollapsibleSection title="Información Personal" defaultOpen={true}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre(s) *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido(s) *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
                required
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="form-input"
                placeholder="10 dígitos"
                required
              />
              {formErrors.phone_number && <span className="error-message">{formErrors.phone_number}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">CURP</label>
              <input
                type="text"
                name="curp"
                value={formData.curp}
                onChange={handleChange}
                className="form-input"
                placeholder="18 caracteres"
                maxLength="18"
                style={{ textTransform: 'uppercase' }}
              />
              {isValidatingCurp && <span className="info-message">Validando CURP...</span>}
              {formErrors.curp && <span className="error-message">{formErrors.curp}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Nacimiento</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* INFORMACIÓN DE CUENTA - AUTOGENERADA */}
        <CollapsibleSection title="Información de Cuenta" defaultOpen={false}>
          <div className="alert alert-info">
            <strong>Información generada automáticamente</strong>
            <p>Los datos de cuenta se generan basándose en la información personal.</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre de Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                required
              />
              {isValidatingUsername && <span className="info-message">Validando disponibilidad...</span>}
              {formErrors.username && <span className="error-message">{formErrors.username}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
              {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
            </div>
          </div>
        </CollapsibleSection>

        {/* INFORMACIÓN DE ASOCIADO */}
        <CollapsibleSection title="Configuración de Asociado" defaultOpen={true}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nivel de Asociado</label>
              <select
                name="level_id"
                value={formData.level_id}
                onChange={handleChange}
                className="form-select"
                required
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name} (Max: ${level.max_loan_amount?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tasa de Comisión por Defecto (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                name="default_commission_rate"
                value={formData.default_commission_rate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* CHECKBOX PARA ROL DE CLIENTE */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="also_client"
                checked={formData.also_client}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="checkbox-text">
                <strong>Asignar también rol de Cliente</strong>
                <small>Esta distribuidora también podrá solicitar créditos como cliente</small>
              </span>
            </label>
          </div>
        </CollapsibleSection>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Crear Asociado
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssociatePage;
