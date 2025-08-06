import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ClientDetailsPage = () => {
  const { id } = useParams();

  return (
    <div>
      <Link to="/clients" className="back-link">← Volver a la Lista de Clientes</Link>
      <h1>Detalles del Cliente</h1>
      <p>Mostrando detalles para el cliente con ID: <strong>{id}</strong></p>
      {/* Aquí se mostrará la información detallada del cliente */}
    </div>
  );
};

export default ClientDetailsPage;
