# Arquitectura del Proyecto Credinet

Credinet es una aplicación web full-stack diseñada para la gestión de préstamos, clientes y asociados. Sigue una arquitectura moderna de tres capas, completamente containerizada con Docker para un desarrollo y despliegue consistentes.

## Componentes Principales

1.  **Frontend:**
    *   **Framework:** React (con Vite)
    *   **Lenguaje:** JavaScript (JSX)
    *   **Descripción:** Una aplicación de página única (SPA) que consume la API del backend. Es responsable de toda la interfaz de usuario.

2.  **Backend:**
    *   **Framework:** FastAPI
    *   **Lenguaje:** Python 3.11
    *   **Descripción:** Una API RESTful que maneja toda la lógica de negocio, la autenticación de usuarios y la comunicación con la base de datos.

3.  **Base de Datos:**
    *   **Motor:** PostgreSQL 15
    *   **Descripción:** Base de datos relacional que persiste todos los datos de la aplicación.

## Conceptos Clave de la Aplicación

### Módulos de Negocio

-   **Autenticación y Roles:** Gestiona el acceso de los usuarios. Ver `ROLES.md` para más detalles.
-   **Asociados (Associates):** Entidades (antes llamadas "Distribuidoras") que originan préstamos.
-   **Clientes (Clients):** Los beneficiarios finales de los préstamos.
-   **Préstamos (Loans):** El núcleo del negocio, gestiona el ciclo de vida de un préstamo.
-   **Pagos (Payments):** Registra los pagos realizados a los préstamos.

### Sistema de Roles y Permisos (RBAC)

La aplicación utiliza un sistema de Control de Acceso Basado en Roles (RBAC) para gestionar los permisos. Cada usuario tiene un rol asignado que define qué acciones puede realizar. Los roles actuales son:

-   `desarrollador`
-   `administrador`
-   `auxiliar_administrativo`
-   `asociado`

Para una descripción detallada de los permisos de cada rol, por favor consulta el archivo `docs/ROLES.md`.