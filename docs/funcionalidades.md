# Funcionalidades y Endpoints de la API

Este documento describe los principales endpoints de la API de Credinet, su propósito y los roles de usuario que tienen acceso.

---

## Módulo: Autenticación (`/api/auth`)

-   **Registrar un Usuario (`POST /register`)**
    -   **Descripción:** Crea un nuevo usuario en el sistema.
    -   **Roles Permitidos:** Abierto a cualquier usuario (sin autenticación).

-   **Iniciar Sesión (`POST /login`)**
    -   **Descripción:** Autentica a un usuario y devuelve un token JWT.
    -   **Roles Permitidos:** Abierto a cualquier usuario.

-   **Obtener Usuario Actual (`GET /me`)**
    -   **Descripción:** Devuelve la información del usuario autenticado.
    -   **Roles Permitidos:** Cualquier rol autenticado.

-   **Listar Usuarios (`GET /users`)**
    -   **Descripción:** Devuelve una lista de todos los usuarios.
    -   **Roles Permitidos:** `desarrollador`, `administrador`.

---

## Módulo: Asociados (`/api/associates`)

-   **Crear un Asociado (`POST /`)**
    -   **Descripción:** Registra una nueva empresa asociada.
    -   **Roles Permitidos:** `desarrollador`, `administrador`, `auxiliar_administrativo`.

-   **Listar todos los Asociados (`GET /`)**
    -   **Descripción:** Devuelve una lista de todos los asociados.
    -   **Roles Permitidos:** `desarrollador`, `administrador`, `auxiliar_administrativo`, `asociado`.

-   **Actualizar un Asociado (`PUT /{associate_id}`)**
    -   **Descripción:** Modifica los datos de un asociado existente.
    -   **Roles Permitidos:** `desarrollador`, `administrador`, `auxiliar_administrativo`.

-   **Eliminar un Asociado (`DELETE /{associate_id}`)**
    -   **Descripción:** Elimina un asociado.
    -   **Roles Permitidos:** `desarrollador`, `administrador`.

-   **Obtener Resumen de Asociado (`GET /{associate_id}/summary`)**
    -   **Descripción:** Devuelve un resumen de la actividad de un asociado.
    -   **Roles Permitidos:** `desarrollador`, `administrador`, `auxiliar_administrativo`, `asociado`.

---

## Módulo: Clientes (`/api/clients`)

-   **CRUD completo (`POST`, `GET`, `PUT`, `DELETE`)**
    -   **Descripción:** Funcionalidad completa para gestionar clientes.
    -   **Roles Permitidos:** `desarrollador`, `administrador`, `auxiliar_administrativo`. (El rol `asociado` podría tener acceso de lectura en el futuro).

---

## Módulo: Préstamos (`/api/loans`)

-   **CRUD completo (`POST`, `GET`, `PUT`, `DELETE`)**
    -   **Descripción:** Funcionalidad completa para gestionar préstamos.
    -   **Roles Permitidos:** `desarrollador`, `administrador`, `auxiliar_administrativo`. (El rol `asociado` podría tener acceso de lectura a sus préstamos).

-   **Obtener Resumen Global (`GET /summary`)**
    -   **Descripción:** Devuelve un resumen de todos los préstamos en el sistema.
    -   **Roles Permitidos:** `desarrollador`, `administrador`, `auxiliar_administrativo`.

---

## Lógica de Negocio Clave

### Sistema de Comisiones

-   **Descripción:** El sistema permite asignar comisiones a los asociados por los préstamos que gestionan. Se basa en un modelo flexible que combina tasas por defecto a nivel de asociado con la capacidad de anularlas para préstamos específicos.
-   **Documentación Detallada:** Para una explicación completa de la arquitectura y el flujo de datos, consulta el documento [**Sistema de Comisiones**](./sistema_de_comisiones.md).
