import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';
import EditAssociateModal from '../components/EditAssociateModal';
import './ClientsPage.css';

const AssociatesPage = () => {
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [editingAssociate, setEditingAssociate] = useState(null);

  const fetchAssociates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/associates/');
      setAssociates(response.data);
    } catch (err) {
      setError('No se pudieron cargar los asociados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await apiClient.post('/associates/', {
        name,
        contact_person: contactPerson,
        contact_email: contactEmail,
      });
      setName('');
      setContactPerson('');
      setContactEmail('');
      fetchAssociates();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al crear el asociado.');
    }
  };

  const handleDelete = async (associateId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este asociado?')) {
      return;
    }
    try {
      await apiClient.delete(`/associates/${associateId}`);
      fetchAssociates();
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el asociado.');
    }
  };

  const handleUpdateSuccess = () => {
    setEditingAssociate(null);
    fetchAssociates();
  };

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Asociados</h1>
      
      <h2>Añadir Nuevo Asociado</h2>
      <form onSubmit={handleCreate} className="client-form">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del Asociado" required />
        <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Persona de Contacto" />
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email de Contacto" />
        <button type="submit">Crear Asociado</button>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
      </form>

      <hr />

      <h2>Lista de Asociados</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {associates.map(assoc => (
            <tr key={assoc.id}>
              <td>{assoc.id}</td>
              <td>{assoc.name}</td>
              <td>{assoc.contact_person || 'N/A'}</td>
              <td>{assoc.contact_email || 'N/A'}</td>
              <td className="actions-cell">
                <Link to={`/associates/${assoc.id}/loans`}><button>Préstamos</button></Link>
                <button onClick={() => setEditingAssociate(assoc)}>Editar</button>
                <button onClick={() => handleDelete(assoc.id)} style={{ marginLeft: '5px' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingAssociate && (
        <EditAssociateModal
          associate={editingAssociate}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => setEditingAssociate(null)}
        />
      )}
    </div>
  );
};

export default AssociatesPage;