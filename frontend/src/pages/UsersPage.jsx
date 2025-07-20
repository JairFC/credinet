import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../services/api'; // Importar la función getUsers
import { useAuth } from '../context/AuthContext';

const PaginationControls = ({ page, pages, onPageChange }) => {
  const handlePrev = () => onPageChange(page - 1);
  const handleNext = () => onPageChange(page + 1);

  return (
    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
      <button onClick={handlePrev} disabled={page <= 1}>Anterior</button>
      <span>Página {page} de {pages}</span>
      <button onClick={handleNext} disabled={page >= pages}>Siguiente</button>
    </div>
  );
};

const UsersPage = ({ roleFilter = null, pageTitle = "Gestión de Usuarios" }) => {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user && (user.role === 'administrador' || user.role === 'desarrollador');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Usar la función getUsers del servicio de API
        const response = await getUsers(currentPage, 20, roleFilter);
        setData(response.data);
      } catch (err) {
        setError(`No se pudieron cargar los ${roleFilter ? roleFilter + 's' : 'usuarios'}.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [roleFilter, currentPage]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="clients-page">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      <h1>{pageTitle} ({data.total})</h1>
      
      {canManage && (
        <div className="toolbar">
          <Link to="/users/new"><button>+ Crear Nuevo Usuario</button></Link>
        </div>
      )}

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
              {!roleFilter && <td>{u.role}</td>}
              <td className="actions-cell">
                <Link to={`/users/${u.id}/loans`}><button>Préstamos</button></Link>
                {canManage && <button style={{ marginLeft: '5px' }}>Editar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls page={data.page} pages={data.pages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default UsersPage;