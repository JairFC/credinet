import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getLoans, getAssociates } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { debounce } from 'lodash';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user && (user.roles.includes('administrador') || user.roles.includes('auxiliar_administrativo'));
  const canDelete = user && user.roles.includes('administrador');

  const fetchLoans = useCallback(debounce(async (page, search) => {
    try {
      setLoading(true);
      const response = await getLoans(page, 20, search);
      setData(response.data);
    } catch (err) {
      setError('No se pudieron cargar los préstamos.');
    } finally {
      setLoading(false);
    }
  }, 300), []);

  useEffect(() => {
    fetchLoans(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchLoans]);

  useEffect(() => {
    // Cargar asociados una sola vez para el mapeo
    getAssociates(1, 100).then(res => setAssociates(res.data.items)).catch(console.error);
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const associateMap = useMemo(() => 
    new Map(associates.map(a => [a.id, a.name])),
    [associates]
  );

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Préstamos ({data.total})</h1>
      
      <div className="toolbar">
        <div>
          {canManage && (
            <Link to="/loans/new">
              <button>+ Crear Nuevo Préstamo</button>
            </Link>
          )}
        </div>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>
      
      {loading ? <p>Cargando...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
        <>
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
                        <button onClick={() => {}}>Eliminar</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls page={data.page} pages={data.pages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default LoansPage;
