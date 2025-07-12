import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import './ClientsPage.css'; // Reutilizamos los estilos

const LoanDetailsPage = () => {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await apiClient.get(`/loans/${loanId}`);
        setLoan(response.data);
      } catch (err) {
        setError('No se pudo cargar el préstamo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [loanId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard">← Volver al Dashboard</Link>
      <h1>Detalles del Préstamo</h1>
      {loan && (
        <div>
          <p><strong>ID Préstamo:</strong> {loan.id}</p>
          <p><strong>Cliente:</strong> {loan.client_first_name} {loan.client_last_name}</p>
          <p><strong>Monto:</strong> ${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p><strong>Tasa de Interés:</strong> {loan.interest_rate.toFixed(2)}%</p>
          <p><strong>Tasa de Comisión:</strong> {loan.commission_rate ? loan.commission_rate.toFixed(2) : '0.00'}%</p>
          <p><strong>Plazo:</strong> {loan.term_months} meses</p>
          <p><strong>Frecuencia de Pago:</strong> {loan.payment_frequency}</p>
          <p><strong>Estado:</strong> {loan.status}</p>
          <p><strong>Pagos Realizados:</strong> {loan.payments_made}</p>
          <p><strong>Total Pagado:</strong> ${parseFloat(loan.total_paid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p><strong>Saldo Pendiente:</strong> ${parseFloat(loan.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <Link to={`/loans/${loan.id}/payments`}>Ver Pagos</Link>
        </div>
      )}
    </div>
  );
};

export default LoanDetailsPage;
