import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navStyle = {
  background: '#333',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  margin: '0 10px',
};

const Navbar = () => {
  const { user, logoutAction } = useAuth();
  const userRole = user?.role;

  // Roles con acceso a la gestión principal
  const managementRoles = ['desarrollador', 'administrador', 'auxiliar_administrativo'];
  const adminRoles = ['desarrollador', 'administrador'];

  return (
    <nav style={navStyle}>
      <div>
        <Link to={user ? "/dashboard" : "/login"} style={linkStyle}>
          Credinet
        </Link>
      </div>
      <div>
        {user && (
          <>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>

            {/* Enlaces para roles de gestión */}
            {managementRoles.includes(userRole) && (
              <>
                <Link to="/clients" style={linkStyle}>Clientes</Link>
                <Link to="/associates" style={linkStyle}>Asociados</Link>
                <Link to="/loans" style={linkStyle}>Préstamos</Link>
              </>
            )}

            {/* Enlaces solo para administradores */}
            {adminRoles.includes(userRole) && (
              <Link to="/users" style={linkStyle}>Usuarios</Link>
            )}
            
            <button onClick={logoutAction} style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', marginLeft: '20px' }}>
              Cerrar Sesión ({user.username})
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
