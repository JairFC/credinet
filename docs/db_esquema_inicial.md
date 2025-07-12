# Esquema de la Base de Datos (Actualizado)

Este documento describe la estructura de las tablas en la base de datos de PostgreSQL.

## Tipo de Dato Personalizado: `user_role`

Se ha definido un tipo `ENUM` para estandarizar los roles de usuario en el sistema.

```sql
CREATE TYPE user_role AS ENUM ('desarrollador', 'administrador', 'auxiliar_administrativo', 'asociado');
```

---

## Tabla: `users`

Almacena las credenciales y el rol de cada usuario del sistema.

| Columna         | Tipo        | Restricciones                               | Descripción                               |
|-----------------|-------------|---------------------------------------------|-------------------------------------------|
| `id`            | `SERIAL`    | `PRIMARY KEY`                               | Identificador único del usuario.          |
| `username`      | `VARCHAR(50)` | `UNIQUE`, `NOT NULL`                        | Nombre de usuario para el login.          |
| `password_hash` | `VARCHAR(255)`| `NOT NULL`                                  | Hash de la contraseña del usuario.        |
| `role`          | `user_role` | `NOT NULL`, `DEFAULT 'asociado'`            | Rol del usuario dentro del sistema.       |
| `created_at`    | `TIMESTAMPTZ`| `DEFAULT CURRENT_TIMESTAMP`                 | Fecha y hora de creación del registro.    |

---

## Tabla: `associates`

Almacena la información de los asociados (anteriormente `distributors`).

| Columna          | Tipo          | Restricciones                 | Descripción                               |
|------------------|---------------|-------------------------------|-------------------------------------------|
| `id`             | `SERIAL`      | `PRIMARY KEY`                 | Identificador único del asociado.         |
| `name`           | `VARCHAR(150)`| `UNIQUE`, `NOT NULL`          | Nombre del asociado.                      |
| `contact_person` | `VARCHAR(150)`| `NULL`                        | Persona de contacto.                      |
| `contact_email`  | `VARCHAR(100)`| `UNIQUE`, `NULL`              | Email de contacto.                        |
| `created_at`     | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP`   | Fecha y hora de creación del registro.    |

---

## Tabla: `clients`

Almacena la información de los clientes finales.

| Columna      | Tipo           | Restricciones                 | Descripción                               |
|--------------|----------------|-------------------------------|-------------------------------------------|
| `id`         | `SERIAL`       | `PRIMARY KEY`                 | Identificador único del cliente.          |
| `user_id`    | `INTEGER`      | `FK to users`                 | Usuario que gestiona este cliente.        |
| `first_name` | `VARCHAR(100)` | `NOT NULL`                    | Nombre del cliente.                       |
| `last_name`  | `VARCHAR(100)` | `NOT NULL`                    | Apellido del cliente.                     |
| `email`      | `VARCHAR(100)` | `UNIQUE`, `NULL`              | Email del cliente.                        |
| `created_at` | `TIMESTAMPTZ`  | `DEFAULT CURRENT_TIMESTAMP`   | Fecha y hora de creación del registro.    |

---

## Tabla: `loans`

Contiene la información de los préstamos.

| Columna             | Tipo          | Restricciones                               | Descripción                                       |
|---------------------|---------------|---------------------------------------------|---------------------------------------------------|
| `id`                | `SERIAL`      | `PRIMARY KEY`                               | Identificador único del préstamo.                 |
| `client_id`         | `INTEGER`     | `NOT NULL`, `FK to clients`                 | Cliente que recibe el préstamo.                   |
| `associate_id`      | `INTEGER`     | `NULL`, `FK to associates`                  | Asociado que originó el préstamo (opcional).      |
| `amount`            | `NUMERIC(10,2)`| `NOT NULL`                                  | Monto total del préstamo.                         |
| `interest_rate`     | `NUMERIC(5,2)`| `NOT NULL`                                  | Tasa de interés anual.                            |
| `commission_rate`   | `NUMERIC(5,2)`| `NOT NULL`, `DEFAULT 0.00`                  | Tasa de comisión para el asociado.                |
| `term_months`       | `INTEGER`     | `NOT NULL`                                  | Plazo del préstamo en meses.                      |
| `payment_frequency` | `VARCHAR(10)` | `NOT NULL`, `DEFAULT 'quincenal'`           | Frecuencia de los pagos.                          |
| `status`            | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'pending'`             | Estado actual del préstamo.                       |
| `created_at`        | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP`                 | Fecha y hora de creación del registro.            |

---

## Tabla: `payments`

Registra cada pago realizado a un préstamo.

| Columna       | Tipo          | Restricciones                 | Descripción                               |
|---------------|---------------|-------------------------------|-------------------------------------------|
| `id`          | `SERIAL`      | `PRIMARY KEY`                 | Identificador único del pago.             |
| `loan_id`     | `INTEGER`     | `NOT NULL`, `FK to loans`     | Préstamo al que pertenece el pago.        |
| `amount_paid` | `NUMERIC(10,2)`| `NOT NULL`                    | Monto pagado.                             |
| `payment_date`| `DATE`        | `NOT NULL`, `DEFAULT CURRENT_DATE` | Fecha en que se realizó el pago.          |
| `created_at`  | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP`   | Fecha y hora de creación del registro.    |