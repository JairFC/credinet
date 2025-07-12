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

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/dashboard" style={linkStyle}>Credinet</Link>
      </div>
      <div>
        {user && (
          <>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/clients" style={linkStyle}>Clientes</Link>
            
            {['desarrollador', 'administrador', 'auxiliar_administrativo'].includes(userRole) && (
              <Link to="/associates" style={linkStyle}>Asociados</Link>
            )}

            {['desarrollador', 'administrador'].includes(userRole) && (
              <Link to="/users" style={linkStyle}>Usuarios</Link>
            )}

            <Link to="/payments" style={linkStyle}>Pagos</Link>
            <Link to="/loans_with_payments" style={linkStyle}>Préstamos con Pagos</Link>
            
            <button onClick={logoutAction} style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
