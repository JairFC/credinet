import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { debounce } from 'lodash';

// Este componente se reutiliza para mostrar tanto la lista de todos los usuarios como la lista de solo los clientes.
// El prop `roleFilter` se utiliza para filtrar los usuarios por rol.
// El prop `pageTitle` se utiliza para establecer el título de la página.

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

const UsersPage = ({ roleFilter = null, pageTitle = "Gestión de Usuarios" }) => {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user && (user.roles.includes('administrador') || user.roles.includes('desarrollador'));

  const fetchUsers = useCallback(debounce(async (page, filter, search) => {
    try {
      setLoading(true);
      const response = await getUsers(page, 20, filter, search);
      setData(response.data);
    } catch (err) {
      setError(`No se pudieron cargar los ${filter ? filter + 's' : 'usuarios'}.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 300), []);

  useEffect(() => {
    fetchUsers(currentPage, roleFilter, searchTerm);
  }, [roleFilter, currentPage, searchTerm, fetchUsers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>{pageTitle} ({data.total})</h1>

      <div className="toolbar">
        <div>
          {canManage && (
            <Link to={roleFilter === 'cliente' ? '/clients/new' : '/users/new'}>
              <button>+ Crear Nuevo {roleFilter === 'cliente' ? 'Cliente' : 'Usuario'}</button>
            </Link>
          )}
        </div>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar..."
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
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                {!roleFilter && <th>Rol</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone_number}</td>
                  {!roleFilter && <td>{u.roles ? u.roles.join(', ') : ''}</td>}
                  <td className="actions-cell">
                    <Link to={`/users/${u.id}/loans`}><button>Préstamos</button></Link>
                    {canManage && <Link to={`/clients/${u.id}`}><button style={{ marginLeft: '5px' }}>Ver Detalles</button></Link>}
                  </td>
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

export default UsersPage;