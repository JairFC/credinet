import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import AssociateDashboardPage from './AssociateDashboardPage';
import ClientDashboardPage from './ClientDashboardPage'; // Importar el nuevo dashboard

const AdminDashboard = () => {
  const { user } = useAuth();
  const [globalSummary, setGlobalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGlobalSummary = async () => {
      try {
        const globalSummaryRes = await apiClient.get('/loans/summary');
        setGlobalSummary(globalSummaryRes.data);
      } catch (err) {
        setError('No se pudo cargar el resumen global.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalSummary();
  }, []);

  return (
    <div className="clients-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard General</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Usuario: <strong>{user ? user.username : 'invitado'}</strong> ({user ? user.role : ''})</span>
        </div>
      </div>
      <p>Resumen general del estado de todos los préstamos en el sistema.</p>

      {loading && <p>Cargando resumen...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {globalSummary && (
        <div className="summary-container" style={{ margin: '20px 0', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div className="summary-card">
              <h3>Total Préstamos</h3>
              <p>{globalSummary.total_loans}</p>
          </div>
          <div className="summary-card">
              <h3>Préstamos Activos</h3>
              <p>{globalSummary.active_loans}</p>
          </div>
          <div className="summary-card">
              <h3>Monto Total Prestado</h3>
              <p>${globalSummary.total_loaned_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="summary-card">
              <h3>Saldo Pendiente Total</h3>
              <p>${globalSummary.total_outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="summary-card">
              <h3>Comisión Total Generada</h3>
              <p>${globalSummary.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}
      
      <div style={{ margin: '20px 0' }}>
        <Link to="/loans" className="button-link">Ver Todos los Préstamos</Link>
        <Link to="/users" className="button-link" style={{ marginLeft: '15px' }}>Gestionar Usuarios</Link>
        <Link to="/associates" className="button-link" style={{ marginLeft: '15px' }}>Gestionar Asociados</Link>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Cargando...</p>;
  }

  // Redirección basada en el rol del usuario
  switch (user.role) {
    case 'asociado':
      return <AssociateDashboardPage />;
    case 'cliente':
      return <ClientDashboardPage />;
    default: // 'administrador', 'auxiliar_administrativo', 'desarrollador'
      return <AdminDashboard />;
  }
};

export default DashboardPage;
