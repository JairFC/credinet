import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import EditLoanModal from '../components/EditLoanModal';

const CreateLoanPage = () => {
  const [users, setUsers] = useState(null); // Iniciar como null
  const [associates, setAssociates] = useState(null); // Iniciar como null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // No necesitamos setLoading(true) aquí si ya está en true
        const [usersRes, associatesRes] = await Promise.all([
          apiClient.get('/auth/users?role=cliente'), // Obtener solo clientes
          apiClient.get('/associates/'),
        ]);
        
        setUsers(usersRes.data.items); // La API ya devuelve los clientes filtrados
        setAssociates(associatesRes.data.items);

      } catch (err) {
        setError('No se pudieron cargar los datos necesarios para el formulario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSuccess = () => {
    console.log("Préstamo creado con éxito");
    navigate('/loans');
  };

  // Renderizado condicional robusto
  const renderContent = () => {
    if (loading) {
      return <p>Cargando datos del formulario...</p>;
    }
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }
    if (users && associates) {
      return (
        <EditLoanModal 
          loan={null}
          users={users}
          associates={associates}
          onUpdateSuccess={handleSuccess}
          onClose={() => navigate('/loans')}
          isPage={true}
        />
      );
    }
    return <p>No se pudieron cargar los datos necesarios.</p>;
  };

  return (
    <div className="clients-page">
      <Link to="/loans" className="back-link">← Volver a Préstamos</Link>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default CreateLoanPage;
