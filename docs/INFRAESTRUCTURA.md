# Arquitectura de Infraestructura y Despliegue

CrediNet utiliza **Docker** y **Docker Compose** para gestionar su infraestructura, lo que permite un entorno de desarrollo, pruebas y producción consistente y reproducible.

## Visión General

El sistema está compuesto por tres servicios principales definidos en el archivo `docker-compose.yml`:

1.  **`db`**: La base de datos PostgreSQL.
2.  **`backend`**: La API de FastAPI (Python).
3.  **`frontend`**: La aplicación de React.

Estos servicios se ejecutan en contenedores aislados pero se comunican entre sí a través de una red interna de Docker.

## `docker-compose.yml`

Este archivo es el núcleo de la infraestructura. Define cómo se construyen y se ejecutan los contenedores.

```yaml
services:
  db:
    image: postgres:13
    container_name: credinet_db
    volumes:
      - postgres_data:/var/lib/postgresql/data/
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - POSTGRES_USER=credinet
      - POSTGRES_PASSWORD=credinet
      - POSTGRES_DB=credinet
    ports:
      - "5432:5432"
    networks:
      - credinet-network

  backend:
    build: ./backend
    container_name: credinet_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend/app:/app/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    networks:
      - credinet-network

  frontend:
    build: ./frontend
    container_name: credinet_frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - credinet-network

volumes:
  postgres_data:

networks:
  credinet-network:
    driver: bridge
```

### Servicio `db`

- **Imagen**: Utiliza la imagen oficial de `postgres:13`.
- **Volúmenes**:
  - `postgres_data`: Un volumen nombrado para persistir los datos de la base de datos, evitando que se pierdan si el contenedor se detiene o se elimina.
  - `./db/init.sql`: Monta el script de inicialización de la base de datos. Docker ejecutará este script automáticamente la primera vez que se cree el contenedor, creando las tablas y datos iniciales.
- **Entorno**: Configura las credenciales y el nombre de la base de datos.
- **Puertos**: Expone el puerto `5432` para que se pueda acceder a la base de datos desde fuera de la red de Docker (por ejemplo, para usar una herramienta de gestión de bases de datos).

### Servicio `backend`

- **Build**: Construye la imagen de Docker a partir del `Dockerfile` ubicado en la carpeta `./backend`.
- **Comando**: Ejecuta la aplicación FastAPI usando `uvicorn`. La opción `--reload` es útil para el desarrollo, ya que reinicia el servidor automáticamente cuando detecta cambios en el código.
- **Volúmenes**: Monta el código de la aplicación (`./backend/app`) dentro del contenedor. Esto permite que los cambios realizados en el código local se reflejen instantáneamente en el contenedor sin necesidad de reconstruir la imagen.
- **Puertos**: Expone el puerto `8000`, que es donde se ejecuta la API.
- **`depends_on`**: Asegura que el contenedor de la base de datos (`db`) se inicie antes que el backend.

### Servicio `frontend`

- **Build**: Construye la imagen a partir del `Dockerfile` de la carpeta `./frontend`.
- **Puertos**: Expone el puerto `5173`, que es el puerto de desarrollo de Vite.
- **`depends_on`**: Asegura que el contenedor del backend se inicie antes que el frontend.

## Cómo Ejecutar el Proyecto

Para levantar toda la infraestructura, se debe ejecutar el siguiente comando en la raíz del proyecto:

```bash
docker-compose up --build
```

- `docker-compose up`: Inicia todos los servicios definidos en el archivo.
- `--build`: Fuerza la reconstrucción de las imágenes si ha habido cambios en los `Dockerfile` o en el código fuente.

Una vez ejecutado, se podrá acceder a:
- **Frontend**: `http://localhost:5173`
- **Backend (API Docs)**: `http://localhost:8000/docs`
