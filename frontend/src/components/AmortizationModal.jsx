import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '80%',
  maxWidth: '700px',
  maxHeight: '80vh',
  overflowY: 'auto',
};

const AmortizationModal = ({ loanId, onClose }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/loans/${loanId}/amortization`);
        setSchedule(response.data.schedule);
      } catch (err) {
        setError('No se pudo cargar la tabla de amortización.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [loanId]);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Tabla de Amortización (Préstamo ID: {loanId})</h2>
        {loading && <p>Calculando...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <table className="clients-table">
            <thead>
              <tr>
                <th># Pago</th>
                <th>Monto Pago</th>
                <th>Capital</th>
                <th>Interés</th>
                <th>Saldo Restante</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map(payment => (
                <tr key={payment.payment_number}>
                  <td>{payment.payment_number}</td>
                  <td>${payment.payment_amount.toFixed(2)}</td>
                  <td>${payment.principal.toFixed(2)}</td>
                  <td>${payment.interest.toFixed(2)}</td>
                  <td>${payment.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={onClose} style={{ marginTop: '20px' }}>Cerrar</button>
      </div>
    </div>
  );
};

export default AmortizationModal;