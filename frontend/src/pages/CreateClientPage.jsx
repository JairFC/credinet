
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { generateCurp } from '../utils/curp_generator';

const CollapsibleSection = ({ title, sectionKey, children, isOpen, onClick }) => (
  <div className="collapsible-section">
    <button type="button" onClick={onClick} className="collapsible-header">
      {title} {isOpen ? '▲' : '▼'}
    </button>
    {isOpen && (
      <div className="collapsible-content">
        {children}
      </div>
    )}
  </div>
);

const CreateClientPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    paternal_last_name: '',
    maternal_last_name: '',
    email: '',
    phone_number: '',
    birth_date: '',
    gender: 'HOMBRE',
    state_of_birth: 'CHIHUAHUA',
    curp: '',
    address_zip_code: '',
    address_state: '',
    address_municipality: '',
    address_colonia: '',
    address_street: '',
    address_ext_num: ''
  });
  const [beneficiaryData, setBeneficiaryData] = useState({
    full_name: '',
    relationship: '',
    phone_number: '',
  });
  const [coloniaSuggestions, setColoniaSuggestions] = useState([]);
  const [addressError, setAddressError] = useState('');
  const [isBeneficiaryVisible, setIsBeneficiaryVisible] = useState(false);
  const [openSection, setOpenSection] = useState('account');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const {
      first_name,
      paternal_last_name,
      maternal_last_name,
      birth_date,
      gender,
      state_of_birth,
    } = formData;

    if (first_name && paternal_last_name && birth_date && gender && state_of_birth) {
      const curp = generateCurp({
        nombre: first_name,
        apellidoPaterno: paternal_last_name,
        apellidoMaterno: maternal_last_name,
        fechaNacimiento: birth_date,
        sexo: gender,
        estadoNacimiento: state_of_birth,
      });
      setFormData(prev => ({ ...prev, curp }));
    }
  }, [formData.first_name, formData.paternal_last_name, formData.maternal_last_name, formData.birth_date, formData.gender, formData.state_of_birth]);

  useEffect(() => {
    if (formData.address_zip_code.length === 5) {
      const fetchAddressInfo = async () => {
        setAddressError('');
        try {
          const response = await apiClient.get(`/utils/zip-code/${formData.address_zip_code}`);
          console.log('Respuesta de la API del backend:', response.data);
          const { estado, municipio, colonias } = response.data;
          
          setFormData(prev => ({
            ...prev,
            address_state: estado,
            address_municipality: municipio,
          }));
          setColoniaSuggestions(colonias);

        } catch (error) {
          setAddressError('Código Postal no encontrado o inválido.');
          setFormData(prev => ({
            ...prev,
            address_state: '',
            address_municipality: '',
          }));
          setColoniaSuggestions([]);
        }
      };
      fetchAddressInfo();
    }
  }, [formData.address_zip_code]);

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

        <CollapsibleSection title="Datos de la Cuenta" sectionKey="account" isOpen={openSection === 'account'} onClick={() => setOpenSection(openSection === 'account' ? null : 'account')}>
          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Datos Personales" sectionKey="personal" isOpen={openSection === 'personal'} onClick={() => setOpenSection(openSection === 'personal' ? null : 'personal')}>
          <div className="form-group">
            <label>Nombre(s)</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Apellido Paterno</label>
            <input type="text" name="paternal_last_name" value={formData.paternal_last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Apellido Materno</label>
            <input type="text" name="maternal_last_name" value={formData.maternal_last_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Género</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="HOMBRE">Hombre</option>
              <option value="MUJER">Mujer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Estado de Nacimiento</label>
            <select name="state_of_birth" value={formData.state_of_birth} onChange={handleChange} required>
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
            <label>CURP</label>
            <input type="text" name="curp" value={formData.curp} readOnly />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Datos de Contacto" sectionKey="contact" isOpen={openSection === 'contact'} onClick={() => setOpenSection(openSection === 'contact' ? null : 'contact')}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
            {formErrors.phone_number && <span className="field-error-message">{formErrors.phone_number}</span>}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Dirección" sectionKey="address" isOpen={openSection === 'address'} onClick={() => setOpenSection(openSection === 'address' ? null : 'address')}>
          <div className="form-group">
            <label>Código Postal</label>
            <input type="text" name="address_zip_code" value={formData.address_zip_code} onChange={handleChange} maxLength="5" required />
            {addressError && <span className="field-error-message">{addressError}</span>}
          </div>
          <div className="form-group">
            <label>Estado</label>
            <input type="text" name="address_state" value={formData.address_state} readOnly />
          </div>
          <div className="form-group">
            <label>Municipio</label>
            <input type="text" name="address_municipality" value={formData.address_municipality} readOnly />
          </div>
          <div className="form-group">
            <label>Colonia</label>
            <select name="address_colonia" value={formData.address_colonia} onChange={handleChange} required>
              <option value="">Seleccione una colonia</option>
              {coloniaSuggestions.map((colonia, index) => (
                <option key={index} value={colonia}>{colonia}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Calle</label>
            <input type="text" name="address_street" value={formData.address_street} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Número Exterior</label>
            <input type="text" name="address_ext_num" value={formData.address_ext_num} onChange={handleChange} required />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Beneficiario (Opcional)" sectionKey="beneficiary" isOpen={openSection === 'beneficiary'} onClick={() => setOpenSection(openSection === 'beneficiary' ? null : 'beneficiary')}>
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
        </CollapsibleSection>
        
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
