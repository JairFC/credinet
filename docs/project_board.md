# Tablero de Proyecto de Credinet

Este tablero utiliza el formato Kanban en Markdown para rastrear el progreso de las tareas.

**Columnas:**
-   **Pendiente (To Do):** Tareas que han sido identificadas pero no han comenzado.
-   **En Progreso (In Progress):** Tareas que están siendo trabajadas activamente por un agente.
-   **Hecho (Done):** Tareas completadas y verificadas.

---

## Pendiente (To Do)

-   **[PAGOS - UI]:** Implementar UI para añadir y ver pagos en la vista de "Detalle del Préstamo".
-   **[PORTAL CLIENTE - BACKEND]:** Añadir el rol `cliente` al `ENUM` en `init.sql` y a los esquemas de la API.
-   **[PORTAL CLIENTE - BACKEND]:** Crear un endpoint (`/api/me/dashboard` o similar) que devuelva los datos específicos para el dashboard del cliente.
-   **[PORTAL CLIENTE - BACKEND]:** Asegurar que los endpoints existentes (`/api/loans`, `/api/payments`) filtren correctamente para devolver solo los datos del cliente autenticado si su rol es `cliente`.
-   **[PORTAL CLIENTE - FRONTEND]:** Crear la página `ClientDashboardPage.jsx`.
-   **[PORTAL CLIENTE - FRONTEND]:** Modificar `DashboardPage.jsx` para redirigir a `ClientDashboardPage.jsx` si el rol del usuario es `cliente`.
-   **[PORTAL CLIENTE - FRONTEND]:** Crear las vistas de detalle de préstamos y pagos para el cliente.
-   **[MEJORA]:** Añadir paginación a las listas de la API (clientes, asociados, préstamos) para mejorar el rendimiento.
-   **[MEJORA]:** Mejorar la gestión de errores y feedback al usuario en el frontend.
-   **[CALIDAD]:** Añadir tests unitarios y de integración para el backend.
-   **[CALIDAD]:** Añadir tests para el frontend.

---

## En Progreso (In Progress)

-   *Actualmente no hay tareas en progreso.*

---

## Bloqueado (Blocked)

-   **[TESTING]:** Implementar el framework de pruebas automatizadas del backend.
    -   **Bloqueo:** Problema de configuración persistente con `pytest-asyncio` y la fixture del cliente HTTP (`AttributeError: 'async_generator' object has no attribute 'post'`). Requiere investigación más profunda.

---

## Hecho (Done)

-   **[DOCS]:** Crear sistema de gestión de contexto y documentación.
-   **[DOCS]:** Crear sistema de agentes (`personas`).
-   **[CRUD PRÉSTAMOS - BACKEND]:** Implementar endpoints `POST`, `PUT`, `DELETE` para `/api/loans`.
-   **[CRUD PRÉSTAMOS - FRONTEND]:** Implementar UI para crear, editar y eliminar préstamos (`LoansPage`, `EditLoanModal`).
-   **[REFACTOR]:** Refactorizar `Distributors` a `Associates` en todo el proyecto.
-   **[AUTH]:** Implementar sistema de autenticación (JWT) y autorización (RBAC).
-   **[SETUP]:** Containerizar toda la aplicación con Docker.
