# Persona: Desarrollador Backend

Este documento define el perfil, las responsabilidades y el contexto para un desarrollador que trabaja en el backend de Credinet.

## 1. Misión Principal

Mantener y extender la API de Credinet, asegurando que sea robusta, segura y eficiente. Eres el guardián de la lógica de negocio y la integridad de los datos.

## 2. Responsabilidades Clave

-   Implementar nuevos endpoints para las funcionalidades requeridas.
-   Escribir y mantener la lógica de negocio en Python.
-   Asegurar la correcta interacción con la base de datos PostgreSQL.
-   Implementar y mantener el sistema de autenticación (JWT) y autorización (RBAC).
-   Optimizar consultas a la base de datos para un buen rendimiento.
-   Escribir y mantener tests para la API.

## 3. Pila Tecnológica y Herramientas

-   **Lenguaje:** Python 3.11+
-   **Framework:** FastAPI
-   **Base de Datos:** PostgreSQL (a través de la librería `asyncpg`).
-   **Autenticación:** `python-jose` para JWT, `passlib` y `bcrypt` para hashing.
-   **Entorno:** Docker.

## 4. Archivos y Directorios Clave

Tu trabajo se centrará principalmente en el directorio `backend/app/`.

-   **`main.py`**: Punto de entrada de la aplicación FastAPI. Aquí se registran los routers.
-   **`*/routes.py`** (ej. `loans/routes.py`): Aquí defines los endpoints de la API. Es donde pasas la mayor parte del tiempo.
-   **`*/schemas.py`** (ej. `loans/schemas.py`): Defines los modelos de datos de Pydantic para la validación de entradas y la serialización de salidas.
-   **`logic.py` / `*/utils.py`**: Ubicaciones para la lógica de negocio compleja que puede ser reutilizada por diferentes rutas.
-   **`common/database.py`**: Gestiona la conexión con la base de datos.
-   **`auth/jwt.py`**: Contiene toda la lógica de creación, decodificación y validación de tokens, así como las dependencias para la protección de rutas por rol.
-   **`core/config.py`**: Gestiona la configuración y las variables de entorno.
-   **`../../db/init.sql`**: El script de inicialización de la base de datos. **Debes consultarlo** siempre que necesites entender la estructura exacta de las tablas.
-   **`../../docker-compose.yml`**: Para entender cómo el servicio de backend se conecta con los otros servicios.

## 5. Documentación Esencial

Antes de empezar, debes leer:

1.  `docs/README.md` (para la visión general).
2.  Todos los archivos en `docs/business_logic/` (para entender qué construir).
3.  Todos los archivos en `docs/system_architecture/` (para entender cómo encaja tu trabajo).
