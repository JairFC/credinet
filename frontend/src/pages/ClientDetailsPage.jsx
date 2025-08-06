import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserDetails } from '../services/api';

const ClientDetailsPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const response = await getUserDetails(id);
        setClient(response.data);
      } catch (err) {
        setError('No se pudieron cargar los detalles del cliente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!client) return <p>No se encontró el cliente.</p>;

  return (
    <div>
      <Link to="/clients" className="back-link">← Volver a la Lista de Clientes</Link>
      <h1>Detalles de {client.first_name} {client.last_name}</h1>
      <div className="client-details-grid">
        <div className="detail-item"><strong>ID:</strong> {client.id}</div>
        <div className="detail-item"><strong>Username:</strong> {client.username}</div>
        <div className="detail-item"><strong>Email:</strong> {client.email}</div>
        <div className="detail-item"><strong>Teléfono:</strong> {client.phone_number}</div>
        <div className="detail-item"><strong>CURP:</strong> {client.curp}</div>
        <div className="detail-item"><strong>Fecha de Nacimiento:</strong> {client.birth_date}</div>
        <div className="detail-item"><strong>Roles:</strong> {client.roles.join(', ')}</div>
        <div className="detail-item"><strong>Dirección:</strong> {`${client.address_street || ''} ${client.address_ext_num || ''}, ${client.address_colonia || ''}, ${client.address_zip_code || ''}, ${client.address_state || ''}`}</div>
      </div>
      {/* Aquí irán los botones de acción (Editar, Eliminar, etc.) */}
    </div>
  );
};

export default ClientDetailsPage;
