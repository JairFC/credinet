# Guía: Flujo de Creación de Clientes

La creación de un nuevo cliente es un proceso unificado y potente, gestionado a través de la página "Crear Nuevo Cliente" en el frontend. Este flujo está diseñado para ser intuitivo, reducir errores y agilizar la captura de datos mediante automatizaciones inteligentes.

## Interfaz de Usuario: Secciones Colapsables

El formulario está organizado en secciones colapsables para mantener la interfaz limpia y guiar al usuario paso a paso:

1.  **Datos de la Cuenta:** Credenciales básicas (`username`, `password`).
2.  **Datos Personales:** Información demográfica del cliente.
3.  **Datos de Contacto:** `email` y `phone_number`.
4.  **Dirección:** Domicilio del cliente.
5.  **Beneficiario (Opcional):** Sección para añadir un beneficiario.

## Automatizaciones y Características Clave

### 1. Generación Automática de CURP

-   **Cómo funciona:** A medida que el usuario completa los campos de `nombre`, `apellidos`, `fecha de nacimiento`, `género` y `estado de nacimiento`, el campo CURP se genera y actualiza automáticamente en tiempo real.
-   **Tecnología:** La lógica reside en el frontend, dentro del componente `CreateClientPage.jsx`, utilizando una función de utilidad (`generateCurp`).

### 2. Autocompletado de Dirección por Código Postal

-   **Cómo funciona:** Cuando el usuario introduce un Código Postal de 5 dígitos, el sistema dispara una llamada a la API del backend (`GET /api/utils/zip-code/{zip_code}`).
-   **Backend:** El backend consulta una API externa (API de Tau) para obtener la información del código postal.
-   **Frontend:** Al recibir la respuesta, el formulario autocompleta los campos de `Estado`, `Municipio` y proporciona una lista desplegable de `Colonias` para que el usuario seleccione la correcta. Esto minimiza errores de captura y agiliza el proceso.

### 3. Validación de Teléfono

-   **Frontend:** Se realiza una validación en tiempo real para asegurar que el número de teléfono contenga exactamente 10 dígitos, mostrando un mensaje de error si el formato es incorrecto.
-   **Backend:** El Pydantic schema en el backend (`UserCreate`) también aplica una validación estricta para asegurar la integridad de los datos antes de guardarlos en la base de datos.

### 4. Creación Atómica de Entidades

-   Al enviar el formulario, el frontend empaqueta todos los datos, incluyendo la información opcional del beneficiario, en un único objeto.
-   El backend (`POST /api/auth/users`) está diseñado para recibir este objeto y, en una única transacción de base de datos, crear el registro en la tabla `users` y, si se proporciona, también en la tabla `beneficiaries`, asegurando la consistencia de los datos.
