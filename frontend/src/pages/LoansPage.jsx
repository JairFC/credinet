import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import EditLoanModal from '../components/EditLoanModal'; // Asumimos que este modal existirá
import './ClientsPage.css';

const LoansPage = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [clients, setClients] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [associateFilter, setAssociateFilter] = useState('');

  const canManage = user && (user.role === 'administrador' || user.role === 'auxiliar_administrativo');
  const canDelete = user && user.role === 'administrador';

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (associateFilter) params.append('associate_id', associateFilter);
      
      const response = await apiClient.get(`/loans/?${params.toString()}`);
      setLoans(response.data);
    } catch (err) {
      setError('Error al cargar los préstamos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [loansRes, associatesRes, clientsRes] = await Promise.all([
        apiClient.get('/loans/'),
        apiClient.get('/associates/'),
        apiClient.get('/clients/')
      ]);
      setLoans(loansRes.data);
      setAssociates(associatesRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos iniciales.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleFilterChange = () => {
    fetchLoans();
  };

  const resetFilters = () => {
    setStatusFilter('');
    setAssociateFilter('');
    fetchInitialData(); // Recarga todo
  };

  const handleDeleteLoan = async (loanId) => {
    if (!canDelete) return;
    if (!window.confirm('¿Estás seguro de que quieres eliminar este préstamo? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await apiClient.delete(`/loans/${loanId}`);
      fetchLoans(); // Refresca la lista
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el préstamo.');
    }
  };

  const handleUpdateSuccess = () => {
    setEditingLoan(null);
    setCreateModalOpen(false);
    fetchLoans();
  };

  const associateMap = useMemo(() => 
    new Map(associates.map(a => [a.id, a.name])),
    [associates]
  );

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Préstamos</h1>
      
      {canManage && (
        <div className="toolbar">
          <button onClick={() => setCreateModalOpen(true)}>+ Crear Nuevo Préstamo</button>
        </div>
      )}

      <div className="filters-container">
        {/* ... filtros ... */}
      </div>
      
      <hr />

      <h2>Lista de Préstamos ({loans.length})</h2>
      {loading && <p>Cargando préstamos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Asociado</th>
            <th>Monto</th>
            <th>Saldo Pendiente</th>
            <th>Estado</th>
            {canManage && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>
                <Link to={`/clients/${loan.client_id}/loans`}>
                  {loan.client_first_name} {loan.client_last_name}
                </Link>
              </td>
              <td>{associateMap.get(loan.associate_id) || 'N/A'}</td>
              <td>${parseFloat(loan.amount).toLocaleString('en-US')}</td>
              <td>${parseFloat(loan.outstanding_balance).toLocaleString('en-US')}</td>
              <td><span className={`status-badge status-${loan.status}`}>{loan.status}</span></td>
              {canManage && (
                <td className="actions-cell">
                  <button onClick={() => setEditingLoan(loan)}>Editar</button>
                  {canDelete && (
                    <button onClick={() => handleDeleteLoan(loan.id)} style={{ marginLeft: '5px' }}>Eliminar</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {(isCreateModalOpen || editingLoan) && (
        <EditLoanModal
          loan={editingLoan} // Si es null, el modal sabe que es para crear
          clients={clients}
          associates={associates}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => { setEditingLoan(null); setCreateModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default LoansPage;
