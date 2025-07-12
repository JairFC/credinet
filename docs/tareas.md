# Tareas y Evolución del Proyecto

Este documento es una lista de control de las tareas realizadas y pendientes.

## Hitos Iniciales (Completados)

-   [x] Definición inicial del esquema de la base de datos (`users`, `clients`, `distributors`, `loans`, `payments`).
-   [x] Creación de la estructura base del proyecto con FastAPI y React.
-   [x] Implementación del CRUD completo para la entidad `Clients`.
-   [x] Implementación del CRUD completo para la entidad `Distributors`.
-   [x] Implementación del CRUD completo para la entidad `Loans`.
-   [x] Implementación de la autenticación de usuarios con JWT.
-   [x] Desarrollo de interfaces para el CRUD de `Clients`, `Distributors` y `Loans`.
-   [x] Creación de un Dashboard inicial con resúmenes de datos.

## Refactorización de Roles y Asociados (Completado)

-   [x] **Base de Datos:**
    -   [x] Renombrar tabla `distributors` a `associates`.
    -   [x] Añadir tabla (ENUM type) `roles`.
    -   [x] Añadir columna `role` a la tabla `users`.
    -   [x] Actualizar `init.sql` con nuevos datos y contraseñas seguras.
-   [x] **Backend:**
    -   [x] Refactorizar el módulo `distributors` a `associates`.
    -   [x] Implementar sistema de autorización basado en roles (RBAC).
    -   [x] Proteger todos los endpoints relevantes con dependencias de rol.
    -   [x] Incluir el `role` del usuario en el token JWT.
-   [x] **Frontend:**
    -   [x] Refactorizar todos los componentes y páginas de "Distributor" a "Associate".
    -   [x] Actualizar el `AuthContext` para manejar la información del rol.
    -   [x] Implementar lógica en la UI para mostrar/ocultar elementos según el rol del usuario (ej. en `Navbar`).
-   [x] **Documentación:**
    -   [x] Actualizar `README.md`, `db_esquema_inicial.md`, y `funcionalidades.md`.
    -   [x] Crear `ROLES.md` para detallar los permisos.

## Tareas Pendientes / Futuras Mejoras

-   [ ] Implementar la lógica de negocio para que los usuarios con rol `asociado` solo puedan ver su propia información (sus clientes, sus préstamos).
-   [ ] Desarrollar la lógica de "confirmación" para el rol `auxiliar_administrativo`.
-   [ ] Añadir paginación a las listas (clientes, asociados, préstamos) para mejorar el rendimiento.
-   [ ] Mejorar la gestión de errores y feedback al usuario en el frontend.
-   [ ] Añadir tests unitarios y de integración.