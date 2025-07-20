import React from 'react';
import { Link } from 'react-router-dom';

const CreateAssociatePage = () => {
  return (
    <div className="clients-page"> {/* Reutilizamos estilos */}
      <Link to="/associates" className="back-link">← Volver a Asociados</Link>
      <h1>Crear Nueva Entidad de Asociado</h1>
      <p>Aquí irá el formulario para crear nuevas entidades de negocio asociadas.</p>
      {/* Aquí renderizaríamos <AssociateForm mode="create" /> */}
    </div>
  );
};

export default CreateAssociatePage;
