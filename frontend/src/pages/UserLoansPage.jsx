import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';

const UserLoansPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, loansRes] = await Promise.all([
          apiClient.get(`/auth/users/${userId}`),
          apiClient.get(`/loans/?user_id=${userId}`),
        ]);
        
        setUser(userRes.data);
        setLoans(loansRes.data);

      } catch (err) {
        setError('No se pudieron cargar los datos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const summary = useMemo(() => {
    if (!loans || loans.length === 0) return null;
    return loans.reduce((acc, loan) => {
      acc.total_loans += 1;
      if (loan.status === 'active') acc.active_loans += 1;
      acc.total_loaned_amount += parseFloat(loan.amount);
      acc.total_outstanding_balance += parseFloat(loan.outstanding_balance);
      return acc;
    }, { total_loans: 0, active_loans: 0, total_loaned_amount: 0, total_outstanding_balance: 0 });
  }, [loans]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/users">← Volver a Usuarios</Link>
      <h1>Préstamos del Usuario: {user?.username} ({user?.first_name} {user?.last_name})</h1>

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
            <p>${summary.total_loaned_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="summary-card">
            <h3>Saldo Pendiente Total</h3>
            <p>${summary.total_outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      <hr />

      <h2>Historial de Préstamos</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID Préstamo</th>
            <th>Monto</th>
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
              <td>${parseFloat(loan.amount).toLocaleString('en-US')}</td>
              <td>${parseFloat(loan.outstanding_balance).toLocaleString('en-US')}</td>
              <td><span className={`status-badge status-${loan.status}`}>{loan.status}</span></td>
              <td>
                <Link to={`/loans/${loan.id}`}><button>Ver Detalles</button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserLoansPage;
