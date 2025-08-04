# Guía: System Health Check (SH)

El System Health Check (SH) es el sistema de diagnóstico de arranque de Credinet. Su misión es actuar como la primera línea de defensa contra regresiones, verificando la integridad de todos los componentes críticos de la aplicación después de cada cambio.

No es solo una prueba, es una simulación de una secuencia de arranque que valida desde la conectividad básica hasta las reglas de negocio más complejas.

## ¿Cómo Funciona?

El servicio `smoke-tester` se ejecuta automáticamente con `docker compose up`. Realiza una serie de chequeos en un orden estricto. Si un chequeo crítico falla, el proceso se detiene y reporta un error, indicando que el sistema está en un estado inestable.

### Visualización y Registro

Puedes monitorear el SH de dos maneras:

1.  **En Tiempo Real:**
    ```bash
    docker logs -f credinet_smoke_tester
    ```
    Verás una salida clara y formateada, indicando el progreso y el resultado (`[ OK ]` o `[FAIL]`) de cada paso.

2.  **Registro Persistente:**
    El SH genera un log detallado de cada ejecución en `backend/system_health_check.log`. Este archivo es invaluable para la depuración post-mortem.

## Cobertura de Chequeos

El SH está estructurado en secciones lógicas para facilitar su entendimiento y expansión.

### Sección 1: Conectividad
-   **[1/15] PING:** Verifica que el servidor backend esté en línea y respondiendo en `/api/ping`.

### Sección 2: Autenticación (AUTH)
-   **[2/15] Login Admin:** Confirma que el usuario `admin` puede autenticarse y recibir un token.
-   **[3/15] Login Asociado:** Confirma que el usuario `asociado_test` puede autenticarse.
-   **[4/15] Login Cliente:** Confirma que la usuaria `sofia.vargas` puede autenticarse.

### Sección 3: Control de Acceso Basado en Roles (RBAC)
Esta es la sección más crítica. Verifica que cada rol tenga los permisos correctos y, más importante, que **no tenga** permisos que no le corresponden.

-   **Permisos de Administrador:**
    -   **[5/15]** Puede acceder a la lista de usuarios (`/api/auth/users`).
    -   **[6/15]** Puede acceder a la lista de asociados (`/api/associates/`).
    -   **[7/15]** Puede acceder al dashboard global (`/api/loans/summary`).

-   **Permisos de Asociado:**
    -   **[8/15]** **NO PUEDE** acceder a la lista de usuarios.
    -   **[9/15]** Puede acceder a su propio dashboard (`/api/associates/dashboard`).

-   **Permisos de Cliente:**
    -   **[10/15]** **NO PUEDE** acceder a la lista de usuarios.
    -   **[11/15]** **NO PUEDE** acceder a la lista de asociados.
    -   **[12/15]** Puede acceder a su propio dashboard (`/api/auth/me/dashboard`).

### Sección 4: Lógica de Negocio (Filtros)
-   **[13/15] LOGIC: Filtro de Usuarios:** Verifica que el filtro de búsqueda en la lista de usuarios funcione correctamente.
-   **[14/15] LOGIC: Filtro de Asociados:** Verifica que el filtro de búsqueda en la lista de asociados funcione correctamente.
-   **[15/15] LOGIC: Filtro de Préstamos:** Verifica que el filtro de búsqueda en la lista de préstamos funcione correctamente.

## Protocolo de Uso

-   **Obligatorio:** El SH **debe pasar al 100%** antes de fusionar cualquier cambio a la rama principal.
-   **Expansión:** Al añadir una nueva funcionalidad o endpoint, es **mandatorio** añadir un nuevo chequeo al script `backend/smoke_test.py` en la sección correspondiente.
-   **Estabilidad del Entorno:** El `docker-compose.yml` ha sido fortalecido con un `healthcheck` de base de datos que previene condiciones de carrera durante el arranque, asegurando que el SH se ejecute sobre una base estable.
