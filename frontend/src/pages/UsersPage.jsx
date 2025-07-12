import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import './ClientsPage.css'; // Reutilizamos los estilos
import { useAuth } from '../context/AuthContext';
import EditUserModal from '../components/EditUserModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await apiClient.delete(`/auth/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        setError(err.response?.data?.detail || 'No se pudo eliminar el usuario.');
      }
    }
  };

  const handleUpdateSuccess = (updatedUser) => {
    setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    setEditingUser(null);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <h1>Usuarios del Sistema</h1>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre de Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                <Link to={`/users/${u.id}`}>{u.username}</Link>
              </td>
              <td>
                {user.id === u.id && (
                  <button onClick={() => setEditingUser(u)}>Editar</button>
                )}
                {user.id !== u.id && (
                  <button onClick={() => handleDelete(u.id)}>Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
