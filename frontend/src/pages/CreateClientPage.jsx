
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { generateCurp } from '../utils/curp_generator';

// --- Sub-Components ---

const CollapsibleSection = ({ title, children, isOpen, onClick }) => (
  <div className="collapsible-section">
    <button type="button" onClick={onClick} className="collapsible-header">
      {title} {isOpen ? '▲' : '▼'}
    </button>
    {isOpen && <div className="collapsible-content">{children}</div>}
  </div>
);

// Estilos definidos como objetos de JavaScript para garantizar que no haya conflictos
const modalStyles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    background: '#2a2a2a',
    color: 'rgba(255, 255, 255, 0.9)',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.4)',
    border: '1px solid #444',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '25px',
  }
};

const CurpModal = ({ modalState, onConfirm, onCancel, onCurpChange, onCloseResult }) => {
  if (!modalState.isOpen) return null;

  return ReactDOM.createPortal(
    <div style={modalStyles.backdrop}>
      <div style={modalStyles.content}>
        {modalState.step === 'confirm' && (
          <>
            <h2>Verificar CURP</h2>
            <p>Por favor, confirma la CURP generada. Si es necesario, corrige la homoclave (los dos últimos caracteres).</p>
            <input 
              type="text" 
              value={modalState.curp} 
              onChange={onCurpChange}
              maxLength="18"
              className="form-control"
              style={{ textTransform: 'uppercase' }}
            />
            <div style={modalStyles.actions}>
              <button onClick={onConfirm}>Confirmar y Verificar</button>
              <button onClick={onCancel} type="button">Cancelar</button>
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
            <div style={modalStyles.actions}>
              <button onClick={onCloseResult}>Entendido</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};


// --- Main Page Component ---

const CreateClientPage = () => {
  // --- State Management ---
  const [formData, setFormData] = useState({
    username: '', password: '', confirmPassword: '',
    first_name: '', paternal_last_name: '', maternal_last_name: '',
    email: '', phone_number: '', birth_date: '',
    gender: 'HOMBRE', state_of_birth: 'CHIHUAHUA', curp: '',
    address_zip_code: '', address_state: '', address_municipality: '',
    address_colonia: '', address_street: '', address_ext_num: ''
  });
  const [beneficiaryData, setBeneficiaryData] = useState({ full_name: '', relationship: '', phone_number: '' });
  const [formErrors, setFormErrors] = useState({});
  const [curpError, setCurpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // CURP validation state
  const [isCurpVerified, setIsCurpVerified] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, step: 'confirm', curp: '', result: { message: '', type: '' } });

  // Address state
  const [coloniaSuggestions, setColoniaSuggestions] = useState([]);
  const [addressError, setAddressError] = useState('');
  const [isApiDown, setIsApiDown] = useState(false);
  const [mexicoData, setMexicoData] = useState({ estados: [] });
  const [municipios, setMunicipios] = useState([]);

  // UI and Navigation state
  const [openSection, setOpenSection] = useState('personal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // --- Form Validation ---
  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'username':
        if (value.length > 0 && value.length < 4) errorMsg = 'Debe tener al menos 4 caracteres.';
        break;
      case 'password':
        if (value.length > 0 && value.length < 8) errorMsg = 'Debe tener al menos 8 caracteres.';
        break;
      case 'confirmPassword':
        if (value !== formData.password) errorMsg = 'Las contraseñas no coinciden.';
        break;
      case 'phone_number':
        if (value.length > 0 && !/^\d{10}$/.test(value)) errorMsg = 'Debe ser un número de 10 dígitos.';
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const isFormValid = () => {
    const requiredFields = ['username', 'password', 'first_name', 'paternal_last_name', 'phone_number'];
    const hasNoErrors = Object.values(formErrors).every(err => !err);
    const allRequiredFilled = requiredFields.every(field => formData[field]);
    return hasNoErrors && allRequiredFilled && isCurpVerified;
  };

  // --- Data Fetching and Effects ---
  useEffect(() => {
    fetch('/data/estados_municipios.json')
      .then(response => response.json())
      .then(data => setMexicoData(data))
      .catch(error => console.error("Error al cargar datos de México:", error));
  }, []);

  useEffect(() => {
    const { first_name, paternal_last_name, maternal_last_name, birth_date, gender, state_of_birth } = formData;
    if (first_name && paternal_last_name && birth_date && gender && state_of_birth) {
      const curp = generateCurp({ nombre: first_name, apellidoPaterno: paternal_last_name, apellidoMaterno: maternal_last_name, fechaNacimiento: birth_date, sexo: gender, estadoNacimiento: state_of_birth });
      setFormData(prev => ({ ...prev, curp }));
      setIsCurpVerified(false);
    }
  }, [formData.first_name, formData.paternal_last_name, formData.maternal_last_name, formData.birth_date, formData.gender, formData.state_of_birth]);

  useEffect(() => {
    if (formData.address_zip_code.length === 5) {
      const fetchAddressInfo = async () => {
        setAddressError('');
        setIsApiDown(false);
        try {
          const response = await apiClient.get(`/utils/zip-code/${formData.address_zip_code}`);
          const { estado, municipio, colonias } = response.data;
          setFormData(prev => ({ ...prev, address_state: estado, address_municipality: municipio, address_colonia: '' }));
          setColoniaSuggestions(colonias);
        } catch (error) {
          setAddressError('Servicio de CP no disponible. Por favor, introduzca los datos manualmente.');
          setIsApiDown(true);
          setFormData(prev => ({ ...prev, address_state: '', address_municipality: '', address_colonia: '' }));
          setColoniaSuggestions([]);
        }
      };
      fetchAddressInfo();
    }
  }, [formData.address_zip_code]);

  // Autogenerate username
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
              setFormData(prev => ({ ...prev, username: finalUsername }));
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

    const timer = setTimeout(() => {
      generateAndCheckUsername();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.first_name, formData.paternal_last_name]);

  // Autogenerate password from CURP
  useEffect(() => {
    if (formData.curp.length === 18) {
      setFormData(prev => ({
        ...prev,
        password: prev.curp,
        confirmPassword: prev.curp
      }));
    }
  }, [formData.curp]);

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    if (name === "address_state" && isApiDown) {
      const selectedEstado = mexicoData.estados.find(e => e.nombre === value);
      setMunicipios(selectedEstado ? selectedEstado.municipios : []);
      setFormData(prev => ({ ...prev, address_municipality: '' }));
    }
  };
  
  const handleBeneficiaryChange = (e) => {
    const { name, value } = e.target;
    setBeneficiaryData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurpChange = (e) => {
    const newCurp = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, curp: newCurp }));
    setIsCurpVerified(false);
    if (newCurp.length > 0) {
      setCurpError('');
    }
  };

  const handleVerifyClick = () => {
    if (formData.curp.length !== 18) {
      setCurpError('La CURP debe tener 18 caracteres para poder ser verificada.');
      return;
    }
    setCurpError('');
    setModalState({ isOpen: true, step: 'confirm', curp: formData.curp, result: { message: '', type: '' } });
  };

  const handleModalCurpChange = (e) => {
    setModalState(prev => ({ ...prev, curp: e.target.value.toUpperCase() }));
  };

  const handleCancelModal = () => {
    setModalState({ isOpen: false, step: 'confirm', curp: '', result: { message: '', type: '' } });
  };

  const handleConfirmCurp = async () => {
    setModalState(prev => ({ ...prev, step: 'loading' }));
    setFormData(prev => ({ ...prev, curp: modalState.curp }));
    
    let result = { message: '', type: '' };
    try {
      const response = await apiClient.get(`/utils/check-curp/${modalState.curp}`);
      if (response.data.exists) {
        result = { message: 'Esta CURP ya está registrada en el sistema.', type: 'error' };
        setIsCurpVerified(false);
      } else {
        result = { message: 'La CURP está disponible y ha sido validada.', type: 'success' };
        setIsCurpVerified(true);
      }
    } catch (err) {
      result = { message: 'No se pudo verificar la CURP en este momento. Intente más tarde.', type: 'error' };
      setIsCurpVerified(false);
    }
    setModalState(prev => ({ ...prev, step: 'result', result }));
  };

  const handleCloseResultModal = () => {
    const isSuccess = modalState.result.type === 'success';
    setModalState({ isOpen: false, step: 'confirm', curp: '', result: { message: '', type: '' } });
    if (isSuccess) {
      setFormData(prev => ({
        ...prev,
        password: prev.curp,
        confirmPassword: prev.curp
      }));
      setOpenSection('account'); // Move to the next section
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Por favor, complete todos los campos obligatorios (*) y verifique que la CURP esté disponible.");
      return;
    }
    setError('');
    setSuccess('');

    try {
      const userData = {
        ...formData,
        last_name: `${formData.paternal_last_name} ${formData.maternal_last_name}`.trim(),
        roles: ['cliente'],
        email: formData.email || null,
        beneficiary: beneficiaryData.full_name ? beneficiaryData : null,
      };
      delete userData.paternal_last_name;
      delete userData.maternal_last_name;
      delete userData.confirmPassword;

      await apiClient.post('/auth/users', userData);
      setSuccess('¡Cliente registrado con éxito! Redirigiendo...');
      setTimeout(() => navigate('/clients'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocurrió un error inesperado.');
    }
  };

  // --- Render --- 
  return (
    <div className="clients-page">
      <CurpModal modalState={modalState} onConfirm={handleConfirmCurp} onCancel={handleCancelModal} onCurpChange={handleModalCurpChange} onCloseResult={handleCloseResultModal} />
      
      <Link to="/clients" className="back-link">← Volver a Clientes</Link>
      <h1>Crear Nuevo Cliente</h1>
      <p>Los campos marcados con * son obligatorios.</p>

      <form onSubmit={handleSubmit} className="user-form">
        <CollapsibleSection title="1. Datos Personales y de Identificación" isOpen={openSection === 'personal'} onClick={() => setOpenSection('personal')}>
          <div className="form-group">
            <label>Nombre(s) *</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Apellido Paterno *</label>
            <input type="text" name="paternal_last_name" value={formData.paternal_last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Apellido Materno</label>
            <input type="text" name="maternal_last_name" value={formData.maternal_last_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Género</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="HOMBRE">Hombre</option>
              <option value="MUJER">Mujer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Estado de Nacimiento</label>
            <select name="state_of_birth" value={formData.state_of_birth} onChange={handleChange}>
                <option value="AGUASCALIENTES">AGUASCALIENTES</option>
                <option value="BAJA CALIFORNIA">BAJA CALIFORNIA</option>
                <option value="BAJA CALIFORNIA SUR">BAJA CALIFORNIA SUR</option>
                <option value="CAMPECHE">CAMPECHE</option>
                <option value="COAHUILA">COAHUILA</option>
                <option value="COLIMA">COLIMA</option>
                <option value="CHIAPAS">CHIAPAS</option>
                <option value="CHIHUAHUA">CHIHUAHUA</option>
                <option value="DISTRITO FEDERAL">DISTRITO FEDERAL</option>
                <option value="DURANGO">DURANGO</option>
                <option value="GUANAJUATO">GUANAJUATO</option>
                <option value="GUERRERO">GUERRERO</option>
                <option value="HIDALGO">HIDALGO</option>
                <option value="JALISCO">JALISCO</option>
                <option value="MEXICO">MEXICO</option>
                <option value="MICHOACAN">MICHOACAN</option>
                <option value="MORELOS">MORELOS</option>
                <option value="NAYARIT">NAYARIT</option>
                <option value="NUEVO LEON">NUEVO LEON</option>
                <option value="OAXACA">OAXACA</option>
                <option value="PUEBLA">PUEBLA</option>
                <option value="QUERETARO">QUERETARO</option>
                <option value="QUINTANA ROO">QUINTANA ROO</option>
                <option value="SAN LUIS POTOSI">SAN LUIS POTOSI</option>
                <option value="SINALOA">SINALOA</option>
                <option value="SONORA">SONORA</option>
                <option value="TABASCO">TABASCO</option>
                <option value="TAMAULIPAS">TAMAULIPAS</option>
                <option value="TLAXCALA">TLAXCALA</option>
                <option value="VERACRUZ">VERACRUZ</option>
                <option value="YUCATAN">YUCATAN</option>
                <option value="ZACATECAS">ZACATECAS</option>
                <option value="NACIDO EN EL EXTRANJERO">NACIDO EN EL EXTRANJERO</option>
            </select>
          </div>
          <div className="form-group">
            <label>CURP *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="text" name="curp" value={formData.curp} onChange={handleCurpChange} maxLength="18" style={{ textTransform: 'uppercase' }} required />
              <button type="button" onClick={handleVerifyClick}>Verificar</button>
            </div>
            {curpError && <span className="field-error-message" style={{ marginTop: '8px' }}>{curpError}</span>}
            {isCurpVerified && <span style={{color: '#51cf66', fontSize: '0.9em', fontWeight: 'bold', marginTop: '8px'}}>✅ CURP validada</span>}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="2. Datos de la Cuenta y Contacto" isOpen={openSection === 'account'} onClick={() => setOpenSection('account')}>
          <div className="form-group">
            <label>Nombre de Usuario *</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            {formErrors.username && <span className="field-error-message">{formErrors.username}</span>}
          </div>
          <div className="form-group">
            <label>Contraseña *</label>
            <div className="password-input-container">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-button" title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                👁️
              </button>
            </div>
            {formErrors.password && <span className="field-error-message">{formErrors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña *</label>
            <div className="password-input-container">
              <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-button" title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                👁️
              </button>
            </div>
            {formErrors.confirmPassword && <span className="field-error-message">{formErrors.confirmPassword}</span>}
          </div>
          <div className="form-group">
            <label>Teléfono *</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
            {formErrors.phone_number && <span className="field-error-message">{formErrors.phone_number}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="3. Dirección" isOpen={openSection === 'address'} onClick={() => setOpenSection('address')}>
          <div className="form-group">
            <label>Código Postal</label>
            <input type="text" name="address_zip_code" value={formData.address_zip_code} onChange={handleChange} maxLength="5" />
            {addressError && <span className="field-error-message">{addressError}</span>}
          </div>
          <div className="form-group">
            <label>Estado</label>
            {isApiDown ? (
              <select name="address_state" value={formData.address_state} onChange={handleChange}>
                <option value="">Seleccione un estado</option>
                {mexicoData.estados.map(e => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)} 
              </select>
            ) : (
              <input type="text" name="address_state" value={formData.address_state} readOnly />
            )}
          </div>
          <div className="form-group">
            <label>Municipio</label>
            {isApiDown ? (
              <select name="address_municipality" value={formData.address_municipality} onChange={handleChange} disabled={!formData.address_state}>
                <option value="">Seleccione un municipio</option>
                {municipios.map(m => <option key={m} value={m}>{m}</option>)} 
              </select>
            ) : (
              <input type="text" name="address_municipality" value={formData.address_municipality} readOnly />
            )}
          </div>
          <div className="form-group">
            <label>Colonia</label>
            {isApiDown ? (
              <input type="text" name="address_colonia" value={formData.address_colonia} onChange={handleChange} />
            ) : (
              <select name="address_colonia" value={formData.address_colonia} onChange={handleChange}>
                <option value="">Seleccione una colonia</option>
                {coloniaSuggestions.map((colonia, index) => <option key={index} value={colonia}>{colonia}</option>)} 
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Calle</label>
            <input type="text" name="address_street" value={formData.address_street} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Número Exterior</label>
            <input type="text" name="address_ext_num" value={formData.address_ext_num} onChange={handleChange} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="4. Beneficiario (Opcional)" isOpen={openSection === 'beneficiary'} onClick={() => setOpenSection('beneficiary')}>
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
          </div>
        </CollapsibleSection>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="modal-actions">
          <button type="submit" disabled={!isFormValid()}>Crear Cliente</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClientPage;
