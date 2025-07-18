# Guía de Inicio Rápido para Desarrolladores

Esta guía contiene los pasos esenciales para levantar el entorno de desarrollo de Credinet en tu máquina local.

## Prerrequisitos

-   **Docker:** Debes tener Docker y Docker Compose instalados.
    -   [Instruir Docker Engine](https://docs.docker.com/engine/install/)
    -   [Instruir Docker Compose](https://docs.docker.com/compose/install/)

## Levantando el Entorno

El proyecto está completamente containerizado, lo que simplifica enormemente la configuración.

1.  **Clona el Repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd credinet
    ```

2.  **Levanta los Servicios con Docker Compose:**
    Desde la raíz del proyecto, ejecuta el siguiente comando:
    ```bash
    docker compose up --build
    ```
    -   `--build`: Esta bandera fuerza la reconstrucción de las imágenes de Docker si ha habido cambios en los `Dockerfile` o en los archivos de dependencias (`requirements.txt`, `package.json`). Es buena práctica usarla la primera vez o después de actualizar dependencias.

3.  **¡Listo!** Una vez que los contenedores se hayan construido y levantado, la aplicación estará disponible en las siguientes URLs:

    -   **Frontend (Aplicación React):** [http://localhost:5174](http://localhost:5174)
    -   **Backend (API FastAPI):** [http://localhost:8001](http://localhost:8001)
    -   **Documentación de la API (Swagger):** [http://localhost:8001/docs](http://localhost:8001/docs)

## Acceso a la Base de Datos

-   La base de datos PostgreSQL está expuesta en el puerto `5432` de tu máquina local. Puedes conectarte a ella usando tu cliente de base de datos preferido (como DBeaver, pgAdmin, o la terminal) con las siguientes credenciales (definidas en `docker-compose.yml`):
    -   **Host:** `localhost`
    -   **Puerto:** `5432`
    -   **Usuario:** `credinet_user`
    -   **Contraseña:** `credinet_pass`
    -   **Base de datos:** `credinet_db`

## Deteniendo el Entorno

-   Para detener los contenedores, presiona `Ctrl + C` en la terminal donde ejecutaste `docker compose up`.
-   Para detenerlos y eliminar los contenedores (pero no los datos del volumen de la base de datos), puedes ejecutar:
    ```bash
    docker compose down
    ```
-   Si quieres eliminar también el volumen de la base de datos para empezar de cero:
    ```bash
    docker compose down --volumes
    ```
