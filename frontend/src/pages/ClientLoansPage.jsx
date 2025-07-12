import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import './ClientsPage.css'; // Reutilizamos los estilos
import AmortizationModal from '../components/AmortizationModal';
import EditLoanModal from '../components/EditLoanModal';

const ClientLoansPage = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loans, setLoans] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado para el formulario de nuevo préstamo
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [termMonths, setTermMonths] = useState('6'); // Valor por defecto
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('quincenal');
  const [viewingLoanId, setViewingLoanId] = useState(null);
  const [editingLoan, setEditingLoan] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchClientAndLoans = async () => {
    try {
      setLoading(true);
      // Optimizamos las peticiones para que se ejecuten en paralelo
      const [clientRes, loansRes, distributorsRes, summaryRes] = await Promise.all([
        apiClient.get(`/clients/${clientId}`),
        apiClient.get(`/loans/?client_id=${clientId}`),
        apiClient.get('/distributors/'),
        apiClient.get(`/loans/clients/${clientId}/summary`)
      ]);
      setClient(clientRes.data);
      setLoans(loansRes.data);
      setDistributors(distributorsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientAndLoans();
  }, [clientId]);

  const handleCreateLoan = async (e) => {
    e.preventDefault();

    if (!window.confirm('¿Estás seguro de que quieres crear este nuevo préstamo?')) {
      return;
    }

    setFormError('');
    try {
      const loanData = {
        client_id: parseInt(clientId),
        amount: parseFloat(amount),
        interest_rate: parseFloat(interestRate),
        commission_rate: parseFloat(commissionRate) || 0.0,
        term_months: parseInt(termMonths),
        payment_frequency: paymentFrequency,
      };
      if (selectedDistributor) {
        loanData.distributor_id = parseInt(selectedDistributor);
      }

      const response = await apiClient.post('/loans/', loanData);
      // Añadir el nuevo préstamo al estado local sin recargar
      setLoans(prevLoans => [response.data, ...prevLoans]);

      // Limpiar formulario
      setAmount('');
      setInterestRate('');
      setCommissionRate('');
      setTermMonths('6');
      setSelectedDistributor('');
      setPaymentFrequency('quincenal');
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al crear el préstamo.');
    }
  };

  const handleRecordPayment = async (loanId) => {
    if (!window.confirm('¿Confirmas registrar un pago estándar para este préstamo?')) {
      return;
    }
    try {
      const response = await apiClient.post(`/loans/${loanId}/payments`, {});
      // Actualiza el préstamo específico en el estado local
      setLoans(prevLoans =>
        prevLoans.map(l => (l.id === loanId ? response.data : l))
      );
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al registrar el pago.');
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) {
      if (window.confirm('Esta acción es irreversible y solo debe hacerse para préstamos pendientes sin pagos. ¿Continuar?')) {
        try {
          await apiClient.delete(`/loans/${loanId}`);
          // Elimina el préstamo del estado local
          setLoans(prevLoans => prevLoans.filter(l => l.id !== loanId));
        } catch (err) {
          setFormError(err.response?.data?.detail || 'No se pudo eliminar el préstamo.');
        }
      }
    }
  };

  const handleUpdateSuccess = (updatedLoan) => {
    // Actualiza el préstamo específico en el estado local para una UI instantánea
    setLoans(prevLoans =>
      prevLoans.map(l => (l.id === updatedLoan.id ? updatedLoan : l))
    );
    setEditingLoan(null); // Cierra el modal
  };

  const handleStatusChange = async (loanId, newStatus) => {
    try {
      const response = await apiClient.patch(`/loans/${loanId}/status`, { status: newStatus });
      // Actualiza el préstamo con la respuesta completa de la API
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan.id === loanId ? response.data : loan
        )
      );
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error al cambiar el estado.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Creamos un mapa para buscar nombres de distribuidoras eficientemente
  const distributorMap = new Map(distributors.map(d => [d.id, d.name]));

  return (
    <div className="clients-page">
      <Link to="/clients">← Volver a Clientes</Link>
      <h1>Préstamos de: {client?.first_name} {client?.last_name}</h1>

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

      <h2>Añadir Nuevo Préstamo</h2>
      <form onSubmit={handleCreateLoan} className="client-form">
        <div className="form-group">
          <label htmlFor="amount">Monto</label>
          <div className="input-with-adornment">
            <span className="adornment adornment-start">$</span>
            <input
              id="amount"
              type="text"
              className="has-start-adornment"
              value={amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, '');
                if (/^\d*$/.test(rawValue)) {
                  setAmount(rawValue);
                }
              }}
              placeholder="10,000" required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="interestRate">Tasa de Interés</label>
          <div className="input-with-adornment">
            <input id="interestRate" type="number" className="has-end-adornment" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="15.5" required />
            <span className="adornment adornment-end">%</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="commissionRate">Tasa de Comisión</label>
          <div className="input-with-adornment">
            <input id="commissionRate" type="number" className="has-end-adornment" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="5.0" />
            <span className="adornment adornment-end">%</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="termMonths">Plazo</label>
          <div className="input-with-adornment">
            <input id="termMonths" type="number" className="has-end-adornment" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} placeholder="6" required />
            <span className="adornment adornment-end">meses</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="distributor">Distribuidora</label>
          <select id="distributor" value={selectedDistributor} onChange={(e) => setSelectedDistributor(e.target.value)}>
            <option value="">-- Sin Distribuidora --</option>
            {distributors.map(dist => (
              <option key={dist.id} value={dist.id}>{dist.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="paymentFrequency">Frecuencia de Pago</label>
          <select id="paymentFrequency" value={paymentFrequency} onChange={(e) => setPaymentFrequency(e.target.value)}>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
        <button type="submit">Crear Préstamo</button>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
      </form>

      <hr />

      <h2>Historial de Préstamos</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Monto</th>
            <th>Tasa de Interés</th>
            <th>Tasa de Comisión</th>
            <th>Plazo (meses)</th>
            <th>Frecuencia</th>
            <th>Pagos</th>
            <th>Saldo Pendiente</th>
            <th>Distribuidora</th>
            <th>Acciones</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>
                <Link to={`/loans/${loan.id}`}>{loan.id}</Link>
              </td>
              <td>${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{loan.interest_rate.toFixed(2)}%</td>
              <td>{loan.commission_rate ? loan.commission_rate.toFixed(2) : '0.00'}%</td>
              <td>{loan.term_months}</td>
              <td>{loan.payment_frequency}</td>
              <td>{loan.payments_made} / {loan.payment_frequency === 'quincenal' ? loan.term_months * 2 : loan.term_months}</td>
              <td>${parseFloat(loan.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{loan.distributor_id ? distributorMap.get(loan.distributor_id) : 'N/A'}</td>
              <td className="actions-cell">
                <Link to={`/loans/${loan.id}/payments`}><button>Ver Pagos</button></Link>
                <button onClick={() => setViewingLoanId(loan.id)} style={{marginTop: '5px'}}>Ver Amortización</button>
                {loan.status === 'active' && (
                  <button onClick={() => handleRecordPayment(loan.id)} style={{marginTop: '5px'}}>Registrar Pago</button>
                )}
                {loan.status === 'pending' && (
                  <button onClick={() => setEditingLoan(loan)} style={{marginTop: '5px'}}>Editar</button>
                )}
                {loan.status === 'pending' && (
                  <button onClick={() => handleDeleteLoan(loan.id)} style={{marginTop: '5px'}}>Eliminar</button>
                )}
              </td>
              <td>
                <select value={loan.status} onChange={(e) => handleStatusChange(loan.id, e.target.value)}>
                  <option value="pending">Pendiente</option>
                  <option value="active">Activo</option>
                  <option value="paid">Pagado</option>
                  <option value="defaulted">Incumplido</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewingLoanId && (
        <AmortizationModal loanId={viewingLoanId} onClose={() => setViewingLoanId(null)} />
      )}

      {editingLoan && (
        <EditLoanModal
          loan={editingLoan}
          distributors={distributors}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => setEditingLoan(null)}
        />
      )}
    </div>
  );
};

export default ClientLoansPage;