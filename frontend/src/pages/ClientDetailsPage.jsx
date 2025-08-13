import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserDetails } from '../services/api';
import EditClientModal from '../components/EditClientModal'; // Importar el modal de edición
import '../styles/overrides.css'; // Importar los nuevos estilos

const ClientDetailsPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false); // Estado para controlar la visibilidad del modal

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(id);
      setClient(response.data);
      console.log('Datos del cliente recibidos:', response.data);
    } catch (err) {
      setError('No se pudieron cargar los detalles del cliente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const handleUpdateSuccess = () => {
    setShowEditModal(false); // Cerrar el modal
    fetchClientDetails(); // Volver a cargar los detalles del cliente para reflejar los cambios
  };

  if (loading) return <p className="text-center">Cargando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!client) return <p className="text-center">No se encontró el cliente.</p>;

  const { 
    first_name, last_name, username, email, phone_number, curp, birth_date, 
    roles, address, beneficiaries, guarantor, profile_picture_url, updated_at
  } = client;

  return (
    <div className="container mx-auto p-4">
      <Link to="/clients" className="back-link mb-4 inline-block">← Volver a la Lista de Clientes</Link>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-6">
          <img 
            src={profile_picture_url || 'https://via.placeholder.com/100'} 
            alt={`Foto de ${first_name}`}
            className="w-24 h-24 rounded-full mr-6 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">{first_name} {last_name}</h1>
            <p className="text-gray-600">@{username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de Información Personal */}
          <div className="card">
            <h2 className="card-header">Información Personal</h2>
            <div className="card-body">
              <p><strong>CURP:</strong> {curp}</p>
              <p><strong>Fecha de Nacimiento:</strong> {birth_date}</p>
              <p><strong>Roles:</strong> {roles.join(', ')}</p>
              <p><strong>Última Actualización:</strong> {new Date(updated_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Card de Información de Contacto */}
          <div className="card">
            <h2 className="card-header">Información de Contacto</h2>
            <div className="card-body">
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Teléfono:</strong> {phone_number}</p>
            </div>
          </div>

          {/* Card de Dirección */}
          {address && (
            <div className="card">
              <h2 className="card-header">Dirección</h2>
              <div className="card-body">
                <p><strong>Calle:</strong> {address.street}</p>
                <p><strong>Num. Ext:</strong> {address.external_number}</p>
                {address.internal_number && <p><strong>Num. Int:</strong> {address.internal_number}</p>}
                <p><strong>Colonia:</strong> {address.colony}</p>
                <p><strong>Municipio:</strong> {address.municipality}</p>
                <p><strong>Estado:</strong> {address.state}</p>
                <p><strong>C.P.:</strong> {address.zip_code}</p>
              </div>
            </div>
          )}

          {/* Card de Beneficiarios */}
          {beneficiaries && beneficiaries.length > 0 && (
            <div className="card">
              <h2 className="card-header">Beneficiarios</h2>
              <div className="card-body">
                {beneficiaries.map(ben => (
                  <div key={ben.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <p><strong>Nombre:</strong> {ben.full_name}</p>
                    <p><strong>Parentesco:</strong> {ben.relationship}</p>
                    <p><strong>Teléfono:</strong> {ben.phone_number}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card de Aval */}
          {guarantor && (
            <div className="card">
              <h2 className="card-header">Aval</h2>
              <div className="card-body">
                <p><strong>Nombre:</strong> {guarantor.full_name}</p>
                <p><strong>Parentesco:</strong> {guarantor.relationship}</p>
                <p><strong>Teléfono:</strong> {guarantor.phone_number}</p>
                {guarantor.curp && <p><strong>CURP:</strong> {guarantor.curp}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Botón para abrir el modal de edición */}
        <div className="mt-6 text-right">
          <button className="button-primary" onClick={() => setShowEditModal(true)}>Editar Cliente</button>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <EditClientModal 
          user={client} 
          onUpdateSuccess={handleUpdateSuccess} 
          onClose={() => setShowEditModal(false)} 
        />
      )}
    </div>
  );
};

export default ClientDetailsPage;