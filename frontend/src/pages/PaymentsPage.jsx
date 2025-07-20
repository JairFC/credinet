import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import EditPaymentModal from '../components/EditPaymentModal';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPayment, setEditingPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      const response = await apiClient.get('/loans/payments');
      setPayments(response.data);
    } catch (err) {
      setError('No se pudieron cargar los pagos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (paymentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      try {
        await apiClient.delete(`/loans/payments/${paymentId}`);
        setPayments(payments.filter(p => p.id !== paymentId));
      } catch (err) {
        setError(err.response?.data?.detail || 'No se pudo eliminar el pago.');
      }
    }
  };

  const handleUpdateSuccess = (updatedPayment) => {
    setPayments(payments.map(p => (p.id === updatedPayment.id ? updatedPayment : p)));
    setEditingPayment(null);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard">← Volver al Dashboard</Link>
      <h1>Historial de Pagos</h1>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID Pago</th>
            <th>ID Préstamo</th>
            <th>Monto Pagado</th>
            <th>Fecha de Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>
                <Link to={`/payments/${payment.id}`}>{payment.id}</Link>
              </td>
              <td>
                <Link to={`/loans/${payment.loan_id}`}>{payment.loan_id}</Link>
              </td>
              <td>${parseFloat(payment.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => setEditingPayment(payment)}>Editar</button>
                <button onClick={() => handleDelete(payment.id)} style={{ marginLeft: '5px' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => setEditingPayment(null)}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
