import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import apiClient from '../services/api';
import CustomDatePicker from './DatePicker';
import { generateCurp } from '../utils/curp_generator';

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
  background: 'var(--color-background)',
  padding: '20px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflowY: 'auto',
  color: 'var(--color-text-primary)',
};

const CollapsibleSection = ({ title, children, isOpen, onClick }) => (
  <div className="collapsible-section">
    <button type="button" onClick={onClick} className="collapsible-header">
      {title} {isOpen ? '▲' : '▼'}
    </button>
    {isOpen && <div className="collapsible-content">{children}</div>}
  </div>
);

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return ReactDOM.createPortal(
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Confirmar Cambios</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm}>Confirmar</button>
          <button onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

const EditClientModal = ({ user, onUpdateSuccess, onClose }) => {
  const initialFormData = {
    email: user.email || '',
    phone_number: user.phone_number || '',
    profile_picture_url: user.profile_picture_url || '',
    password: '',
    confirmPassword: '',
    address: user.address || {
      street: '', external_number: '', internal_number: '',
      colony: '', municipality: '', state: '', zip_code: '',
    },
    guarantor: user.guarantor || {
      full_name: '', relationship: '', phone_number: '', curp: '',
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openSection, setOpenSection] = useState('contact');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  // Address state (similar to CreateClientPage)
  const [coloniaSuggestions, setColoniaSuggestions] = useState([]);
  const [addressError, setAddressError] = useState('');
  const [isApiDown, setIsApiDown] = useState(false);
  const [mexicoData, setMexicoData] = useState({ estados: [] });
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    fetch('/data/estados_municipios.json')
      .then(response => response.json())
      .then(data => {
        setMexicoData(data);
        // Si la API está caída desde el inicio, intentamos popular los municipios
        if (isApiDown && formData.address.state) {
          const selectedEstado = data.estados.find(e => e.nombre === formData.address.state);
          if (selectedEstado) {
            setMunicipios(selectedEstado.municipios);
          }
        }
      })
      .catch(error => console.error("Error al cargar datos de México:", error));
  }, [isApiDown, formData.address.state]);

  useEffect(() => {
    if (formData.address.zip_code && formData.address.zip_code.length === 5) {
      const fetchAddressInfo = async () => {
        setAddressError('');
        setIsApiDown(false);
        try {
          const response = await apiClient.get(`/utils/zip-code/${formData.address.zip_code}`);
          const { estado, municipio, colonias } = response.data;
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              state: estado,
              municipality: municipio,
              colony: (prev.address.zip_code === user.address?.zip_code && user.address?.colony) ? user.address.colony : '',
            }
          }));
          setColoniaSuggestions(colonias);
        } catch (error) {
          setAddressError('Servicio de CP no disponible. Por favor, introduzca los datos manualmente.');
          setIsApiDown(true);
          const currentState = user.address?.state || '';
          const currentMunicipality = user.address?.municipality || '';
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              state: currentState,
              municipality: currentMunicipality,
              colony: user.address?.colony || '',
            }
          }));
          if (currentState && mexicoData.estados.length > 0) {
            const selectedEstado = mexicoData.estados.find(e => e.nombre === currentState);
            if (selectedEstado) {
              setMunicipios(selectedEstado.municipios);
            }
          }
          setColoniaSuggestions([]);
        }
      };
      fetchAddressInfo();
    }
  }, [formData.address.zip_code]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
      if (addressField === "state" && isApiDown) {
        const selectedEstado = mexicoData.estados.find(e => e.nombre === value);
        setMunicipios(selectedEstado ? selectedEstado.municipios : []);
        setFormData(prev => ({ ...prev, address: { ...prev.address, municipality: '' } }));
      }
    } else if (name.startsWith('guarantor.')) {
      const guarantorField = name.split('.')[1];
      let finalValue = value;
      
      // Limpiar teléfono (solo dígitos, máximo 10)
      if (guarantorField === 'phone_number') {
        finalValue = value.replace(/\D/g, '').slice(0, 10);
      }
      
      // Convertir CURP a mayúsculas
      if (guarantorField === 'curp') {
        finalValue = value.toUpperCase();
      }
      
      setFormData(prev => ({
        ...prev,
        guarantor: {
          ...prev.guarantor,
          [guarantorField]: finalValue
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'password' && value.length > 0 && value.length < 8) {
      errorMsg = 'Debe tener al menos 8 caracteres.';
    } else if (name === 'confirmPassword' && value !== formData.password) {
      errorMsg = 'Las contraseñas no coinciden.';
    }
    setFormErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const generateConfirmationMessage = () => {
    const changes = [];

    // Comparar campos de contacto y seguridad
    if (formData.email !== initialFormData.email) changes.push(`Email: de '${initialFormData.email || 'N/A'}' a '${formData.email || 'N/A'}'`);
    if (formData.phone_number !== initialFormData.phone_number) changes.push(`Teléfono: de '${initialFormData.phone_number || 'N/A'}' a '${formData.phone_number || 'N/A'}'`);
    if (formData.profile_picture_url !== initialFormData.profile_picture_url) changes.push(`URL Foto de Perfil: de '${initialFormData.profile_picture_url || 'N/A'}' a '${formData.profile_picture_url || 'N/A'}'`);
    if (formData.password) changes.push(`Contraseña: Se ha cambiado`);

    // Comparar campos de dirección
    const addressFields = ['street', 'external_number', 'internal_number', 'colony', 'municipality', 'state', 'zip_code'];
    addressFields.forEach(field => {
      if (formData.address[field] !== initialFormData.address[field]) {
        changes.push(`Dirección (${field}): de '${initialFormData.address[field] || 'N/A'}' a '${formData.address[field] || 'N/A'}'`);
      }
    });

    // Comparar campos de aval
    const guarantorFields = ['full_name', 'relationship', 'phone_number', 'curp'];
    guarantorFields.forEach(field => {
      if (formData.guarantor[field] !== initialFormData.guarantor[field]) {
        changes.push(`Aval (${field}): de '${initialFormData.guarantor[field] || 'N/A'}' a '${formData.guarantor[field] || 'N/A'}'`);
      }
    });

    if (changes.length === 0) return "No se detectaron cambios.";
    return "Se realizarán los siguientes cambios:\n" + changes.join("\n");
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const message = generateConfirmationMessage();
    if (message === "No se detectaron cambios.") {
      onClose(); // Si no hay cambios, simplemente cierra el modal
      return;
    }
    setConfirmationMessage(message);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    const updateData = {
      email: formData.email,
      phone_number: formData.phone_number,
      profile_picture_url: formData.profile_picture_url,
      password: formData.password || undefined,
      address: formData.address.zip_code ? formData.address : undefined,
      guarantor: (formData.guarantor.full_name || formData.guarantor.relationship || formData.guarantor.phone_number || formData.guarantor.curp) ? formData.guarantor : undefined,
    };

    try {
      const response = await apiClient.put(`/auth/users/${user.id}`, updateData);
      onUpdateSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el usuario.');
    }
  };

  return ReactDOM.createPortal(
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Usuario: {user.username}</h2>
        <form onSubmit={handlePreSubmit} className="user-form">
          {/* Sección de Información Personal (Solo Lectura) */}
          <CollapsibleSection title="1. Información Personal" isOpen={openSection === 'personal'} onClick={() => setOpenSection('personal')}>
            <div className="form-group">
              <label>Nombre de Usuario:</label>
              <input type="text" value={user.username} readOnly disabled />
            </div>
            <div className="form-group">
              <label>Nombre(s):</label>
              <input type="text" value={user.first_name} readOnly disabled />
            </div>
            <div className="form-group">
              <label>Apellido(s):</label>
              <input type="text" value={user.last_name} readOnly disabled />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento:</label>
              <input type="text" value={user.birth_date} readOnly disabled />
            </div>
            <div className="form-group">
              <label>CURP:</label>
              <input type="text" value={user.curp} readOnly disabled />
            </div>
          </CollapsibleSection>

          {/* Sección de Contacto y Seguridad (Editable) */}
          <CollapsibleSection title="2. Contacto y Seguridad" isOpen={openSection === 'contact'} onClick={() => setOpenSection('contact')}>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Teléfono:</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} maxLength="10" />
            </div>
            <div className="form-group">
              <label>URL Foto de Perfil:</label>
              <input type="text" name="profile_picture_url" value={formData.profile_picture_url} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nueva Contraseña:</label>
              <div className="password-input-container">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-button" title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                </button>
              </div>
              {formErrors.password && <span className="field-error-message">{formErrors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña:</label>
              <div className="password-input-container">
                <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-button" title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                </button>
              </div>
              {formErrors.confirmPassword && <span className="field-error-message">{formErrors.confirmPassword}</span>}
            </div>
          </CollapsibleSection>

          {/* Sección de Dirección (Editable) */}
          <CollapsibleSection title="3. Dirección" isOpen={openSection === 'address'} onClick={() => setOpenSection('address')}>
            <div className="form-group">
              <label>Código Postal:</label>
              <input type="text" name="address.zip_code" value={formData.address.zip_code} onChange={handleChange} maxLength="5" />
              {addressError && <span className="field-error-message">{addressError}</span>}
            </div>
            <div className="form-group">
              <label>Estado:</label>
              {isApiDown ? (
                <select name="address.state" value={formData.address.state} onChange={handleChange}>
                  <option value="">Seleccione un estado</option>
                  {mexicoData.estados.map(e => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)} 
                </select>
              ) : (
                <input type="text" name="address.state" value={formData.address.state} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Municipio:</label>
              {isApiDown ? (
                <select name="address.municipality" value={formData.address.municipality} onChange={handleChange} disabled={!formData.address.state}>
                  <option value="">Seleccione un municipio</option>
                  {municipios.map(m => <option key={m} value={m}>{m}</option>)} 
                </select>
              ) : (
                <input type="text" name="address.municipality" value={formData.address.municipality} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Colonia:</label>
              {isApiDown ? (
                <input type="text" name="address.colony" value={formData.address.colony} onChange={handleChange} />
              ) : (
                <select name="address.colony" value={formData.address.colony} onChange={handleChange}>
                  <option value="">Seleccione una colonia</option>
                  {coloniaSuggestions.map((colonia, index) => <option key={index} value={colonia}>{colonia}</option>)} 
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Calle:</label>
              <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Número Exterior:</label>
              <input type="text" name="address.external_number" value={formData.address.external_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Número Interior:</label>
              <input type="text" name="address.internal_number" value={formData.address.internal_number} onChange={handleChange} />
            </div>
          </CollapsibleSection>

          {/* Sección de Beneficiarios (Solo Visualización/Gestión Externa) */}
          <CollapsibleSection title="4. Beneficiarios" isOpen={openSection === 'beneficiaries'} onClick={() => setOpenSection('beneficiaries')}>
            {user.beneficiaries && user.beneficiaries.length > 0 ? (
              user.beneficiaries.map(ben => (
                <div key={ben.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <p><strong>Nombre:</strong> {ben.full_name}</p>
                  <p><strong>Parentesco:</strong> {ben.relationship}</p>
                  <p><strong>Teléfono:</strong> {ben.phone_number}</p>
                </div>
              ))
            ) : (
              <p>No hay beneficiarios registrados.</p>
            )}
            <button type="button" style={{ marginTop: '10px' }}>Gestionar Beneficiarios</button>
          </CollapsibleSection>

          {/* Sección de Aval (Editable) */}
          <CollapsibleSection title="5. Aval" isOpen={openSection === 'guarantor'} onClick={() => setOpenSection('guarantor')}>
            <div className="form-group">
              <label>Nombre Completo del Aval:</label>
              <input 
                type="text" 
                name="guarantor.full_name" 
                value={formData.guarantor.full_name} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Parentesco:</label>
              <input 
                type="text" 
                name="guarantor.relationship" 
                value={formData.guarantor.relationship} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Teléfono del Aval:</label>
              <input 
                type="text" 
                name="guarantor.phone_number" 
                value={formData.guarantor.phone_number} 
                onChange={handleChange} 
                maxLength="10"
              />
            </div>
            <div className="form-group">
              <label>CURP del Aval:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="text" 
                  name="guarantor.curp" 
                  value={formData.guarantor.curp} 
                  onChange={handleChange} 
                  maxLength="18" 
                  style={{ textTransform: 'uppercase' }}
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (formData.guarantor.full_name) {
                      // Generar CURP automática con datos ficticios para el aval
                      const parts = formData.guarantor.full_name.split(' ');
                      const nombre = parts[0] || '';
                      const apellidoPaterno = parts[1] || '';
                      const apellidoMaterno = parts[2] || '';
                      
                      const curp = generateCurp({
                        nombre,
                        apellidoPaterno,
                        apellidoMaterno,
                        fechaNacimiento: '1980-01-01', // Fecha ficticia
                        sexo: 'HOMBRE', // Sexo ficticio
                        estadoNacimiento: 'CHIHUAHUA' // Estado ficticio
                      });
                      
                      setFormData(prev => ({
                        ...prev,
                        guarantor: {
                          ...prev.guarantor,
                          curp: curp
                        }
                      }));
                    }
                  }}
                  disabled={!formData.guarantor.full_name}
                  title="Genera una CURP automática basada en el nombre del aval"
                >
                  Generar CURP
                </button>
              </div>
              <small style={{ color: '#888', fontSize: '0.85em' }}>
                La CURP se genera automáticamente con datos ficticios. Puedes editarla manualmente.
              </small>
            </div>
          </CollapsibleSection>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="submit">Guardar Cambios</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
      {showConfirmation && (
        <ConfirmationModal 
          message={confirmationMessage} 
          onConfirm={handleConfirmSubmit} 
          onCancel={() => setShowConfirmation(false)} 
        />
      )}
    </div>,
    document.getElementById('modal-root')
  );
};

export default EditClientModal;
