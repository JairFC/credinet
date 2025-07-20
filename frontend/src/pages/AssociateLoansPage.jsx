import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const AssociateLoansPage = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // La API filtra automáticamente por el associate_id del token
        const loansRes = await apiClient.get('/loans/');
        setLoans(loansRes.data.items);
      } catch (err) {
        setError('No se pudieron cargar los préstamos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, [user]);

  if (loading) return <p>Cargando mis préstamos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Mis Préstamos Originados</h1>

      <table className="clients-table">
        <thead>
          <tr>
            <th>ID Préstamo</th>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Saldo Pendiente</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.user_first_name} {loan.user_last_name}</td>
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

export default AssociateLoansPage;
