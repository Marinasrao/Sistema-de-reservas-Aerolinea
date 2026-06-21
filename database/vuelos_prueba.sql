USE aerolinea_db;

-- =========================================================
-- VUELOS DE PRUEBA PARA RESERVAS Y ASIGNACIÓN DE ASIENTOS
-- Fechas dinámicas: siempre se crean a partir de la fecha actual.
-- Clases disponibles:
-- ECONOMY: A1-A120
-- BUSINESS: B1-B24
-- FIRST: F1-F8
-- =========================================================

INSERT INTO flights (
    aircraft_type,
    airline,
    arrival_date,
    arrival_time,
    business_seats,
    departure_date,
    departure_time,
    description,
    destination,
    economy_seats,
    first_seats,
    flight_number,
    flight_status,
    origin,
    price,
    seats_available
)
SELECT
    'Boeing 737',
    'Aerolinea',
    CURDATE() + INTERVAL 7 DAY,
    '10:30:00',
    24,
    CURDATE() + INTERVAL 7 DAY,
    '08:30:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Bariloche',
    120,
    8,
    CONCAT('TEST-BA-BRC-', DATE_FORMAT(CURDATE() + INTERVAL 7 DAY, '%Y%m%d')),
    'programado',
    'Buenos Aires',
    150000,
    152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Bariloche'
      AND departure_date = CURDATE() + INTERVAL 7 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 737', 'Aerolinea',
    CURDATE() + INTERVAL 8 DAY, '12:15:00', 24,
    CURDATE() + INTERVAL 8 DAY, '10:15:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Buenos Aires', 120, 8,
    CONCAT('TEST-BRC-BA-', DATE_FORMAT(CURDATE() + INTERVAL 8 DAY, '%Y%m%d')),
    'programado', 'Bariloche', 150000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Bariloche'
      AND destination = 'Buenos Aires'
      AND departure_date = CURDATE() + INTERVAL 8 DAY
      AND departure_time = '10:15:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Airbus A320', 'Aerolinea',
    CURDATE() + INTERVAL 9 DAY, '10:20:00', 24,
    CURDATE() + INTERVAL 9 DAY, '08:30:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Mendoza', 120, 8,
    CONCAT('TEST-BA-MDZ-', DATE_FORMAT(CURDATE() + INTERVAL 9 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 135000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Mendoza'
      AND departure_date = CURDATE() + INTERVAL 9 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Airbus A320', 'Aerolinea',
    CURDATE() + INTERVAL 10 DAY, '12:15:00', 24,
    CURDATE() + INTERVAL 10 DAY, '10:15:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Buenos Aires', 120, 8,
    CONCAT('TEST-MDZ-BA-', DATE_FORMAT(CURDATE() + INTERVAL 10 DAY, '%Y%m%d')),
    'programado', 'Mendoza', 135000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Mendoza'
      AND destination = 'Buenos Aires'
      AND departure_date = CURDATE() + INTERVAL 10 DAY
      AND departure_time = '10:15:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 737', 'Aerolinea',
    CURDATE() + INTERVAL 11 DAY, '10:10:00', 24,
    CURDATE() + INTERVAL 11 DAY, '08:30:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Córdoba', 120, 8,
    CONCAT('TEST-BA-COR-', DATE_FORMAT(CURDATE() + INTERVAL 11 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 95000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Córdoba'
      AND departure_date = CURDATE() + INTERVAL 11 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 737', 'Aerolinea',
    CURDATE() + INTERVAL 12 DAY, '12:00:00', 24,
    CURDATE() + INTERVAL 12 DAY, '10:15:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Buenos Aires', 120, 8,
    CONCAT('TEST-COR-BA-', DATE_FORMAT(CURDATE() + INTERVAL 12 DAY, '%Y%m%d')),
    'programado', 'Córdoba', 95000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Córdoba'
      AND destination = 'Buenos Aires'
      AND departure_date = CURDATE() + INTERVAL 12 DAY
      AND departure_time = '10:15:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 737', 'Aerolinea',
    CURDATE() + INTERVAL 13 DAY, '11:10:00', 24,
    CURDATE() + INTERVAL 13 DAY, '08:30:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Ushuaia', 120, 8,
    CONCAT('TEST-BA-USH-', DATE_FORMAT(CURDATE() + INTERVAL 13 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 210000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Ushuaia'
      AND departure_date = CURDATE() + INTERVAL 13 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 737', 'Aerolinea',
    CURDATE() + INTERVAL 14 DAY, '10:10:00', 24,
    CURDATE() + INTERVAL 14 DAY, '08:30:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Salta', 120, 8,
    CONCAT('TEST-BA-SAL-', DATE_FORMAT(CURDATE() + INTERVAL 14 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 125000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Salta'
      AND departure_date = CURDATE() + INTERVAL 14 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 737', 'Aerolinea',
    CURDATE() + INTERVAL 15 DAY, '10:10:00', 24,
    CURDATE() + INTERVAL 15 DAY, '08:30:00',
    'Vuelo de prueba generado para reservas y asignación de asientos.',
    'Iguazú', 120, 8,
    CONCAT('TEST-BA-IGU-', DATE_FORMAT(CURDATE() + INTERVAL 15 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 125000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Iguazú'
      AND departure_date = CURDATE() + INTERVAL 15 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Airbus A330', 'GlobalAir',
    CURDATE() + INTERVAL 16 DAY, '20:30:00', 24,
    CURDATE() + INTERVAL 16 DAY, '08:30:00',
    'Vuelo internacional de prueba generado para reservas y asignación de asientos.',
    'Madrid', 120, 8,
    CONCAT('TEST-BA-MAD-', DATE_FORMAT(CURDATE() + INTERVAL 16 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 680000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Madrid'
      AND departure_date = CURDATE() + INTERVAL 16 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Airbus A330', 'GlobalAir',
    CURDATE() + INTERVAL 17 DAY, '21:30:00', 24,
    CURDATE() + INTERVAL 17 DAY, '08:30:00',
    'Vuelo internacional de prueba generado para reservas y asignación de asientos.',
    'París', 120, 8,
    CONCAT('TEST-BA-PAR-', DATE_FORMAT(CURDATE() + INTERVAL 17 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 710000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'París'
      AND departure_date = CURDATE() + INTERVAL 17 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 787', 'SkyPremium',
    CURDATE() + INTERVAL 18 DAY, '23:20:00', 24,
    CURDATE() + INTERVAL 18 DAY, '08:30:00',
    'Vuelo internacional de prueba generado para reservas y asignación de asientos.',
    'Miami', 120, 8,
    CONCAT('TEST-BA-MIA-', DATE_FORMAT(CURDATE() + INTERVAL 18 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 590000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Miami'
      AND departure_date = CURDATE() + INTERVAL 18 DAY
      AND departure_time = '08:30:00'
);

INSERT INTO flights (
    aircraft_type, airline, arrival_date, arrival_time, business_seats,
    departure_date, departure_time, description, destination, economy_seats,
    first_seats, flight_number, flight_status, origin, price, seats_available
)
SELECT
    'Boeing 787', 'SkyPremium',
    CURDATE() + INTERVAL 19 DAY, '23:50:00', 24,
    CURDATE() + INTERVAL 19 DAY, '08:30:00',
    'Vuelo internacional de prueba generado para reservas y asignación de asientos.',
    'Tokio', 120, 8,
    CONCAT('TEST-BA-TYO-', DATE_FORMAT(CURDATE() + INTERVAL 19 DAY, '%Y%m%d')),
    'programado', 'Buenos Aires', 1200000, 152
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE origin = 'Buenos Aires'
      AND destination = 'Tokio'
      AND departure_date = CURDATE() + INTERVAL 19 DAY
      AND departure_time = '08:30:00'
);

-- Verificación rápida después de ejecutar el script.
SELECT
    origin,
    destination,
    departure_date,
    departure_time,
    flight_number,
    economy_seats,
    business_seats,
    first_seats,
    seats_available
FROM flights
WHERE description LIKE 'Vuelo%prueba%asientos%'
ORDER BY departure_date, departure_time;