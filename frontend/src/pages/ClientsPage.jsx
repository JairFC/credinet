import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import EditClientModal from '../components/EditClientModal';
import './ClientsPage.css';

const ClientsPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [editingClient, setEditingClient] = useState(null);

  // El rol 'asociado' no puede crear ni editar clientes.
  const canManage = user && user.role !== 'asociado';

  const fetchClients = async () => {
    try {
      setLoading(true);
      // El backend ahora filtra por el token, la llamada es la misma.
      const response = await apiClient.get('/clients/');
      setClients(response.data);
    } catch (err) {
      setError('No se pudieron cargar los clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!canManage) return; // Doble seguridad
    setFormError('');
    try {
      const clientData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      };
      await apiClient.post('/clients/', clientData);
      setFirstName('');
      setLastName('');
      setEmail('');
      fetchClients();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al crear el cliente.');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!canManage || (user && user.role === 'auxiliar_administrativo')) {
      alert('No tienes permiso para eliminar clientes.');
      return;
    }
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }
    try {
      await apiClient.delete(`/clients/${clientId}`);
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el cliente.');
    }
  };

  const handleUpdateSuccess = () => {
    setEditingClient(null);
    fetchClients();
  };

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Clientes</h1>
      
      {canManage && (
        <>
          <h2>Añadir Nuevo Cliente</h2>
          <form onSubmit={handleCreateClient} className="client-form">
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombre" required />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido" required />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <button type="submit">Crear Cliente</button>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
          </form>
          <hr />
        </>
      )}

      <h2>Lista de Clientes</h2>
      {loading && <p>Cargando clientes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Asociado Asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.first_name}</td>
              <td>{client.last_name}</td>
              <td>{client.email || 'N/A'}</td>
              <td>{client.associate_name || 'N/A'}</td>
              <td className="actions-cell">
                <Link to={`/clients/${client.id}/loans`}><button>Préstamos</button></Link>
                {canManage && (
                  <>
                    <button onClick={() => setEditingClient(client)} style={{ marginLeft: '5px' }}>Editar</button>
                    {user.role !== 'auxiliar_administrativo' && (
                       <button onClick={() => handleDeleteClient(client.id)} style={{ marginLeft: '5px' }}>Eliminar</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingClient && canManage && (
        <EditClientModal
          client={editingClient}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => setEditingClient(null)}
        />
      )}
    </div>
  );
};

export default ClientsPage;
