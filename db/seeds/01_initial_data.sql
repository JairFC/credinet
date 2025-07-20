-- =============================================================================
-- DATOS DE EJEMPLO (SEED DATA)
-- Este script está diseñado para ser seguro de ejecutar múltiples veces.
-- =============================================================================

-- 1. Poblar tablas sin dependencias
INSERT INTO associate_levels (id, name, max_loan_amount) VALUES
(1, 'Plata', 100000.00),
(2, 'Oro', 250000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, name) VALUES
(1, 'desarrollador'),
(2, 'administrador'),
(3, 'auxiliar_administrativo'),
(4, 'asociado'),
(5, 'cliente')
ON CONFLICT (id) DO NOTHING;

INSERT INTO associates (id, name, level_id, contact_person, contact_email) VALUES
(1, 'Asociado Central', 1, 'Ana García', 'ana.garcia@central.com'),
(2, 'Promotores del Norte', 2, 'Carlos Sánchez', 'carlos.sanchez@norte.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Poblar la tabla de usuarios
-- Contraseña para todos: Sparrow20
-- Hash: $2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6
INSERT INTO users (id, username, password_hash, first_name, last_name, email, phone_number, associate_id) VALUES
(1, 'jair', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Jair', 'FC', 'jair@dev.com', '5511223344', NULL),
(2, 'admin', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Admin', 'User', 'admin@credinet.com', '5522334455', NULL),
(3, 'asociado_test', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Asociado', 'Prueba', 'asociado@test.com', '5533445566', 1),
(4, 'sofia.vargas', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Sofía', 'Vargas', 'sofia.vargas@email.com', '5544556677', NULL),
(5, 'juan.perez', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Juan', 'Pérez', 'juan.perez@email.com', '5555667788', NULL),
(6, 'laura.mtz', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Laura', 'Martínez', 'laura.martinez@email.com', '5566778899', NULL)
ON CONFLICT (id) DO NOTHING;

-- Asignar roles a los usuarios
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- jair -> desarrollador
(2, 2), -- admin -> administrador
(2, 5), -- admin -> cliente (MULTI-ROL)
(3, 4), -- asociado_test -> asociado
(4, 5), -- sofia.vargas -> cliente
(5, 5), -- juan.perez -> cliente
(6, 5)  -- laura.mtz -> cliente
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 3. Poblar tablas dependientes
INSERT INTO loans (id, user_id, associate_id, amount, interest_rate, term_months, status) VALUES
(1, 5, 1, 5000.00, 15.5, 12, 'active'),
(2, 4, 2, 10000.00, 12.0, 24, 'active'),
(3, 6, 1, 2500.00, 20.0, 6, 'paid'),
(4, 5, 2, 7500.00, 18.0, 18, 'defaulted')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, loan_id, amount_paid, payment_date) VALUES
(1, 1, 452.27, CURRENT_DATE - INTERVAL '1 month'),
(2, 2, 470.73, CURRENT_DATE - INTERVAL '1 month'),
(3, 3, 439.69, CURRENT_DATE - INTERVAL '7 months'),
(4, 4, 270.89, CURRENT_DATE - INTERVAL '2 months')
ON CONFLICT (id) DO NOTHING;

INSERT INTO beneficiaries (id, user_id, full_name, relationship, phone_number) VALUES
(1, 5, 'Maria Pérez', 'Cónyuge', '5599887766')
ON CONFLICT (id) DO NOTHING;

-- 4. Reiniciar secuencias para evitar conflictos con futuras inserciones
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('associates_id_seq', (SELECT MAX(id) FROM associates));
SELECT setval('associate_levels_id_seq', (SELECT MAX(id) FROM associate_levels));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('loans_id_seq', (SELECT MAX(id) FROM loans));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('beneficiaries_id_seq', (SELECT MAX(id) FROM beneficiaries));

