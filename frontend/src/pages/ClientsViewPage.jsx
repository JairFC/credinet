import React from 'react';
import UsersPage from './UsersPage';

const ClientsViewPage = () => {
  // Esta página actúa como un contenedor que renderiza la página de Usuarios
  // pero pasándole un filtro para que solo muestre a los clientes.
  return <UsersPage roleFilter="cliente" pageTitle="Gestión de Clientes" />;
};

export default ClientsViewPage;
