# ADR-002: Endpoint para Obtener Clientes

**Estado:** Aceptado

**Contexto:**


La página de creación de préstamos (`CreateLoanPage.jsx`) y la vista de "Gestión de Clientes" (`ClientsViewPage.jsx`) necesitan una forma eficiente de obtener solo a los usuarios que tienen el rol de "cliente". El enfoque inicial de obtener todos los usuarios y filtrarlos en el frontend es ineficiente y no escala.

**Decisión:**


Se ha decidido modificar el endpoint existente `GET /api/auth/users` para que acepte un parámetro de consulta opcional `role`. Así, en vez de crear un endpoint nuevo y específico, se reutiliza el existente para filtrar por rol cuando sea necesario.

La llamada a la API para obtener solo clientes es: `GET /api/auth/users?role=cliente`.


En el frontend, la página `ClientsViewPage.jsx` actúa como un contenedor que renderiza el componente `UsersPage.jsx`, pasándole el prop `roleFilter="cliente"` para lograr la vista de "Gestión de Clientes". Así, se reutiliza el endpoint existente `/api/auth/users` y se filtra desde el backend.

**Consecuencias:**

*   **Ventajas:**
    *   Mejora drásticamente la eficiencia al delegar el filtrado a la base de datos, reduciendo la carga en el frontend y la cantidad de datos transferidos.
    *   Mantiene la superficie de la API limpia y cohesiva al no añadir un nuevo endpoint, siguiendo el principio de reutilización.
    *   Simplifica el código del frontend, que ahora solo necesita pasar un parámetro en lugar de implementar lógica de filtrado.
*   **Desventajas:**
    *   Ninguna significativa. Este enfoque es superior a la propuesta original.
