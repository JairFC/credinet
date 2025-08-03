# Guía: Uso del CLI de Backend

El proyecto incluye una interfaz de línea de comandos (CLI) para realizar tareas administrativas comunes. El CLI se encuentra en `backend/cli.py` y se puede invocar desde el contenedor del backend.

## Crear un Nuevo Usuario

Para crear un nuevo usuario, puedes usar el comando `create` del CLI. Este comando requiere un nombre de usuario y una contraseña.

### Ejemplo de Uso

1.  **Accede al contenedor del backend:**

    ```bash
    docker exec -it credinet_backend bash
    ```

2.  **Ejecuta el comando `create`:**

    ```bash
    python cli.py create --username <nombre_de_usuario> --password <contraseña>
    ```

    Por ejemplo, para crear un usuario llamado `nuevo_usuario` con la contraseña `nueva_contraseña`, ejecutarías:

    ```bash
    python cli.py create --username nuevo_usuario --password nueva_contraseña
    ```

### Notas Importantes

-   Este comando solo crea el usuario en la tabla `users`. No asigna roles ni crea entidades asociadas.
-   Si el usuario ya existe, el comando no realizará ningún cambio.
