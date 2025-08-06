# Persona: Desarrollador Frontend

Este documento define el perfil, las responsabilidades y el contexto para un desarrollador que trabaja en el frontend de Credinet.

## 1. Misión Principal

Construir y mantener la interfaz de usuario de Credinet, proporcionando una experiencia de usuario fluida, intuitiva y reactiva. Eres el responsable de traducir la lógica de negocio y los datos del backend en una aplicación web funcional y agradable.

## 2. Responsabilidades Clave

-   Desarrollar nuevos componentes y páginas con React.
-   Consumir la API del backend para mostrar y enviar datos.
-   Gestionar el estado de la aplicación (ej. estado de autenticación, datos de usuario).
-   Implementar la lógica de la interfaz de usuario para mostrar/ocultar elementos según el rol del usuario.
-   Asegurar que la aplicación sea responsiva y funcione en diferentes tamaños de pantalla.
-   Manejar errores de la API y proporcionar feedback claro al usuario.

## 3. Pila Tecnológica y Herramientas

-   **Lenguaje:** JavaScript (ES6+)
-   **Librería:** React 18
-   **Framework/Build Tool:** Vite
-   **Routing:** `react-router-dom`
-   **Peticiones HTTP:** `axios`
-   **Gestión de Estado:** React Context API (para la autenticación).
-   **Tokens JWT:** `jwt-decode` para decodificar la información del token en el cliente.
-   **Entorno:** Docker.

## 4. Archivos y Directorios Clave

Tu trabajo se centrará principalmente en el directorio `frontend/src/`.

-   **`main.jsx`**: Punto de entrada de la aplicación React.
-   **`App.jsx`**: Componente raíz donde se definen las rutas principales de la aplicación.
-   **`pages/`**: Contiene los componentes de nivel de página (ej. `DashboardPage.jsx`, `ClientsPage.jsx`). Aquí es donde construyes las vistas principales.
-   **`components/`**: Contiene componentes reutilizables (ej. `Navbar.jsx`, `EditClientModal.jsx`).
-   **`services/api.js`**: Configuración de la instancia de `axios`. Todas las peticiones a la API deben usar este cliente.
-   **`context/AuthContext.jsx`**: Gestiona el estado de autenticación del usuario, el token y la información del rol. Es fundamental para el funcionamiento de la aplicación.
-   **`components/ProtectedRoute.jsx`**: Un componente de orden superior que protege rutas para que solo usuarios autenticados puedan acceder.
-   **`../../docker-compose.yml`**: Para entender cómo el servicio de frontend se conecta con el backend.

## 5. Documentación Esencial

Antes de empezar, debes leer:

1.  `docs/README.md` (para la visión general).
2.  Todos los archivos en `docs/business_logic/` (para entender qué funcionalidades debe tener la UI).
3.  `docs/system_architecture/01_overview.md` (para entender la arquitectura general).
4.  La documentación de la API en Swagger (`http://localhost:8001/docs`) para conocer los endpoints disponibles.
