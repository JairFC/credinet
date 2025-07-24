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
-   **[1/12] PING:** Verifica que el servidor backend esté en línea y respondiendo en `/api/ping`.

### Sección 2: Autenticación (AUTH)
-   **[2/12] Login Admin:** Confirma que el usuario `admin` puede autenticarse y recibir un token.
-   **[3/12] Login Asociado:** Confirma que el usuario `asociado_test` puede autenticarse.
-   **[4/12] Login Cliente:** Confirma que la usuaria `sofia.vargas` puede autenticarse.

### Sección 3: Control de Acceso Basado en Roles (RBAC)
Esta es la sección más crítica. Verifica que cada rol tenga los permisos correctos y, más importante, que **no tenga** permisos que no le corresponden.

-   **Permisos de Administrador:**
    -   **[5/12]** Puede acceder a la lista de usuarios (`/api/users`).
    -   **[6/12]** Puede acceder a la lista de asociados (`/api/associates/`).
    -   **[7/12]** Puede acceder al dashboard global (`/api/loans/summary`).

-   **Permisos de Asociado:**
    -   **[8/12]** **NO PUEDE** acceder a la lista de usuarios.
    -   **[9/12]** Puede acceder a su propio dashboard (`/api/associates/dashboard`).

-   **Permisos de Cliente:**
    -   **[10/12]** **NO PUEDE** acceder a la lista de usuarios.
    -   **[11/12]** **NO PUEDE** acceder a la lista de asociados.
    -   **[12/12]** Puede acceder a su propio dashboard (`/api/auth/me/dashboard`).

## Protocolo de Uso

-   **Obligatorio:** El SH **debe pasar al 100%** antes de fusionar cualquier cambio a la rama principal.
-   **Expansión:** Al añadir una nueva funcionalidad o endpoint, es **mandatorio** añadir un nuevo chequeo al script `backend/smoke_test.py` en la sección correspondiente.
-   **Estabilidad del Entorno:** El `docker-compose.yml` ha sido fortalecido con un `healthcheck` de base de datos que previene condiciones de carrera durante el arranque, asegurando que el SH se ejecute sobre una base estable.
