import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import './ClientsPage.css'; // Reutilizamos los estilos

const UserLoansPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, loansRes, summaryRes] = await Promise.all([
          apiClient.get(`/auth/users/${userId}`),
          apiClient.get(`/loans/?user_id=${userId}`),
          apiClient.get(`/loans/users/${userId}/summary`),
        ]);
        
        setUser(userRes.data);
        setLoans(loansRes.data);
        setSummary(summaryRes.data);

      } catch (err) {
        setError('No se pudieron cargar los datos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/users">← Volver a Usuarios</Link>
      <h1>Préstamos del Usuario: {user?.username}</h1>

      {summary && (
        <div className="summary-container">
          <div className="summary-card">
            <h3>Total Préstamos</h3>
            <p>{summary.total_loans}</p>
          </div>
          <div className="summary-card">
            <h3>Préstamos Activos</h3>
            <p>{summary.active_loans}</p>
          </div>
          <div className="summary-card">
            <h3>Monto Total Prestado</h3>
            <p>${summary.total_loaned_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="summary-card">
            <h3>Saldo Pendiente Total</h3>
            <p>${summary.total_outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      <hr />

      <h2>Historial de Préstamos</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID Préstamo</th>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Tasa de Interés</th>
            <th>Pagos</th>
            <th>Saldo Pendiente</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>
                <Link to={`/loans/${loan.id}`}>{loan.id}</Link>
              </td>
              <td>{loan.client_first_name} {loan.client_last_name}</td>
              <td>${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{loan.interest_rate.toFixed(2)}%</td>
              <td>{loan.payments_made} / {loan.payment_frequency === 'quincenal' ? loan.term_months * 2 : loan.term_months}</td>
              <td>${parseFloat(loan.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{loan.status}</td>
              <td>
                <Link to={`/loans/${loan.id}/payments`}><button>Ver Pagos</button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserLoansPage;
