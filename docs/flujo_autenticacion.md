# Flujo de Autenticación y Redirección

Este documento describe cómo el sistema maneja el inicio de sesión y la redirección para usuarios ya autenticados.

## Lógica de Redirección en el Login

Para mejorar la experiencia del usuario y evitar confusiones, el sistema implementa una lógica de redirección automática en la página de inicio de sesión (`/login`).

### Comportamiento

1.  **Verificación de Sesión**: Cuando un usuario navega a la página de `/login`, la aplicación comprueba si ya existe una sesión activa (es decir, si hay un token de autenticación válido).
2.  **Redirección Automática**:
    -   Si el usuario **ya está autenticado**, en lugar de mostrar el formulario de inicio de sesión, el sistema lo redirige automáticamente a su página principal (`/dashboard`).
    -   Si el usuario **no está autenticado**, se muestra el formulario de inicio de sesión con normalidad.

Este enfoque previene que un usuario que ya ha iniciado sesión se encuentre con la página de login de nuevo, lo cual podría ser confuso. La sesión se finaliza explícitamente a través del botón "Cerrar Sesión" en la barra de navegación.
