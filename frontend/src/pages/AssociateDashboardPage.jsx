import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';
import './ClientsPage.css';

const AssociateDashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssociateDashboard = async () => {
      if (!user || !user.associate_id) {
        setError('No se pudo verificar la identidad del asociado.');
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/associates/${user.associate_id}/summary`);
        setSummary(response.data);
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssociateDashboard();
  }, [user]);

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!summary) return <p>No hay datos de resumen disponibles.</p>;

  return (
    <div className="clients-page">
      <h1>Dashboard de Asociado</h1>
      <p>Resumen de tu actividad y préstamos originados.</p>

      <div className="summary-container" style={{ margin: '20px 0' }}>
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
          <h3>Saldo Pendiente</h3>
          <p>${summary.total_outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="summary-card">
          <h3>Comisión Total Generada</h3>
          <p><strong>${summary.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <Link to={`/associates/${user.associate_id}/loans`} className="button-link">
          Ver Mis Préstamos
        </Link>
      </div>
    </div>
  );
};

export default AssociateDashboardPage;
