import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGlobalSummary, getAssociateDashboard, getClientDashboard } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/common.css';

const dashboardStyles = `
  .dashboard-container { animation: fadeIn 0.5s ease-in-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
  .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; }
  .card:hover { transform: translateY(-5px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  .card h3 { margin-top: 0; font-size: 1rem; color: var(--color-text-secondary); }
  .card p { font-size: 2rem; font-weight: bold; margin: 0; color: var(--color-primary); }
  .item-list { list-style: none; padding: 0; }
  .item-list li { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
  .view-switcher { background: var(--color-surface-accent); padding: 10px; border-radius: 8px; margin-bottom: 20px; display: inline-block; }
`;

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getGlobalSummary()
      .then(res => setSummary(res.data))
      .catch(() => setError('No se pudo cargar el resumen.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando resumen de administración...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!summary) return <p>No hay datos de resumen disponibles.</p>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard de Administración</h2>
      <div className="summary-cards">
        <div className="card"><h3>Total Préstamos</h3><p>{summary.total_loans}</p></div>
        <div className="card"><h3>Préstamos Activos</h3><p>{summary.active_loans}</p></div>
        <div className="card"><h3>Monto Prestado</h3><p>${parseFloat(summary.total_loaned_amount).toFixed(2)}</p></div>
        <div className="card"><h3>Saldo Pendiente</h3><p>${parseFloat(summary.total_outstanding_balance).toFixed(2)}</p></div>
      </div>
    </div>
  );
};

const AssociateDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAssociateDashboard()
      .then(res => setData(res.data))
      .catch(() => setError('No se pudo cargar el dashboard de asociado.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando dashboard de asociado...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!data) return <p>No hay datos disponibles.</p>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard de Asociado</h2>
      <div className="summary-cards">
        <div className="card"><h3>Préstamos Originados</h3><p>{data.summary.total_loans}</p></div>
        <div className="card"><h3>Comisión Generada</h3><p>${parseFloat(data.summary.total_commission).toFixed(2)}</p></div>
      </div>
      <h3>Mis Clientes Recientes</h3>
      <ul className="item-list">
        {data.users.slice(0, 5).map(c => <li key={c.id}>{c.first_name} {c.last_name}</li>)}
      </ul>
    </div>
  );
};

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getClientDashboard()
      .then(res => setData(res.data))
      .catch(() => setError('No se pudo cargar tu dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando tu información...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!data) return <p>No tienes datos disponibles.</p>;

  return (
    <div className="dashboard-container">
      <h2>Mi Dashboard</h2>
      <div className="summary-cards">
        <div className="card"><h3>Préstamos Activos</h3><p>{data.summary.active_loans_count}</p></div>
        <div className="card"><h3>Saldo Pendiente</h3><p>${parseFloat(data.summary.total_outstanding_balance).toFixed(2)}</p></div>
      </div>
      <h3>Mis Préstamos</h3>
      <ul className="item-list">
        {data.loans.map(l => (
          <li key={l.id}>
            <Link to={`/loans/${l.id}`}>Préstamo #{l.id}</Link>
            <span><strong>Saldo:</strong> ${parseFloat(l.outstanding_balance).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [view, setView] = useState('');

  useEffect(() => {
    if (user && user.roles) {
      const preferredRole = ['administrador', 'desarrollador', 'auxiliar_administrativo', 'asociado', 'cliente']
        .find(r => user.roles.includes(r));
      setView(preferredRole);
    }
  }, [user]);

  const renderDashboard = () => {
    switch (view) {
      case 'administrador':
      case 'desarrollador':
      case 'auxiliar_administrativo':
        return <AdminDashboard />;
      case 'asociado': return <AssociateDashboard />;
      case 'cliente': return <ClientDashboard />;
      default: return <p>Cargando...</p>;
    }
  };

  const canSwitch = user && user.roles && user.roles.length > 1;
  const availableRoles = ['administrador', 'asociado', 'cliente'].filter(r => user?.roles.includes(r));

  return (
    <div>
      <style>{dashboardStyles}</style>
      {canSwitch && (
        <div className="view-switcher">
          <strong>Cambiar Vista: </strong>
          <select onChange={(e) => setView(e.target.value)} value={view} aria-label="Seleccionar vista de dashboard">
            {availableRoles.map(role => (
              <option key={role} value={role}>
                Vista {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;