import React, { useState, useEffect } from 'react';
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

const AssociatesPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user && (user.role === 'administrador' || user.role === 'auxiliar_administrativo');
  const canDelete = user && user.role === 'administrador';

  useEffect(() => {
    const fetchAssociates = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/associates/?page=${currentPage}`);
        setData(response.data);
      } catch (err) {
        setError('No se pudieron cargar los asociados.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssociates();
  }, [currentPage]);

  const handleDelete = async (associateId) => {
    if (!canDelete || !window.confirm('¿Estás seguro?')) return;
    try {
      await apiClient.delete(`/associates/${associateId}`);
      setCurrentPage(1); // Volver a la primera página
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el asociado.');
    }
  };

  if (loading) return <p>Cargando asociados...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Asociados ({data.total})</h1>

      {canManage && (
        <div className="toolbar" style={{ marginBottom: '20px' }}>
          <Link to="/associates/new">
            <button>+ Crear Nuevo Asociado</button>
          </Link>
        </div>
      )}

      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Nivel ID</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>Comisión (%)</th>
            {canManage && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.items.map(assoc => (
            <tr key={assoc.id}>
              <td>{assoc.id}</td>
              <td>{assoc.name}</td>
              <td>{assoc.level_id}</td>
              <td>{assoc.contact_person || 'N/A'}</td>
              <td>{assoc.contact_email || 'N/A'}</td>
              <td>{assoc.default_commission_rate.toFixed(2)}</td>
              {canManage && (
                <td className="actions-cell">
                  <Link to={`/associates/${assoc.id}/loans`}><button>Préstamos</button></Link>
                  <button>Editar</button>
                  {canDelete && (
                    <button onClick={() => handleDelete(assoc.id)} style={{ marginLeft: '5px' }}>Eliminar</button>
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

export default AssociatesPage;
