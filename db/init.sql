-- Definir un tipo ENUM para los roles de usuario
CREATE TYPE user_role AS ENUM ('desarrollador', 'administrador', 'auxiliar_administrativo', 'asociado');

-- Crear la tabla de asociados (antes distribuidoras)
CREATE TABLE IF NOT EXISTS associates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    contact_person VARCHAR(150),
    contact_email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'asociado',
    associate_id INTEGER REFERENCES associates(id) ON DELETE SET NULL, -- Vínculo con un asociado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_associate_if_role_is_associate CHECK (role <> 'asociado' OR associate_id IS NOT NULL)
);

-- Crear la tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de préstamos
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    associate_id INTEGER REFERENCES associates(id), -- Antes distributor_id
    amount NUMERIC(10, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Tasa de comisión para el asociado
    term_months INTEGER NOT NULL,
    payment_frequency VARCHAR(10) NOT NULL DEFAULT 'quincenal', -- quincenal, mensual
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, active, paid, defaulted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- DATOS DE EJEMPLO (SEED DATA)
-- =============================================================================

-- Asociados de ejemplo
INSERT INTO associates (name, contact_person, contact_email) VALUES
('Asociado Central', 'Ana García', 'ana.garcia@central.com'),
('Promotores del Norte', 'Carlos Sánchez', 'carlos.sanchez@norte.com'),
('Créditos del Sureste', 'Beatriz López', 'beatriz.lopez@sureste.com')
ON CONFLICT (name) DO NOTHING;

-- Contraseña para todos los usuarios de prueba: Sparrow20
-- Hash: $2b$12$nQ5r/gNN1inmSLCYEvUtCOfo4G27JbRwSDAe7/IX40tVtAdRc78q.
INSERT INTO users (username, password_hash, role, associate_id) VALUES
('jair', '$2b$12$nQ5r/gNN1inmSLCYEvUtCOfo4G27JbRwSDAe7/IX40tVtAdRc78q.', 'desarrollador', NULL),
('admin', '$2b$12$nQ5r/gNN1inmSLCYEvUtCOfo4G27JbRwSDAe7/IX40tVtAdRc78q.', 'administrador', NULL),
('auxiliar', '$2b$12$nQ5r/gNN1inmSLCYEvUtCOfo4G27JbRwSDAe7/IX40tVtAdRc78q.', 'auxiliar_administrativo', NULL),
('asociado_test', '$2b$12$nQ5r/gNN1inmSLCYEvUtCOfo4G27JbRwSDAe7/IX40tVtAdRc78q.', 'asociado', 1) -- Este usuario está vinculado al 'Asociado Central'
ON CONFLICT (username) DO NOTHING;

-- Clientes de ejemplo (Asignados al usuario admin por defecto)
INSERT INTO clients (user_id, first_name, last_name, email) VALUES
(2, 'Juan', 'Pérez', 'juan.perez@email.com'),
(2, 'María', 'Rodríguez', 'maria.rodriguez@email.com'),
(2, 'Pedro', 'Gómez', 'pedro.gomez@email.com'),
(2, 'Laura', 'Martínez', 'laura.martinez@email.com')
ON CONFLICT (email) DO NOTHING;

-- Préstamos de ejemplo
INSERT INTO loans (client_id, associate_id, amount, interest_rate, commission_rate, term_months, payment_frequency, status) VALUES
(1, 1, 5000.00, 15.5, 5.00, 12, 'quincenal', 'active'),
(2, null, 10000.00, 12.0, 0.00, 24, 'mensual', 'pending'),
(1, 2, 2500.00, 20.0, 7.50, 6, 'quincenal', 'paid'),
(3, 1, 7500.00, 18.0, 6.00, 36, 'mensual', 'active');

-- Pagos de ejemplo
INSERT INTO payments (loan_id, amount_paid, payment_date) VALUES
(1, 452.27, CURRENT_DATE - INTERVAL '2 months'),
(1, 452.27, CURRENT_DATE - INTERVAL '1 month'),
(3, 439.69, CURRENT_DATE - INTERVAL '8 months'),
(3, 439.69, CURRENT_DATE - INTERVAL '7 months'),
(4, 270.89, CURRENT_DATE - INTERVAL '1 month');