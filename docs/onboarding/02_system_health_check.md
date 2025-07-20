# Guía: System Health Check

Para garantizar la estabilidad del proyecto y evitar regresiones, hemos implementado un servicio de pruebas automatizadas llamado "System Health Check" (`smoke-tester`). Su misión es verificar que los flujos de usuario más críticos de la API funcionen correctamente después de cada despliegue.

## ¿Cómo Funciona?

El servicio se ejecuta automáticamente con `docker compose up`. Realiza una serie de pruebas en secuencia. Si alguna prueba falla, el script termina con un error, indicando que el despliegue está roto.

Puedes ver el resultado en cualquier momento con:
```bash
docker logs credinet_smoke_tester
```

## Validaciones Actuales

El script realiza las siguientes validaciones:

1.  **[1/6] Ping al Servidor:**
    *   **Acción:** `GET /api/ping`
    *   **Verifica:** Que el servidor backend esté en línea y respondiendo.

2.  **[2/6] Login de Administrador:**
    *   **Acción:** `POST /api/auth/login` con credenciales de `admin`.
    *   **Verifica:** La lógica de autenticación, hashing de contraseñas y conexión a la BD.

3.  **[3/6] Endpoints Críticos de Administrador:**
    *   **Acción:** Usa el token de admin para hacer peticiones `GET` a las rutas principales.
    *   **Verifica:**
        *   `GET /api/auth/users`: La paginación de usuarios funciona.
        *   `GET /api/associates/`: La paginación de asociados funciona.
        *   `GET /api/loans/`: La paginación de préstamos funciona.
        *   `GET /api/loans/summary`: El dashboard de admin funciona.
        *   `GET /api/loans/1`: La vista de detalle de un préstamo funciona.

4.  **[4/6] Login de Asociado:**
    *   **Acción:** `POST /api/auth/login` con credenciales de `asociado_test`.
    *   **Verifica:** La autenticación para roles no administrativos.

5.  **[5/6] Dashboard de Asociado:**
    *   **Acción:** `GET /api/associates/dashboard` con el token de asociado.
    *   **Verifica:** El endpoint específico del dashboard de asociado.

6.  **[6/6] Lista de Préstamos de Asociado:**
    *   **Acción:** `GET /api/loans/` con el token de asociado.
    *   **Verifica:** Que el filtrado automático de préstamos por asociado funcione y devuelva datos.

## Protocolo de Uso

-   **Antes de Pedir Validación:** Siempre ejecuta el health check después de un despliegue. Si falla, depúralo.
-   **Al Añadir Nuevas Rutas:** Añade una nueva prueba al script `backend/smoke_test.py` para cubrir la nueva funcionalidad.