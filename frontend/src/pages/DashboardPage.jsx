import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import AssociateDashboardPage from './AssociateDashboardPage';
import './ClientsPage.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [associateSummaries, setAssociateSummaries] = useState([]);
  const [globalSummary, setGlobalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const associatesRes = await apiClient.get('/associates/');
        const associates = associatesRes.data;

        const summaryPromises = associates.map(assoc =>
          apiClient.get(`/associates/${assoc.id}/summary`).then(res => ({
            ...assoc,
            summary: res.data
          }))
        );
        
        const summaries = await Promise.all(summaryPromises);
        setAssociateSummaries(summaries);

        const globalSummaryRes = await apiClient.get('/loans/summary');
        setGlobalSummary(globalSummaryRes.data);

      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="clients-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard General</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Usuario: <strong>{user ? user.username : 'invitado'}</strong> ({user ? user.role : ''})</span>
        </div>
      </div>
      <p>Resumen general del estado de todos los asociados.</p>

      {loading && <p>Cargando resúmenes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {globalSummary && (
        <div className="summary-container" style={{ margin: '20px 0' }}>
          <div className="summary-card">
              <h3>Total Préstamos (Global)</h3>
              <p>{globalSummary.total_loans}</p>
          </div>
          <div className="summary-card">
              <h3>Monto Prestado (Global)</h3>
              <p>${globalSummary.total_loaned_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="summary-card">
              <h3>Comisión Generada (Global)</h3>
              <p>${globalSummary.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}
      
      <div style={{ margin: '20px 0' }}>
        <Link to="/clients" className="button-link">Gestionar Clientes</Link>
        <Link to="/associates" className="button-link" style={{ marginLeft: '15px' }}>Gestionar Asociados</Link>
      </div>

      <hr />
      <h2>Resumen por Asociado</h2>
      
      <table className="clients-table">
        <thead>
          <tr>
            <th>Asociado</th>
            <th>Total Préstamos</th>
            <th>Préstamos Activos</th>
            <th>Monto Total Prestado</th>
            <th>Saldo Pendiente Total</th>
            <th>Comisión Total Generada</th>
          </tr>
        </thead>
        <tbody>
          {associateSummaries.map(item => (
            <tr key={item.id}>
              <td>
                <Link to={`/associates/${item.id}/loans`}>{item.name}</Link>
              </td>
              <td>{item.summary.total_loans}</td>
              <td>{item.summary.active_loans}</td>
              <td>${item.summary.total_loaned_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${item.summary.total_outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td><strong>${item.summary.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Cargando...</p>;
  }

  // Si el usuario es un asociado, muestra su dashboard específico.
  if (user.role === 'asociado') {
    return <AssociateDashboardPage />;
  }

  // Para los demás roles, muestra el dashboard general.
  return <AdminDashboard />;
};

export default DashboardPage;