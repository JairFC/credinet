# Arquitectura del Frontend

El frontend de CrediNet es una **Single-Page Application (SPA)** construida con **React** y **Vite**. Se encarga de presentar la interfaz de usuario y de interactuar con el backend a través de su API REST para mostrar y enviar datos.


## Manejo de Estado Global

Para el manejo de estado global se utiliza Context API de React, permitiendo compartir información entre componentes de manera eficiente. No se utiliza Redux.

## Estructura de Módulos

El código fuente se encuentra en `frontend/src/` y sigue una estructura modular basada en funcionalidades.

```
frontend/src/
├── main.jsx            # Punto de entrada de la aplicación React
├── App.jsx             # Componente principal, define el enrutamiento
├── services/
│   └── api.js          # Módulo para la comunicación con el backend
├── context/
│   └── AuthContext.jsx # Gestiona el estado de autenticación global
├── components/
│   ├── Navbar.jsx      # Barra de navegación
│   └── ProtectedRoute.jsx # Componente para proteger rutas
└── pages/
    ├── LoginPage.jsx   # Página de inicio de sesión
    ├── DashboardPage.jsx # Dashboard para administradores
    └── ...             # Otras páginas de la aplicación
```

## Archivos y Componentes Clave

### `main.jsx`

- **Propósito**: Es el punto de entrada de la aplicación.
- **Funcionalidades**:
  - Renderiza el componente principal (`App`) en el DOM.
  - Envuelve toda la aplicación en el `AuthProvider` para que todos los componentes hijos tengan acceso al contexto de autenticación.

### `App.jsx`

- **Propósito**: Define la estructura general de la aplicación y el sistema de enrutamiento.
- **Funcionalidades**:
  - Utiliza `react-router-dom` para definir las rutas de la aplicación.
  - Muestra la `Navbar` y el `Footer` en todas las páginas.
  - Utiliza el componente `ProtectedRoute` para proteger las rutas que requieren que el usuario esté autenticado y tenga un rol específico.

### `services/api.js`

- **Propósito**: Centraliza toda la comunicación con la API del backend.
- **Funcionalidades**:
  - Utiliza **Axios** para realizar solicitudes HTTP.
  - Exporta una instancia de Axios preconfigurada con la `baseURL` del backend.
  - Incluye un **interceptor** que añade automáticamente el token JWT (almacenado en `localStorage`) a la cabecera `Authorization` de cada solicitud saliente. Esto simplifica enormemente las llamadas a endpoints protegidos.

### `context/AuthContext.jsx`

- **Propósito**: Gestiona el estado de autenticación de forma global en toda la aplicación.
- **Funcionalidades**:
  - Provee un `AuthContext` que expone el estado del usuario (`user`), el token (`token`), y funciones para `login` y `logout`.
  - Al iniciar, intenta cargar el estado de autenticación desde `localStorage` para mantener la sesión del usuario.
  - La función `login` guarda el token y los datos del usuario en `localStorage` y en el estado del contexto.
  - La función `logout` limpia el estado y `localStorage`.

### `components/ProtectedRoute.jsx`

- **Propósito**: Es un componente de orden superior (Higher-Order Component) que restringe el acceso a ciertas rutas.
- **Funcionalidades**:
  - Obtiene el estado de autenticación del `AuthContext`.
  - Comprueba si el usuario está autenticado y si su rol está incluido en los roles permitidos para esa ruta.
  - Si el usuario no cumple las condiciones, lo redirige a la página de login (`/login`).
  - Si el usuario cumple las condiciones, renderiza el componente de la página solicitada.

## Flujo de Autenticación y Navegación

1.  El usuario llega a la aplicación. El `AuthContext` se inicializa y comprueba `localStorage` para ver si ya existe una sesión.
2.  Si el usuario no está autenticado y intenta acceder a una ruta protegida, `ProtectedRoute` lo redirige a `/login`.
3.  En la `LoginPage`, el usuario introduce sus credenciales. Al enviar el formulario, se llama a la función `login` del `AuthContext`.
4.  La función `login` realiza una solicitud a la API del backend a través de `api.js`.
5.  Si las credenciales son válidas, el backend devuelve un token JWT. `AuthContext` guarda este token en `localStorage` y actualiza su estado.
6.  El usuario es redirigido al dashboard correspondiente a su rol.
7.  Para cualquier solicitud posterior a la API, el interceptor de Axios en `api.js` adjuntará automáticamente el token, permitiendo el acceso a los recursos protegidos.
