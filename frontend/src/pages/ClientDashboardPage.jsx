import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ClientsPage.css'; // Reutilizamos estilos

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/auth/me/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError('No se pudo cargar la información de tu dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Cargando tu información...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!dashboardData) {
    return <p>No hay datos disponibles.</p>;
  }

  const { summary, loans, recent_payments } = dashboardData;

  return (
    <div className="clients-page">
      <h1>Mi Portal</h1>
      <p>Bienvenido, {user.username}. Aquí tienes un resumen de tu actividad.</p>

      <div className="summary-container" style={{ margin: '20px 0', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div className="summary-card">
          <h3>Préstamos Activos</h3>
          <p>{summary.active_loans_count}</p>
        </div>
        <div className="summary-card">
          <h3>Saldo Pendiente Total</h3>
          <p>${summary.total_outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <hr />

      <h2>Mis Préstamos</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID Préstamo</th>
            <th>Monto Original</th>
            <th>Saldo Pendiente</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>${loan.amount.toLocaleString('en-US')}</td>
              <td>${loan.outstanding_balance.toLocaleString('en-US')}</td>
              <td><span className={`status-badge status-${loan.status}`}>{loan.status}</span></td>
              <td>
                <Link to={`/loans/${loan.id}`}><button>Ver Detalles</button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <h2>Mis Pagos Recientes</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID Pago</th>
            <th>ID Préstamo</th>
            <th>Monto Pagado</th>
            <th>Fecha de Pago</th>
          </tr>
        </thead>
        <tbody>
          {recent_payments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>{payment.loan_id}</td>
              <td>${payment.amount_paid.toLocaleString('en-US')}</td>
              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientDashboardPage;
