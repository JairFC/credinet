import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import './ClientsPage.css';

const AssociateLoansPage = () => {
  const { associateId } = useParams();
  const [associate, setAssociate] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [associateRes, loansRes, summaryRes] = await Promise.all([
          apiClient.get(`/associates/${associateId}`),
          apiClient.get(`/loans/?associate_id=${associateId}`),
          apiClient.get(`/associates/${associateId}/summary`),
        ]);
        
        setAssociate(associateRes.data);
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
  }, [associateId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const filteredLoans = loans.filter(loan => 
    statusFilter === 'all' || loan.status === statusFilter
  );

  return (
    <div className="clients-page">
      <Link to="/associates">← Volver a Asociados</Link>
      <h1>Préstamos del Asociado: {associate?.name}</h1>

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
          <div className="summary-card">
            <h3>Comisión Total Generada</h3>
            <p>${summary.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      <div className="filter-container">
        <label htmlFor="status-filter">Filtrar por estado:</label>
        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="active">Activo</option>
          <option value="paid">Pagado</option>
          <option value="defaulted">Incumplido</option>
        </select>
      </div>

      <hr />

      <h2>Historial de Préstamos Originados</h2>
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
          {filteredLoans.map(loan => (
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

export default AssociateLoansPage;