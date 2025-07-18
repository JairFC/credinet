# Arquitectura: Esquema de la Base de Datos

Este documento describe la estructura de las tablas en la base de datos PostgreSQL, basada en el archivo `db/init.sql` que es la fuente de verdad.

## Tipo de Dato Personalizado: `user_role`

Se ha definido un tipo `ENUM` para estandarizar los roles de usuario. Con la nueva funcionalidad de portal de cliente, se añadirá el rol `cliente`.

```sql
-- Definición actual
CREATE TYPE user_role AS ENUM ('desarrollador', 'administrador', 'auxiliar_administrativo', 'asociado');

-- Definición futura propuesta
CREATE TYPE user_role AS ENUM ('desarrollador', 'administrador', 'auxiliar_administrativo', 'asociado', 'cliente');
```

---

## Tablas Principales

### `associates`
Almacena la informaci��n de los asociados que originan préstamos.
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(150) UNIQUE NOT NULL
- `contact_person`: VARCHAR(150)
- `contact_email`: VARCHAR(100) UNIQUE
- `default_commission_rate`: NUMERIC(5, 2) NOT NULL - Tasa de comisión por defecto.

### `users`
Almacena las credenciales y el rol de cada usuario.
- `id`: SERIAL PRIMARY KEY
- `username`: VARCHAR(50) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `role`: `user_role` NOT NULL
- `associate_id`: INTEGER REFERENCES `associates(id)` - **Requerido si el rol es `asociado`**.
- **Propuesta para rol `cliente`:** Se podría añadir una columna `client_id` o gestionar la relación desde la tabla `clients`.

### `clients`
Almacena la información de los clientes finales.
- `id`: SERIAL PRIMARY KEY
- `user_id`: INTEGER REFERENCES `users(id)` - **Actualmente opcional**. Para el portal de clientes, este campo se volverá **obligatorio** para los clientes que se autogestionan, vinculando al cliente con su registro de usuario.
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `email`: VARCHAR(100) UNIQUE

### `loans`
Contiene la información de los préstamos.
- `id`: SERIAL PRIMARY KEY
- `client_id`: INTEGER NOT NULL REFERENCES `clients(id)`
- `associate_id`: INTEGER REFERENCES `associates(id)` - Asociado que originó el préstamo.
- `amount`: NUMERIC(10, 2) NOT NULL
- `interest_rate`: NUMERIC(5, 2) NOT NULL
- `commission_rate`: NUMERIC(5, 2) NOT NULL - Tasa de comisión final para este préstamo.
- `term_months`: INTEGER NOT NULL
- `payment_frequency`: VARCHAR(10) NOT NULL - ('quincenal', 'mensual')
- `status`: VARCHAR(20) NOT NULL - ('pending', 'active', 'paid', 'defaulted')

### `payments`
Registra cada pago realizado a un préstamo.
- `id`: SERIAL PRIMARY KEY
- `loan_id`: INTEGER NOT NULL REFERENCES `loans(id)`
- `amount_paid`: NUMERIC(10, 2) NOT NULL
- `payment_date`: DATE NOT NULL
