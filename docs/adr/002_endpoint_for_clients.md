# ADR-002: Endpoint para Obtener Clientes

**Estado:** Propuesto

**Contexto:**

La página de creación de préstamos (`CreateLoanPage.jsx`) necesita mostrar una lista de clientes para que el usuario pueda seleccionar a quién se le otorgará el préstamo. Actualmente, la página obtiene todos los usuarios del sistema y los filtra en el frontend para mostrar solo aquellos con el rol de "cliente".

Este enfoque es ineficiente y puede causar problemas de rendimiento a medida que aumenta el número de usuarios en el sistema.

**Decisión:**

Se propone crear un nuevo endpoint en el backend (`/api/auth/users/clients`) que devuelva una lista de todos los usuarios con el rol de "cliente".

**Consecuencias:**

*   **Ventajas:**
    *   Mejora la eficiencia de la página de creación de préstamos al reducir la cantidad de datos transferidos entre el frontend y el backend.
    *   Simplifica el código del frontend al eliminar la necesidad de filtrar la lista de usuarios.
*   **Desventajas:**
    *   Añade un nuevo endpoint al backend, lo que aumenta ligeramente la superficie de la API.
