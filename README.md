# Credinet - Sistema de Gestión de Préstamos

Credinet es una aplicación web full-stack diseñada para la administración y gestión de préstamos. Proporciona una plataforma robusta para asociados, clientes y administradores, facilitando el ciclo de vida completo de un préstamo, desde su creación hasta su liquidación.

## Visión General de la Arquitectura

El sistema sigue una arquitectura de tres capas, completamente containerizada con Docker para asegurar un entorno de desarrollo y despliegue consistente y reproducible.

-   **Frontend:** Una Aplicación de Página Única (SPA) construida con **React**, encargada de la interfaz y la experiencia de usuario.
-   **Backend:** Una API RESTful asíncrona desarrollada con **FastAPI (Python)**, que maneja toda la lógica de negocio, autenticación y comunicación con la base de datos.
-   **Base de Datos:** Un motor **PostgreSQL** que persiste todos los datos de la aplicación.

Para una descripción más detallada de la arquitectura, consulta el documento de [Vista General de la Arquitectura](./docs/system_architecture/01_overview.md).

## Pila Tecnológica

-   **Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic, `asyncpg`
-   **Frontend:** React 18, Vite, `react-router-dom`, `axios`
-   **Base de Datos:** PostgreSQL 15
-   **Orquestación:** Docker & Docker Compose

## Cómo Empezar (Guía Rápida)

### Prerrequisitos

-   Docker
-   Docker Compose

### Levantando el Entorno

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd credinet
    ```

2.  **Levanta los servicios:**
    Desde la raíz del proyecto, ejecuta:
    ```bash
    docker compose up --build -d
    ```
    Este comando construirá las imágenes de Docker, iniciará los contenedores en segundo plano (`-d`) y aplicará las migraciones y semillas de la base de datos.

3.  **Accede a la Aplicación:**
    -   **Frontend:** [http://localhost:5174](http://localhost:5174)
    -   **Backend (API):** [http://localhost:8001/api/ping](http://localhost:8001/api/ping)
    -   **Documentación de la API (Swagger):** [http://localhost:8001/docs](http://localhost:8001/docs)

### Credenciales de Prueba

Puedes usar los siguientes usuarios definidos en los `seeds` de la base de datos para probar los diferentes roles:

-   **Administrador:**
    -   **Usuario:** `admin`
    -   **Contraseña:** `Sparrow20`
-   **Asociado:**
    -   **Usuario:** `asociado_test`
    -   **Contraseña:** `Sparrow20`
-   **Cliente:**
    -   **Usuario:** `sofia.vargas`
    -   **Contraseña:** `Sparrow20`

## Documentación del Proyecto

La documentación completa y detallada del proyecto se encuentra en el directorio `/docs`. Es la **fuente única de verdad** y se mantiene sincronizada con el código.

-   **[Lógica de Negocio](./docs/business_logic/):** Reglas, roles y conceptos clave.
-   **[Arquitectura del Sistema](./docs/system_architecture/):** Diagramas, esquema de la BD y descripción de componentes.
-   **[Guías y Protocolos](./docs/guides/):** Procedimientos para tareas comunes y refactorizaciones.
-   **[Onboarding](./docs/onboarding/):** Guías para nuevos desarrolladores.

## System Health Check (SH)

El proyecto incluye un servicio de `smoke-tester` que se ejecuta automáticamente al levantar el entorno. Este script valida la salud y la integridad de los componentes críticos. Para monitorear su ejecución:

```bash
docker logs -f credinet_smoke_tester
```

El SH **debe pasar al 100%** antes de fusionar cualquier cambio a la rama principal.