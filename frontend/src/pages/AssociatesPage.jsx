import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAssociates } from '../services/api';
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

const AssociatesPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user && (user.roles.includes('administrador') || user.roles.includes('auxiliar_administrativo'));
  const canDelete = user && user.roles.includes('administrador');

  const fetchAssociates = useCallback(debounce(async (page, search) => {
    try {
      setLoading(true);
      const response = await getAssociates(page, 20, search);
      setData(response.data);
    } catch (err) {
      setError('No se pudieron cargar los asociados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 300), []);

  useEffect(() => {
    fetchAssociates(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchAssociates]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (associateId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este asociado? Esta acción no se puede deshacer.')) {
      try {
        await apiClient.delete(`/associates/${associateId}`);
        // Recargar la lista después de eliminar
        fetchAssociates(currentPage, searchTerm);
      } catch (err) {
        setError('No se pudo eliminar el asociado.');
        console.error('Error al eliminar el asociado:', err);
      }
    }
  };

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>Gestión de Asociados ({data.total})</h1>

      <div className="toolbar">
        <div>
          {canManage && (
            <Link to="/associates/new">
              <button>+ Crear Nuevo Asociado</button>
            </Link>
          )}
        </div>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar por nombre, contacto..."
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
                      <Link to={`/associates/edit/${assoc.id}`}><button>Editar</button></Link>
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
        </>
      )}
    </div>
  );
};

export default AssociatesPage;
