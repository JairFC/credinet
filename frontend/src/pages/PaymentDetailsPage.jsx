import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';

const PaymentDetailsPage = () => {
  const { paymentId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await apiClient.get(`/loans/payments/${paymentId}`);
        setPayment(response.data);
      } catch (err) {
        setError('No se pudo cargar el pago.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/payments">← Volver a Pagos</Link>
      <h1>Detalles del Pago</h1>
      {payment && (
        <div>
          <p><strong>ID Pago:</strong> {payment.id}</p>
          <p><strong>ID Préstamo:</strong> {payment.loan_id}</p>
          <p><strong>Monto Pagado:</strong> ${parseFloat(payment.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p><strong>Fecha de Pago:</strong> {new Date(payment.payment_date).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailsPage;
