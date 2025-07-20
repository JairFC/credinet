import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const PaginationControls = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Anterior</button>
      <span>Página {page} de {pages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= pages}>Siguiente</button>
    </div>
  );
};

const LoansPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user && (user.roles.includes('administrador') || user.roles.includes('auxiliar_administrativo'));
  const canDelete = user && user.roles.includes('administrador');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [loansRes, associatesRes] = await Promise.all([
          apiClient.get(`/loans/?page=${currentPage}`),
          apiClient.get('/associates/'), // La paginación aquí es un bug, pero lo arreglamos abajo
        ]);
        setData(loansRes.data);
        setAssociates(associatesRes.data.items); // Corregido: extraer .items
      } catch (err) {
        setError('No se pudieron cargar los datos iniciales.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [currentPage]);

  const handleDeleteLoan = async (loanId) => {
    if (!canDelete || !window.confirm('¿Estás seguro?')) return;
    try {
      await apiClient.delete(`/loans/${loanId}`);
      // Recargar la página actual para reflejar el cambio
      setCurrentPage(1); // O podrías refetchear la página actual
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el préstamo.');
    }
  };

  const associateMap = useMemo(() => 
    new Map(associates.map(a => [a.id, a.name])),
    [associates]
  );

  if (loading) return <p>Cargando préstamos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Préstamos</h1>
      
      {canManage && (
        <div className="toolbar" style={{ marginBottom: '20px' }}>
          <Link to="/loans/new">
            <button>+ Crear Nuevo Préstamo</button>
          </Link>
        </div>
      )}
      
      <hr />

      <h2>Lista de Préstamos ({data.total})</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario (Cliente)</th>
            <th>Asociado</th>
            <th>Monto</th>
            <th>Saldo Pendiente</th>
            <th>Estado</th>
            {canManage && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.items.map(loan => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>
                <Link to={`/users/${loan.user_id}/loans`}>
                  {loan.user_first_name} {loan.user_last_name}
                </Link>
              </td>
              <td>{associateMap.get(loan.associate_id) || 'N/A'}</td>
              <td>${parseFloat(loan.amount).toLocaleString('en-US')}</td>
              <td>${parseFloat(loan.outstanding_balance).toLocaleString('en-US')}</td>
              <td><span className={`status-badge status-${loan.status}`}>{loan.status}</span></td>
              {canManage && (
                <td className="actions-cell">
                  <button>Editar</button>
                  {canDelete && (
                    <button onClick={() => handleDeleteLoan(loan.id)} style={{ marginLeft: '5px' }}>Eliminar</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls page={data.page} pages={data.pages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default LoansPage;
