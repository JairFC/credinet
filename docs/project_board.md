# Tablero de Proyecto de Credinet

Este tablero utiliza el formato Kanban en Markdown para rastrear el progreso de las tareas.

**Columnas:**
-   **Pendiente (To Do):** Tareas que han sido identificadas pero no han comenzado.
-   **En Progreso (In Progress):** Tareas que están siendo trabajadas activamente por un agente.
-   **Hecho (Done):** Tareas completadas y verificadas.

---

## Pendiente (To Do)

### Épica: Modernización de Perfiles de Usuario

-   **[REFACTOR - DB]:** Fusionar la tabla `clients` en `users` y añadir los nuevos campos.
-   **[FEATURE - DB]:** Crear la tabla `associate_levels` para normalizar los niveles de asociado.
-   **[FEATURE - DB]:** Crear la nueva tabla `beneficiaries` y su relación con `users`.
-   **[REFACTOR - BACKEND]:** Adaptar toda la API para usar el nuevo modelo de `users`.
-   **[FEATURE - BACKEND]:** Crear el CRUD de la API para `/api/users/{id}/beneficiaries`.
-   **[FEATURE - FRONTEND]:** Mover la funcionalidad de registro a un modal en la página de administración de usuarios.
-   **[FEATURE - FRONTEND]:** Implementar la UI para gestionar beneficiarios en el formulario de usuario.
-   **[FEATURE - CURP]:** Implementar el generador de CURP en el frontend.
-   **[FEATURE - TELÉFONO]:** Implementar input masking en el frontend.
-   **[FEATURE - DIRECCIÓN]:** Implementar autocompletado de dirección.
-   **[FEATURE - FOTO PERFIL]:** Implementar subida de fotos de perfil.
-   **[FEATURE - FECHA NACIMIENTO]:** Implementar selector de calendario.

### Otras Tareas

-   **[SEGURIDAD]:** Restringir el endpoint de registro y mover la funcionalidad a la vista de administrador.
-   **[PAGOS - UI]:** Implementar UI para añadir y ver pagos en la vista de "Detalle del Préstamo".
-   **[MEJORA]:** Añadir paginación a las listas de la API.
-   **[MEJORA]:** Mejorar la gestión de errores en el frontend.
-   **[CALIDAD]:** Añadir tests unitarios y de integración para el backend.
-   **[CALIDAD]:** Añadir tests para el frontend.

---

## En Progreso (In Progress)

### Épica: Mejoras de Calidad de Datos y UX

-   **[FEATURE - CURP VALIDATION]:** Implementar flujo de validación de CURP único en el alta de clientes, con verificación en tiempo real y modal de confirmación/corrección.

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
