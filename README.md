# CrediNet - Sistema de Gestión de Créditos

[![Estado de la Construcción](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/JairFC/credinet)
[![Licencia](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

CrediNet es un sistema integral de gestión de créditos y préstamos diseñado para la empresa "CrediCuenta".

## Documentación Completa

Toda la documentación técnica y funcional del proyecto se encuentra en la carpeta [`/docs`](./docs/).

Para empezar, te recomendamos leer el documento de [**Contexto General**](./docs/CONTEXTO_GENERAL.md), que ofrece una visión general de la arquitectura, el propósito del proyecto y cómo ponerlo en marcha.

## Inicio Rápido

### Prerrequisitos

- Docker
- Docker Compose

### Instalación y Ejecución

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/JairFC/credinet.git
    cd credinet
    ```

2.  **Levanta los servicios con Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Accede a la aplicación:**
    - **Frontend:** [http://localhost:5173](http://localhost:5173)
    - **Backend (API Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)

## Flujo de Trabajo

Este proyecto utiliza el flujo de trabajo **GitFlow**. Todo el desarrollo se realiza en la rama `develop` y las nuevas funcionalidades se trabajan en ramas `feature/...`. La rama `main` se reserva exclusivamente para versiones estables de producción.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
