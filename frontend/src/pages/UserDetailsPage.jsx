import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import './ClientsPage.css'; // Reutilizamos los estilos

const UserDetailsPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get(`/auth/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError('No se pudo cargar el usuario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/users">← Volver a Usuarios</Link>
      <h1>Detalles del Usuario</h1>
      {user && (
        <div>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Nombre de Usuario:</strong> {user.username}</p>
          <Link to={`/users/${user.id}/loans`}>Ver Préstamos</Link>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;
