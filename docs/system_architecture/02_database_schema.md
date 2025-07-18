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

### `users` (Tabla Maestra de Personas)
Almacena la información para cualquier individuo en el sistema (administradores, asociados, clientes). Reemplaza a la antigua tabla `clients`.
- `id`: SERIAL PRIMARY KEY
- `username`: VARCHAR(50) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `role`: `user_role` NOT NULL
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `email`: VARCHAR(100) UNIQUE NOT NULL
- `phone_number`: VARCHAR(10) NOT NULL
- `birth_date`: DATE
- `curp`: VARCHAR(18) UNIQUE
- `profile_picture_url`: VARCHAR(255)
- `address_street`: VARCHAR(255)
- `address_ext_num`: VARCHAR(20)
- `address_int_num`: VARCHAR(20)
- `address_colonia`: VARCHAR(100)
- `address_zip_code`: VARCHAR(10)
- `address_state`: VARCHAR(50)
- `associate_id`: INTEGER REFERENCES `associates(id)`
- `updated_at`: TIMESTAMPTZ

### `beneficiaries` (Nueva Tabla)
Almacena los beneficiarios asociados a un usuario.
- `id`: SERIAL PRIMARY KEY
- `user_id`: INTEGER NOT NULL REFERENCES `users(id)`
- `full_name`: VARCHAR(255) NOT NULL
- `relationship`: VARCHAR(50) NOT NULL
- `phone_number`: VARCHAR(10) NOT NULL
- `updated_at`: TIMESTAMPTZ

### `clients`
**Esta tabla será eliminada.** Su información se fusionará en la tabla `users`.

### `loans`
Contiene la información de los préstamos.
- `id`: SERIAL PRIMARY KEY
- `user_id`: INTEGER NOT NULL REFERENCES `users(id)` - **Anteriormente `client_id`**.
- `associate_id`: INTEGER REFERENCES `associates(id)`
- ... (resto de los campos sin cambios)
- `updated_at`: TIMESTAMPTZ

### `payments`
Registra cada pago realizado a un préstamo.
- `id`: SERIAL PRIMARY KEY
- `loan_id`: INTEGER NOT NULL REFERENCES `loans(id)`
- `amount_paid`: NUMERIC(10, 2) NOT NULL
- `payment_date`: DATE NOT NULL
