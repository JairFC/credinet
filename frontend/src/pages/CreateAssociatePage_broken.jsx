import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { getAssociateLevels } from '../services/associateService';
import { generateCurp } from '../utils/curp_generator';
import { CollapsibleSection } from '../components/CollapsibleSection';

// Modal para verificación de CURP
const CurpModal = ({ modalState, onConfirm, onCancel, onCurpChange, onCloseResult }) => {
  if (!modalState.isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content">
        {modalState.step === 'confirm' && (
          <>
            <h2>Verificar CURP</h2>
            <p>Por favor, confirma la CURP generada. Si es necesario, corrige la homoclave (los dos últimos caracteres).</p>
            <input
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

        <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleFillTestData}
                className="btn btn-secondary"
                style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
              >
                Datos de Prueba
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="btn btn-secondary"
              >
                Limpiar Formulario
              </button>
              <button type="submit" className="btn btn-primary">
                Crear Asociado
              </button>
            </div>"text"
            value={modalState.curp}
            onChange={onCurpChange}
            maxLength="18"
            className="form-input"
            style={{ textTransform: 'uppercase', marginBottom: '1rem' }}
            />
            <div className="modal-actions">
              <button onClick={onConfirm} className="btn btn-primary">Confirmar y Verificar</button>
              <button onClick={onCancel} type="button" className="btn btn-secondary">Cancelar</button>
            </div>
          </>
        )}
        {modalState.step === 'loading' && (
          <>
            <h2>Verificando...</h2>
            <p>Por favor, espera un momento.</p>
          </>
        )}
        {modalState.step === 'result' && (
          <>
            <h2 style={{ marginTop: 0 }}>
              {modalState.result.type === 'success' ? '✅ Verificación Exitosa' : '❌ Error de Verificación'}
            </h2>
            <p style={{ fontSize: '1.1rem' }}>{modalState.result.message}</p>
            <div className="modal-actions">
              <button onClick={onCloseResult} className="btn btn-primary">Entendido</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

// Modal para mostrar errores de validación
const ErrorModal = ({ errors, onClose }) => {
  if (errors.length === 0) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 style={{ color: '#f06565', marginTop: 0 }}>❌ Faltan Datos</h2>
        <p>Por favor, corrige los siguientes errores antes de continuar:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          {errors.map((error, index) => (
            <li key={index}>{typeof error === 'string' ? error : JSON.stringify(error)}</li>
          ))}
        </ul>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-primary">Entendido</button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

const CreateAssociatePage = () => {
  const [formData, setFormData] = useState({
    // Información personal (igual que clientes)
    first_name: '',
    paternal_last_name: '',
    maternal_last_name: '',
    email: '',
    phone_number: '',
    birth_date: '',
    gender: 'HOMBRE',
    state_of_birth: 'CHIHUAHUA',
    curp: '',
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
  const [validationErrors, setValidationErrors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [levels, setLevels] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  const [isValidatingCurp, setIsValidatingCurp] = useState(false);
  const [isEmailUnique, setIsEmailUnique] = useState(true);
  const [isPhoneUnique, setIsPhoneUnique] = useState(true);

  // Estados para CURP igual que en clientes
  const [isCurpVerified, setIsCurpVerified] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    step: 'confirm',
    curp: '',
    result: { message: '', type: '' }
  });

  // Estado para datos de México
  const [mexicoData, setMexicoData] = useState({ estados: [] });

  const navigate = useNavigate();

  // Escuchar cambios de tema para forzar re-renderizado si es necesario
  useEffect(() => {
    const handleThemeChange = (e) => {
      console.log('Theme change detected in CreateAssociatePage:', e.detail.theme);
      // Forzar re-aplicación de estilos si es necesario
      const inputs = document.querySelectorAll('.form-input, .form-select');
      inputs.forEach(input => {
        input.style.backgroundColor = 'var(--color-surface)';
        input.style.color = 'var(--color-text-primary)';
        input.style.borderColor = 'var(--color-border)';
      });
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Cargar datos de estados
  useEffect(() => {
    fetch('/data/estados_municipios.json')
      .then(response => response.json())
      .then(data => setMexicoData(data))
      .catch(error => console.error("Error al cargar datos de México:", error));
  }, []);

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

  // Autogenerar CURP cuando cambien los campos necesarios
  useEffect(() => {
    const { first_name, paternal_last_name, maternal_last_name, birth_date, gender, state_of_birth } = formData;
    if (first_name && paternal_last_name && birth_date && gender && state_of_birth) {
      const curp = generateCurp({
        nombre: first_name,
        apellidoPaterno: paternal_last_name,
        apellidoMaterno: maternal_last_name,
        fechaNacimiento: birth_date,
        sexo: gender,
        estadoNacimiento: state_of_birth
      });
      setFormData(prev => ({ ...prev, curp }));
      setIsCurpVerified(false); // Reset verification when CURP changes
    }
  }, [formData.first_name, formData.paternal_last_name, formData.maternal_last_name, formData.birth_date, formData.gender, formData.state_of_birth]);

  // Autogenerar username cuando cambien nombre y apellido
  useEffect(() => {
    const { first_name, paternal_last_name } = formData;

    const generateAndCheckUsername = async () => {
      if (first_name && paternal_last_name) {
        let baseUsername = `${first_name.toLowerCase().split(' ')[0]}.${paternal_last_name.toLowerCase().replace(/\s/g, '')}`;
        let finalUsername = baseUsername;
        let counter = 1;

        while (true) {
          try {
            const { data } = await apiClient.get(`/utils/check-username/${finalUsername}`);
            if (!data.exists) {
              setFormData(prev => ({
                ...prev,
                username: finalUsername
              }));
              break;
            } else {
              finalUsername = `${baseUsername}${counter}`;
              counter++;
            }
          } catch (error) {
            console.error("Error checking username:", error);
            break;
          }
        }
      }
    };

    generateAndCheckUsername();
  }, [formData.first_name, formData.paternal_last_name]);

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
    let newValue = type === 'checkbox' ? checked : value;

    // Formatear teléfono
    if (name === 'phone_number') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Validaciones en tiempo real
    switch (name) {
      case 'phone_number':
        if (!validatePhoneNumber(newValue)) {
          setFormErrors(prev => ({ ...prev, phone_number: 'El teléfono debe tener 10 dígitos.' }));
          setIsPhoneUnique(true); // Reset unique check if format is invalid
        } else {
          setFormErrors(prev => ({ ...prev, phone_number: '' }));
          // Check if phone is unique
          if (newValue.length === 10) {
            try {
              const { data } = await apiClient.get(`/utils/check-phone/${newValue}`);
              setIsPhoneUnique(!data.exists);
            } catch (error) {
              console.error('Error checking phone uniqueness:', error);
              setIsPhoneUnique(true); // Assume unique if check fails
            }
          }
        }
        break;
      case 'email':
        if (newValue && !validateEmail(newValue)) {
          setFormErrors(prev => ({ ...prev, email: 'El formato del email es incorrecto.' }));
          setIsEmailUnique(true); // Reset unique check if format is invalid
        } else if (newValue) {
          setFormErrors(prev => ({ ...prev, email: '' }));
          // Check if email is unique (only if email is provided since it's optional)
          try {
            const { data } = await apiClient.get(`/utils/check-email/${newValue}`);
            setIsEmailUnique(!data.exists);
          } catch (error) {
            console.error('Error checking email uniqueness:', error);
            setIsEmailUnique(true); // Assume unique if check fails
          }
        } else {
          // Email is empty (which is allowed)
          setFormErrors(prev => ({ ...prev, email: '' }));
          setIsEmailUnique(true);
        }
        break;
      case 'username':
        if (newValue && newValue.length >= 3) {
          const isValid = await validateUsername(newValue);
          if (!isValid) {
            setFormErrors(prev => ({ ...prev, username: 'Este nombre de usuario no está disponible.' }));
          } else {
            setFormErrors(prev => ({ ...prev, username: '' }));
          }
        }
        break;
      case 'confirmPassword':
        if (newValue !== formData.password) {
          setFormErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden.' }));
        } else {
          setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        break;
      default:
        break;
    }
  };

  // Funciones para el modal de CURP (igual que en clientes)
  const handleVerifyCurp = () => {
    if (!formData.curp) {
      setError('No hay CURP para verificar.');
      return;
    }
    setModalState({ isOpen: true, step: 'confirm', curp: formData.curp, result: { message: '', type: '' } });
  };

  const handleCurpModalConfirm = async () => {
    setModalState(prev => ({ ...prev, step: 'loading' }));

    try {
      const response = await apiClient.get(`/utils/check-curp/${modalState.curp}`);

      if (response.data.exists) {
        setModalState(prev => ({
          ...prev,
          step: 'result',
          result: {
            type: 'error',
            message: 'Esta CURP ya está registrada en el sistema. Por favor, verifica los datos o corrige la homoclave.'
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          curp: modalState.curp,
          password: modalState.curp,
          confirmPassword: modalState.curp
        }));
        setIsCurpVerified(true);
        setModalState(prev => ({
          ...prev,
          step: 'result',
          result: {
            type: 'success',
            message: 'CURP verificada correctamente. Ahora puedes continuar con el registro.'
          }
        }));
      }
    } catch (error) {
      setModalState(prev => ({
        ...prev,
        step: 'result',
        result: {
          type: 'error',
          message: 'Error al verificar la CURP. Por favor, intenta nuevamente.'
        }
      }));
    }
  };

  const handleCurpModalCancel = () => {
    setModalState({ isOpen: false, step: 'confirm', curp: '', result: { message: '', type: '' } });
  };

  const handleCurpModalChange = (e) => {
    const value = e.target.value.toUpperCase();
    setModalState(prev => ({ ...prev, curp: value }));
  };

  const handleCloseResult = () => {
    setModalState({ isOpen: false, step: 'confirm', curp: '', result: { message: '', type: '' } });
  };

  // Función para limpiar formulario y generar nuevos datos únicos
  const handleClearForm = () => {
    setFormData({
      // Información personal (igual que clientes)
      first_name: '',
      paternal_last_name: '',
      maternal_last_name: '',
      email: '',
      phone_number: '',
      birth_date: '',
      gender: 'HOMBRE',
      state_of_birth: 'CHIHUAHUA',
      curp: '',
      // Información de cuenta (autogenerada)
      username: '',
      password: '',
      confirmPassword: '',
      // Campos específicos del asociado
      level_id: levels.length > 0 ? levels[0].id : 1,
      default_commission_rate: 5.0,
      // Rol adicional
      also_client: false,
    });
    setFormErrors({});
    setValidationErrors([]);
    setError('');
    setSuccess('');
    setIsCurpVerified(false);
    setIsEmailUnique(true);
    setIsPhoneUnique(true);
  };

  // Función para llenar con datos de prueba únicos
  const handleFillTestData = () => {
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    const randomNum = Math.floor(Math.random() * 1000);

    setFormData({
      first_name: 'Asociado',
      paternal_last_name: 'Prueba',
      maternal_last_name: `Test${timestamp}`,
      email: `asociado.test${timestamp}@demo.com`,
      phone_number: `55${timestamp}`,
      birth_date: '1990-01-15',
      gender: 'HOMBRE',
      state_of_birth: 'CHIHUAHUA',
      curp: '', // Se autogenerará
      username: '', // Se autogenerará
      password: '', // Se autogenerará con CURP
      confirmPassword: '', // Se autogenerará con CURP
      level_id: levels.length > 0 ? levels[0].id : 1,
      default_commission_rate: 5.0,
      also_client: false,
    });
    setFormErrors({});
    setValidationErrors([]);
    setError('');
    setSuccess('');
    setIsCurpVerified(false);
    setIsEmailUnique(true);
    setIsPhoneUnique(true);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.first_name) {
      errors.push("El nombre es obligatorio.");
    }

    if (!formData.paternal_last_name) {
      errors.push("El apellido paterno es obligatorio.");
    }

    if (!formData.username) {
      errors.push("El nombre de usuario es obligatorio.");
    }

    if (formErrors.username) {
      errors.push(`Nombre de usuario: ${formErrors.username}`);
    }

    if (!formData.password) {
      errors.push("La contraseña es obligatoria.");
    }

    if (formErrors.password) {
      errors.push(`Contraseña: ${formErrors.password}`);
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push("Las contraseñas no coinciden.");
    }

    if (!formData.phone_number) {
      errors.push("El número de teléfono es obligatorio.");
    }

    if (formErrors.phone_number) {
      errors.push(`Teléfono: ${formErrors.phone_number}`);
    }

    if (!isPhoneUnique) {
      errors.push("El número de teléfono ya está registrado.");
    }

    // Email es opcional, pero si se proporciona debe ser válido y único
    if (formData.email && formErrors.email) {
      errors.push(`Email: ${formErrors.email}`);
    }

    if (formData.email && !isEmailUnique) {
      errors.push("El email ya está registrado.");
    }

    if (!isCurpVerified) {
      errors.push("La CURP debe ser verificada.");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones previas al envío
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
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
        last_name: `${formData.paternal_last_name} ${formData.maternal_last_name}`.trim(),
        email: formData.email,
        phone_number: formData.phone_number,
        curp: formData.curp,
        birth_date: formData.birth_date || null,
        roles: roles,
        associate_data: {
          name: `${formData.first_name} ${formData.paternal_last_name} ${formData.maternal_last_name}`.trim(),
          level_id: parseInt(formData.level_id, 10),
          contact_person: `${formData.first_name} ${formData.paternal_last_name}`.trim(),
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
      console.error('Error completo en el registro de asociado:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);

      let errorMessage = 'Ocurrió un error inesperado al crear el asociado.';
      let validationErrorsList = [];

      // Manejo específico por código de estado
      if (err.response?.status === 409) {
        errorMessage = 'Conflicto: Ya existe un registro con esos datos (CURP, email, teléfono o username duplicado).';
      } else if (err.response?.status === 422) {
        if (err.response?.data?.detail) {
          const detail = err.response.data.detail;
          console.log('Detail type:', typeof detail);
          console.log('Detail content:', detail);

          // Si detail es un array de objetos de validación (FastAPI)
          if (Array.isArray(detail)) {
            validationErrorsList = detail.map(error => {
              if (typeof error === 'object' && error !== null) {
                const location = error.loc ? error.loc.join('.') : 'campo desconocido';
                const message = error.msg || 'Error de validación';
                return `${location}: ${message}`;
              }
              return String(error);
            });
            setValidationErrors(validationErrorsList);
            return; // No mostrar error general, solo el modal
          }

          // Si detail es un string
          if (typeof detail === 'string') {
            errorMessage = detail;
          }

          // Si detail es un objeto, intentar extraer mensaje
          if (typeof detail === 'object' && detail !== null) {
            errorMessage = detail.message || detail.msg || 'Error de validación del servidor';
          }
        }
      }

      // Manejo mejorado de errores para evitar mostrar "Object"
      if (typeof err.response?.data === 'object' && err.response?.data !== null) {
        console.log('Manejo de error object:', err.response.data);
        // No imprimir el objeto directamente en el console.log general
      } else {
        console.error('Error de registro:', err.message || 'Error desconocido');
      }

      setError(errorMessage);
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

      {/* Modal de CURP */}
      <CurpModal
        modalState={modalState}
        onConfirm={handleCurpModalConfirm}
        onCancel={handleCurpModalCancel}
        onCurpChange={handleCurpModalChange}
        onCloseResult={handleCloseResult}
      />

      <form onSubmit={handleSubmit} className="form-container">
        {/* INFORMACIÓN PERSONAL - PRIMERA SECCIÓN */}
        <CollapsibleSection title="Datos Personales y de Identificación" defaultOpen={true}>
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
              {formErrors.first_name && <span className="error-message">{formErrors.first_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Apellido Paterno *</label>
              <input
                type="text"
                name="paternal_last_name"
                value={formData.paternal_last_name}
                onChange={handleChange}
                className="form-input"
                required
              />
              {formErrors.paternal_last_name && <span className="error-message">{formErrors.paternal_last_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Apellido Materno</label>
              <input
                type="text"
                name="maternal_last_name"
                value={formData.maternal_last_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Género</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Selecciona género</option>
                <option value="HOMBRE">Hombre</option>
                <option value="MUJER">Mujer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estado de Nacimiento</label>
              <select
                name="state_of_birth"
                value={formData.state_of_birth}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Selecciona un estado</option>
                {mexicoData.estados && mexicoData.estados.map(estado => (
                  <option key={estado.nombre} value={estado.nombre}>{estado.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">CURP *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  name="curp"
                  value={formData.curp}
                  readOnly
                  className="form-input"
                  placeholder="18 CARACTERES"
                  style={{ textTransform: 'uppercase', flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleVerifyCurp}
                  className="btn btn-secondary"
                  disabled={!formData.curp}
                >
                  Verificar
                </button>
              </div>
              {isCurpVerified ? (
                <span className="success-message">✓ CURP verificada</span>
              ) : (
                <span className="info-message">La CURP se genera automáticamente y debe ser verificada</span>
              )}
              {formErrors.curp && <span className="error-message">{formErrors.curp}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Opcional"
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              {!formErrors.email && formData.email && !isEmailUnique && <span className="error-message">Este email ya está registrado.</span>}
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
              {!formErrors.phone_number && !isPhoneUnique && <span className="error-message">Este teléfono ya está registrado.</span>}
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

        {/* CONFIGURACIÓN DE ASOCIADO */}
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
          <div className="checkbox-group">
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

        <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleFillTestData}
            className="btn btn-secondary"
            style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
          >
            Datos de Prueba
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="btn btn-secondary"
          >
            Limpiar Formulario
          </button>
          <button type="submit" className="btn btn-primary">
            Crear Asociado
          </button>
        </div>
      </form>

      {/* Modales */}
      <CurpModal
        modalState={modalState}
        onConfirm={handleCurpModalConfirm}
        onCancel={handleCurpModalCancel}
        onCurpChange={handleCurpModalChange}
        onCloseResult={handleCloseResult}
      />
      <ErrorModal
        errors={validationErrors}
        onClose={() => setValidationErrors([])}
      />
    </div>
  );
};

export default CreateAssociatePage;
