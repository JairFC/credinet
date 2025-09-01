-- =============================================================================
-- DATOS DE EJEMPLO (SEED DATA) - v3.1 (Normalización de Direcciones)
-- Este script está diseñado para ser seguro de ejecutar múltiples veces.
-- =============================================================================

-- 1. Poblar tablas sin dependencias
INSERT INTO associate_levels (id, name, max_loan_amount) VALUES
(1, 'Bronce', 50000.00),
(2, 'Plata', 100000.00),
(3, 'Oro', 250000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, name) VALUES
(1, 'desarrollador'),
(2, 'administrador'),
(3, 'auxiliar_administrativo'),
(4, 'asociado'),
(5, 'cliente')
ON CONFLICT (id) DO NOTHING;

INSERT INTO associates (id, name, level_id, contact_person, contact_email, default_commission_rate) VALUES
(1, 'Asociado Central', 2, 'Ana García', 'ana.garcia@central.com', 5.5),
(2, 'Promotores del Norte', 3, 'Carlos Sánchez', 'carlos.sanchez@norte.com', 4.0),
(3, 'Crédito Rápido del Sur', 1, 'Beatriz Mendoza', 'beatriz.mendoza@sur.com', 7.0)
ON CONFLICT (id) DO NOTHING;

-- Contraseña para todos: Sparrow20
-- Hash: $2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6
INSERT INTO users (id, username, password_hash, first_name, last_name, email, phone_number, birth_date, curp, associate_id) VALUES
(1, 'jair', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Jair', 'FC', 'jair@dev.com', '5511223344', '1990-01-15', 'FERJ900115HDFXXX01', NULL),
(2, 'admin', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Admin', 'Total', 'admin@credinet.com', '5522334455', NULL, NULL, NULL),
(3, 'asociado_test', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Asociado', 'Prueba', 'asociado@test.com', '5533445566', NULL, NULL, 1),
(4, 'sofia.vargas', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Sofía', 'Vargas', 'sofia.vargas@email.com', '5544556677', '1985-05-20', 'VARS850520MDFXXX02', NULL),
(5, 'juan.perez', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Juan', 'Pérez', 'juan.perez@email.com', '5555667788', '1992-11-30', 'PERJ921130HDFXXX03', NULL),
(6, 'laura.mtz', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Laura', 'Martínez', 'laura.martinez@email.com', '5566778899', NULL, NULL, NULL),
(7, 'aux.admin', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'Pedro', 'Ramírez', 'pedro.ramirez@credinet.com', '5577889900', NULL, NULL, NULL),
(8, 'asociado_norte', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'User', 'Norte', 'user@norte.com', '5588990011', NULL, NULL, 2),
(1000, 'aval_test', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'María', 'Aval', 'maria.aval@demo.com', '6143618296', '1995-05-25', 'FACJ950525HCHRRR04', NULL)
ON CONFLICT (id) DO NOTHING;

-- Aval para usuario de pruebas (id=1000)
-- AVISO: Este registro es validado por el System Health Check (SH) automatizado.
-- Si cambias el nombre, parentesco o curp aquí, también debes actualizar el test en backend/smoke_test.py
INSERT INTO guarantors (user_id, full_name, relationship, phone_number, curp)
VALUES (1000, 'Maria Cruz', 'Madre', '6143618296', 'FACJ950525HCHRRR04');

-- Usuario de pruebas completo para avales (statement independiente)
INSERT INTO users (id, username, password_hash, first_name, last_name, email, phone_number, birth_date, curp, associate_id) VALUES
(1000, 'aval_test', '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6', 'María', 'Aval', 'maria.aval@demo.com', '6143618296', '1995-05-25', 'FACJ950525HCHRRR04', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (2, 5), (3, 4), (4, 5), (5, 5), (6, 5), (7, 3), (8, 4), (1000, 5)
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO addresses (user_id, street, colony, zip_code, municipality, state) VALUES
(1, 'Calle Falsa 123', 'Centro', '06000', 'Cuauhtémoc', 'Ciudad de México'),
(4, 'Av. Siempre Viva 742', 'Springfield', '90210', 'Springfield', 'California'),
(5, 'Calle del Sol 45', 'Roma Norte', '06700', 'Cuauhtémoc', 'Ciudad de México'),
(1000, 'Calle Aval 100', 'Centro', '31000', 'Chihuahua', 'Chihuahua')
ON CONFLICT (user_id) DO NOTHING;

-- 4. Poblar tablas dependientes
INSERT INTO loans (id, user_id, associate_id, amount, interest_rate, term_months, status, commission_rate) VALUES
(1, 5, 1, 5000.00, 15.5, 12, 'active', 5.5),
(2, 4, 2, 10000.00, 12.0, 24, 'active', 4.0),
(3, 6, 1, 2500.00, 20.0, 6, 'paid', 5.5),
(4, 5, 2, 7500.00, 18.0, 18, 'defaulted', 4.0),
(5, 5, 1, 12000.00, 14.0, 24, 'paid', 6.0),
(6, 4, NULL, 20000.00, 10.0, 36, 'active', 0),
(7, 6, 3, 40000.00, 22.0, 12, 'pending', 7.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, loan_id, amount_paid, payment_date) VALUES
(1, 1, 452.27, CURRENT_DATE - INTERVAL '2 months'), (2, 1, 452.27, CURRENT_DATE - INTERVAL '1 month'),
(3, 2, 470.73, CURRENT_DATE - INTERVAL '1 month'),
(4, 3, 439.69, CURRENT_DATE - INTERVAL '7 months'), (5, 3, 439.69, CURRENT_DATE - INTERVAL '6 months'), (6, 3, 439.69, CURRENT_DATE - INTERVAL '5 months'), (7, 3, 439.69, CURRENT_DATE - INTERVAL '4 months'), (8, 3, 439.69, CURRENT_DATE - INTERVAL '3 months'), (9, 3, 439.69, CURRENT_DATE - INTERVAL '2 months'),
(10, 4, 270.89, CURRENT_DATE - INTERVAL '5 months'),
(11, 5, 577.59, CURRENT_DATE - INTERVAL '12 months'), (12, 5, 577.59, CURRENT_DATE - INTERVAL '11 months')
ON CONFLICT (id) DO NOTHING;

INSERT INTO beneficiaries (id, user_id, full_name, relationship, phone_number) VALUES
        (1, 5, 'Maria Pérez', 'Cónyuge', '5599887766'), 
        (2, 5, 'Roberto Pérez', 'Padre', '5512345678'),
        (3, 4, 'Luis Vargas', 'Hermano', '5587654321'),
        (100, 1000, 'Luis Aval', 'Hermano', '6140000001')
        ON CONFLICT (id) DO NOTHING;-- =============================================================================
-- DATOS DE PAGINACIÓN
-- =============================================================================

-- Insertar 30 nuevos asociados para paginación
INSERT INTO associates (id, name, level_id, contact_person, contact_email, default_commission_rate)
SELECT
    i,
    'Asociado de Prueba ' || i,
    (i % 3) + 1,
    'Contacto ' || i,
    'contacto' || i || '@prueba.com',
    5.0 + (i % 5)
FROM generate_series(4, 33) AS i
ON CONFLICT (id) DO NOTHING;

-- Insertar 30 nuevos clientes para paginación
INSERT INTO users (id, username, password_hash, first_name, last_name, email, phone_number)
SELECT
    i,
    'cliente' || i,
    '$2b$12$aSMdt0Kd8I2lrCIvSNbxx.X5U.BmY9MAZAoPvM/MgK5mXOxQgq0s6',
    'Nombre' || i,
    'Apellido' || i,
    'cliente' || i || '@email.com',
    '55' || (10000000 + i)::text
FROM generate_series(9, 38) AS i
ON CONFLICT (id) DO NOTHING;

-- Asignar rol de cliente a los nuevos usuarios
INSERT INTO user_roles (user_id, role_id)
SELECT i, 5 FROM generate_series(9, 38) AS i
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Insertar 50 nuevos préstamos para paginación
INSERT INTO loans (id, user_id, associate_id, amount, interest_rate, term_months, status, commission_rate)
SELECT
    i,
    (i % 30) + 9,  -- Asigna a los nuevos clientes (IDs 9 a 38)
    (i % 30) + 4,  -- Asigna a los nuevos asociados (IDs 4 a 33)
    1000 + (i * 100),
    15.0 + (i % 10),
    12,
    CASE WHEN i % 3 = 0 THEN 'paid' ELSE 'active' END,
    5.0
FROM generate_series(8, 57) AS i
ON CONFLICT (id) DO NOTHING;


SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('associates_id_seq', (SELECT MAX(id) FROM associates));
SELECT setval('associate_levels_id_seq', (SELECT MAX(id) FROM associate_levels));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('loans_id_seq', (SELECT MAX(id) FROM loans));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('beneficiaries_id_seq', (SELECT MAX(id) FROM beneficiaries));
SELECT setval('addresses_id_seq', (SELECT MAX(id) FROM addresses));

INSERT INTO guarantors (user_id, full_name, relationship, phone_number, curp)
VALUES
    (5, 'Pedro Aval', 'Padre', '5512345678', 'AVAP800101HDFLLL02'),
    (4, 'Laura Aval', 'Hermana', '5523456789', 'AVAL850520MDFLLL03'),
    (6, 'Maria Cruz', 'Amiga', '6143618296', 'FACJ950525HCHRRR04');