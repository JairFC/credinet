import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import EditClientModal from '../components/EditClientModal';
import './ClientsPage.css'; // Importar el archivo CSS

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado para el formulario de nuevo cliente
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [formError, setFormError] = useState('');
  const [editingClient, setEditingClient] = useState(null);

  const fetchClientsAndUsers = async () => {
    try {
      setLoading(true);
      const [clientsRes, usersRes] = await Promise.all([
        apiClient.get('/clients/'),
        apiClient.get('/auth/users')
      ]);
      setClients(clientsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsAndUsers();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const clientData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      };
      if (selectedUser) {
        clientData.user_id = parseInt(selectedUser);
      }
      await apiClient.post('/clients/', clientData);
      // Limpiar formulario y recargar la lista
      setFirstName('');
      setLastName('');
      setEmail('');
      setSelectedUser('');
      fetchClientsAndUsers();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al crear el cliente.');
    }
  };

  const handleDeleteClient = async (clientId) => {
    // Pedir confirmación al usuario
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await apiClient.delete(`/clients/${clientId}`);
      fetchClients(); // Recargar la lista de clientes
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el cliente.');
    }
  };

  const handleUpdateSuccess = () => {
    setEditingClient(null); // Cierra el modal
    fetchClients(); // Recarga la lista
  };

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Clientes</h1>
      
      <h2>Añadir Nuevo Cliente</h2>
      <form onSubmit={handleCreateClient} className="client-form">
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombre" required />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">-- Asignar a Usuario (opcional) --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <button type="submit">Crear Cliente</button>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
      </form>

      <hr />

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
                <button onClick={() => setEditingClient(client)} style={{ marginLeft: '5px' }}>Editar</button>
                <button onClick={() => handleDeleteClient(client.id)} style={{ marginLeft: '5px' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingClient && (
        <EditClientModal
          client={editingClient}
          users={users}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => setEditingClient(null)}
        />
      )}
    </div>
  );
};

export default ClientsPage;