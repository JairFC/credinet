import React from 'react';

const footerStyle = {
  textAlign: 'center',
  padding: '20px',
  marginTop: '40px',
  backgroundColor: '#f2f2f2',
  borderTop: '1px solid #e7e7e7',
};

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} Credinet. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
