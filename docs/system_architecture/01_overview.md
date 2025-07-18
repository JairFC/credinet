# Arquitectura del Sistema: Vista General

Credinet es una aplicación web full-stack diseñada para la gestión de préstamos. Sigue una arquitectura moderna de tres capas, completamente containerizada con Docker para un desarrollo y despliegue consistentes.

## 1. Componentes Principales

![Diagrama de Arquitectura Simple](https://i.imgur.com/9yZ3B8r.png)

1.  **Frontend:**
    *   **Framework:** React (con Vite)
    *   **Lenguaje:** JavaScript (JSX)
    *   **Descripción:** Una Aplicación de Página Única (SPA) que consume la API del backend. Es responsable de toda la interfaz de usuario y la experiencia del cliente. Se comunica con el backend a través de una API RESTful.

2.  **Backend:**
    *   **Framework:** FastAPI
    *   **Lenguaje:** Python 3.11
    *   **Descripción:** Una API RESTful asíncrona que maneja toda la lógica de negocio, la autenticación de usuarios (JWT), la autorización por roles (RBAC) y la comunicación con la base de datos.

3.  **Base de Datos:**
    *   **Motor:** PostgreSQL 15
    *   **Descripción:** Base de datos relacional que persiste todos los datos de la aplicación: usuarios, clientes, préstamos, etc.

## 2. Orquestación y Despliegue

-   **Docker:** Cada componente (frontend, backend, db) tiene su propio `Dockerfile`, lo que permite empaquetar la aplicación y sus dependencias en imágenes de contenedor portátiles.
-   **Docker Compose:** El archivo `docker-compose.yml` orquesta el levantamiento de los tres servicios, configura las redes, los volúmenes y las variables de entorno, permitiendo levantar todo el entorno de desarrollo con un solo comando (`docker compose up`).
