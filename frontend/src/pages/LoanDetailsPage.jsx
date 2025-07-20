import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';

const LoanDetailsPage = () => {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const loanRes = await apiClient.get(`/loans/${loanId}`);
        setLoan(loanRes.data);

        const scheduleRes = await apiClient.get(`/loans/${loanId}/schedule`);
        setSchedule(scheduleRes.data.schedule);

      } catch (err) {
        setError('No se pudieron cargar los detalles del préstamo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [loanId]);

  if (loading) return <p>Cargando detalles del préstamo...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!loan) return <p>No se encontró el préstamo.</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Detalles del Préstamo #{loan.id}</h1>
      
      {/* ... (Aquí irían los detalles generales del préstamo) ... */}

      <hr />

      <h2>Cronograma de Pagos</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>Cuota N°</th>
            <th>Fecha de Pago</th>
            <th>Monto a Pagar</th>
            <th>Capital</th>
            <th>Interés</th>
            <th>Saldo Restante</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(payment => (
            <tr key={payment.payment_number}>
              <td>{payment.payment_number}</td>
              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
              <td>${payment.payment_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td>${payment.principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td>${payment.interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td>${payment.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanDetailsPage;

