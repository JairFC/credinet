import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';
import './ClientsPage.css'; // Reutilizamos estilos

const AssociateDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssociateDashboard = async () => {
      try {
        const response = await apiClient.get('/associates/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard de asociado.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssociateDashboard();
  }, []);

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!dashboardData) return <p>No hay datos disponibles.</p>;

  const { summary, loans, clients } = dashboardData;

  return (
    <div className="clients-page">
      <h1>Dashboard de Asociado</h1>
      
      <h2>Resumen de Actividad</h2>
      <div className="summary-container">
        <div className="summary-card">
          <h3>Total Préstamos</h3>
          <p>{summary.total_loans}</p>
        </div>
        <div className="summary-card">
          <h3>Monto Prestado</h3>
          <p>${summary.total_loaned_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="summary-card">
          <h3>Comisión Generada</h3>
          <p>${summary.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <hr />

      <h2>Mis Préstamos Originados</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{clients.find(c => c.id === loan.client_id)?.first_name || 'N/A'} {clients.find(c => c.id === loan.client_id)?.last_name || ''}</td>
              <td>${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{loan.status}</td>
              <td>
                <Link to={`/loans/${loan.id}`}><button>Ver Detalles</button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <h2>Mis Clientes</h2>
       <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.first_name} {client.last_name}</td>
              <td>{client.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssociateDashboardPage;
