import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAssociateLevels, getAssociateDetails, updateAssociate } from '../services/associateService';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { ErrorModal } from '../components/ErrorModal';

const EditAssociatePage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    level_id: 1,
    contact_person: '',
    contact_email: '',
    default_commission_rate: 5.0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [levels, setLevels] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carga de datos del asociado y niveles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Cargar datos del asociado
        const associateResponse = await getAssociateDetails(id);
        setFormData({
          name: associateResponse.data.name || '',
          level_id: associateResponse.data.level_id || 1,
          contact_person: associateResponse.data.contact_person || '',
          contact_email: associateResponse.data.contact_email || '',
          default_commission_rate: associateResponse.data.default_commission_rate || 5.0,
        });

        // Cargar niveles
        const levelsResponse = await getAssociateLevels();
        setLevels(levelsResponse.data || []);
      } catch (err) {
        console.error('Error al cargar los datos:', err);
        setError('No se pudieron cargar los datos del asociado.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateEmail = (email) => {
    if (!email) return true; // Email es opcional
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validaciones en tiempo real
    if (name === 'contact_email' && value) {
      if (!validateEmail(value)) {
        setFormErrors(prev => ({ ...prev, contact_email: 'El formato del email es incorrecto.' }));
      } else {
        setFormErrors(prev => ({ ...prev, contact_email: '' }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name) {
      errors.name = 'El nombre es obligatorio';
      isValid = false;
    }

    if (formData.contact_email && !validateEmail(formData.contact_email)) {
      errors.contact_email = 'El formato del email es incorrecto';
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
      await updateAssociate(id, {
        name: formData.name,
        level_id: parseInt(formData.level_id, 10),
        contact_person: formData.contact_person,
        contact_email: formData.contact_email,
        default_commission_rate: parseFloat(formData.default_commission_rate),
      });

      setSuccess('¡Asociado actualizado con éxito! Redirigiendo a la lista de asociados...');
      setTimeout(() => {
        navigate('/associates');
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ocurrió un error inesperado al actualizar el asociado.';
      setError(errorMessage);
      console.error('Error en la actualización del asociado:', err.response);
    }
  };

  if (loading) {
    return <div className="loading-indicator">Cargando datos del asociado...</div>;
  }

  return (
    <div className="clients-page">
      <Link to="/associates" className="back-link">← Volver a Asociados</Link>
      <h1>Editar Asociado</h1>

      {/* Modal de errores */}
      {showErrorModal && (
        <ErrorModal
          title="Error en el formulario"
          message="Por favor, corrija los errores en el formulario antes de continuar."
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="user-form">
        <CollapsibleSection title="Información de Asociado" defaultOpen={true}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            {formErrors.name && <span className="field-error-message">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label>Nivel de Asociado</label>
            <select name="level_id" value={formData.level_id} onChange={handleChange} required>
              {levels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name} (Max: ${level.max_loan_amount?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Información de Contacto" defaultOpen={true}>
          <div className="form-group">
            <label>Persona de Contacto</label>
            <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email de Contacto</label>
            <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} />
            {formErrors.contact_email && <span className="field-error-message">{formErrors.contact_email}</span>}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Configuración de Comisión" defaultOpen={true}>
          <div className="form-group">
            <label>Tasa de Comisión por Defecto (%)</label>
            <input type="number" step="0.01" min="0" max="100" name="default_commission_rate" value={formData.default_commission_rate} onChange={handleChange} required />
          </div>
        </CollapsibleSection>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="modal-actions">
          <button type="submit" className="primary-button">Actualizar Asociado</button>
        </div>
      </form>
    </div>
  );
};

export default EditAssociatePage;
