import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

const LoansWithPaymentsPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoansWithPayments = async () => {
      try {
        const response = await apiClient.get('/loans/with_payments');
        setLoans(response.data);
      } catch (err) {
        setError('No se pudieron cargar los préstamos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoansWithPayments();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard">← Volver al Dashboard</Link>
      <h1>Préstamos con Pagos</h1>
      {loans.map(loan => (
        <div key={loan.id} style={{ marginBottom: '2rem' }}>
          <h2>Préstamo #{loan.id}</h2>
          <p><strong>Cliente:</strong> {loan.client_first_name} {loan.client_last_name}</p>
          <p><strong>Monto:</strong> ${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <table className="clients-table">
            <thead>
              <tr>
                <th>ID Pago</th>
                <th>Monto Pagado</th>
                <th>Fecha de Pago</th>
              </tr>
            </thead>
            <tbody>
              {loan.payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>${parseFloat(payment.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default LoansWithPaymentsPage;
