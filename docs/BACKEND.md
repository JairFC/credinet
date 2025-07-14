# Arquitectura del Backend

El backend de CrediNet está construido con **FastAPI**, un framework web moderno y de alto rendimiento para Python. Su principal responsabilidad es gestionar la lógica de negocio, la autenticación de usuarios y la interacción con la base de datos PostgreSQL.

## Estructura de Módulos

El código está organizado en módulos, siguiendo las mejores prácticas para mantener el código limpio, escalable y fácil de mantener.

```
backend/app/
├── main.py             # Punto de entrada de la aplicación FastAPI
├── logic.py            # Lógica de negocio principal y cálculos
├── cli.py              # Herramientas de línea de comandos para desarrollo
├── requirements.txt    # Dependencias de Python
├── core/
│   └── config.py       # Gestión de configuración y variables de entorno
├── common/
│   └── database.py     # Gestión de la conexión a la base de datos
├── auth/
│   ├── jwt.py          # Lógica para crear y verificar tokens JWT
│   └── routes.py       # Endpoints para login y autenticación
├── associates/
│   └── routes.py       # Endpoints para gestionar socios
├── clients/
│   └── routes.py       # Endpoints para gestionar clientes
└── loans/
    ├── routes.py       # Endpoints para gestionar préstamos y pagos
    └── utils.py        # Funciones de utilidad para cálculos de préstamos
```

## Archivos Clave

### `main.py`

- **Propósito**: Es el corazón de la aplicación. Se encarga de:
  - Crear la instancia principal de FastAPI.
  - Configurar CORS (Cross-Origin Resource Sharing) para permitir la comunicación con el frontend.
  - Montar los routers de los diferentes módulos (`auth`, `users`, `clients`, `loans`, `associates`).
  - Definir un endpoint raíz (`/`) para verificar que el servicio está en funcionamiento.

### `logic.py`

- **Propósito**: Contiene la lógica de negocio central que no está directamente atada a un endpoint específico.
- **Funcionalidades**:
  - **`get_dashboard_data`**: Recopila y resume las estadísticas para el dashboard del administrador (total de préstamos, pagos, comisiones, etc.).
  - **`get_associate_dashboard_data`**: Recopila y resume las estadísticas para el dashboard de un socio específico.

### `core/config.py`

- **Propósito**: Centraliza la gestión de la configuración de la aplicación.
- **Funcionalidades**:
  - Carga variables de entorno desde un archivo `.env` (aunque el archivo no está en el repositorio por seguridad).
  - Define y expone variables de configuración como `DATABASE_URL`, `SECRET_KEY`, y `ALGORITHM` para la codificación de JWT.

### `common/database.py`

- **Propósito**: Gestiona el ciclo de vida de la conexión a la base de datos.
- **Funcionalidades**:
  - Crea un "motor" de base de datos (`engine`) usando SQLAlchemy.
  - Define una `SessionLocal` para crear sesiones de base de datos.
  - Proporciona una función `get_db` que puede ser usada como una dependencia en los endpoints de FastAPI para inyectar una sesión de base de datos en cada solicitud. Esto asegura que la sesión se cierre correctamente después de cada operación.

## Flujo de una Solicitud

1.  Una solicitud llega desde el frontend a un endpoint definido en uno de los archivos `routes.py`.
2.  FastAPI procesa la solicitud, validando los datos de entrada (si es necesario) usando modelos de Pydantic (definidos en los archivos `schemas.py` de cada módulo).
3.  El endpoint utiliza la dependencia `get_db` para obtener una sesión de base de datos.
4.  La lógica del endpoint interactúa con la base de datos a través de esta sesión para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar).
5.  Si se requiere lógica de negocio compleja, el endpoint puede llamar a funciones definidas en `logic.py` o en los archivos `utils.py` de cada módulo.
6.  Finalmente, el endpoint devuelve una respuesta al frontend, que FastAPI convierte automáticamente a formato JSON.
