# Arquitectura: Esquema de la Base de Datos

Este documento describe la estructura de las tablas en la base de datos PostgreSQL, basada en el archivo `db/init.sql` que es la fuente de verdad.

## Tablas Principales

### `roles`
Almacena los diferentes roles de usuario en el sistema.
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(50) UNIQUE NOT NULL

### `user_roles`
Tabla de unión que asigna roles a los usuarios, permitiendo un modelo multi-rol.
- `user_id`: INTEGER NOT NULL REFERENCES `users(id)`
- `role_id`: INTEGER NOT NULL REFERENCES `roles(id)`

### `associate_levels`
Define los diferentes niveles de asociados y sus límites de crédito.
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(50) UNIQUE NOT NULL
- `max_loan_amount`: NUMERIC(12, 2)

### `associates`
Almacena la información de las entidades de negocio asociadas.
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(150) UNIQUE NOT NULL
- `level_id`: INTEGER NOT NULL REFERENCES `associate_levels(id)`
- `contact_person`: VARCHAR(150)
- `contact_email`: VARCHAR(100) UNIQUE
- `default_commission_rate`: NUMERIC(5, 2) NOT NULL
- `updated_at`: TIMESTAMPTZ

### `users` (Tabla Maestra de Personas)
Almacena la información para cualquier individuo en el sistema (administradores, asociados, clientes). Reemplaza a la antigua tabla `clients`.
- `id`: SERIAL PRIMARY KEY
- `username`: VARCHAR(50) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `email`: VARCHAR(100) UNIQUE
- `phone_number`: VARCHAR(10) NOT NULL
- `birth_date`: DATE
- `curp`: VARCHAR(18) UNIQUE
- `profile_picture_url`: VARCHAR(255)
- `address_street`: VARCHAR(255)
- `address_ext_num`: VARCHAR(20)
- `address_int_num`: VARCHAR(20)
- `address_colonia`: VARCHAR(100)
- `address_zip_code`: VARCHAR(10)
- `address_municipality`: VARCHAR(100)
- `address_state`: VARCHAR(50)
- `associate_id`: INTEGER REFERENCES `associates(id)`
- `updated_at`: TIMESTAMPTZ

### `beneficiaries`
Almacena los beneficiarios asociados a un usuario.
- `id`: SERIAL PRIMARY KEY
- `user_id`: INTEGER NOT NULL REFERENCES `users(id)`
- `full_name`: VARCHAR(255) NOT NULL
- `relationship`: VARCHAR(50) NOT NULL
- `phone_number`: VARCHAR(10) NOT NULL
- `updated_at`: TIMESTAMPTZ

### `loans`
Contiene la información de los préstamos.
- `id`: SERIAL PRIMARY KEY
- `user_id`: INTEGER NOT NULL REFERENCES `users(id)`
- `associate_id`: INTEGER REFERENCES `associates(id)`
- `amount`: NUMERIC(10, 2) NOT NULL
- `interest_rate`: NUMERIC(5, 2) NOT NULL
- `commission_rate`: NUMERIC(5, 2) NOT NULL
- `term_months`: NUMERIC(5, 2) NOT NULL
- `payment_frequency`: VARCHAR(10) NOT NULL
- `status`: VARCHAR(20) NOT NULL DEFAULT 'pending'
- `updated_at`: TIMESTAMPTZ

### `payments`
Registra cada pago realizado a un préstamo.
- `id`: SERIAL PRIMARY KEY
- `loan_id`: INTEGER NOT NULL REFERENCES `loans(id)`
- `amount_paid`: NUMERIC(10, 2) NOT NULL
- `payment_date`: DATE NOT NULL
- `updated_at`: TIMESTAMPTZ
