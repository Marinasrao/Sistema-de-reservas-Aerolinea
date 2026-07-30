-- ============================================================
-- FLIGHTBOOKING
-- DATOS PRECARGADOS PARA EVALUACIÓN FUNCIONAL
-- ============================================================
--
-- Ejecutar este archivo sobre la base:
-- aerolinea_db
--
-- El backend debe haberse iniciado previamente al menos una vez
-- para que Hibernate cree las tablas.
--
-- Este script incluye:
-- - Roles
-- - Usuario administrador
-- - Usuario común
-- - Catálogo de ciudades
-- - Categorías
-- - Recomendaciones
-- - Vuelos futuros asociados a las cuatro categorías
--
-- No incluye:
-- - Pasajeros
-- - Reservas
-- - Pagos
-- - Favoritos
-- - Asientos ocupados
--
--
-- ============================================================

USE aerolinea_db;

SET NAMES utf8mb4;

START TRANSACTION;


-- ============================================================
-- ROLES
-- ============================================================

INSERT INTO roles (name)
SELECT 'ROLE_USER'
    WHERE NOT EXISTS (
    SELECT 1
    FROM roles
    WHERE name = 'ROLE_USER'
);

INSERT INTO roles (name)
SELECT 'ROLE_ADMIN'
    WHERE NOT EXISTS (
    SELECT 1
    FROM roles
    WHERE name = 'ROLE_ADMIN'
);


-- ============================================================
-- USUARIO ADMINISTRADOR DE PRUEBA
--
-- Usuario: admin@admin1.com
-- Contraseña: Admin1234
-- ============================================================

INSERT INTO users (
    email,
    enabled,
    first_name,
    last_name,
    password,
    token_expiration,
    verification_token
)
SELECT
    'admin@admin1.com',
    1,
    'Maria',
    'Garcia',
    '$2a$10$xlgxchXvj1jsQf070fNc7.wcgo62zzWofPKBmcikrcM7k.3fiAkYy',
    NULL,
    NULL
    WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'admin@admin1.com'
);

INSERT INTO user_roles (
    user_id,
    role_id
)
SELECT
    u.id,
    r.id
FROM users u
         INNER JOIN roles r
                    ON r.name = 'ROLE_ADMIN'
WHERE u.email = 'admin@admin1.com'
  AND NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role_id = r.id
);


-- ============================================================
-- USUARIO COMÚN DE PRUEBA
--
-- Usuario: usuario@flightbooking.com
-- Contraseña: Admin1234
-- ============================================================

INSERT INTO users (
    email,
    enabled,
    first_name,
    last_name,
    password,
    token_expiration,
    verification_token
)
SELECT
    'usuario@flightbooking.com',
    1,
    'Usuario',
    'Prueba',
    '$2a$10$xlgxchXvj1jsQf070fNc7.wcgo62zzWofPKBmcikrcM7k.3fiAkYy',
    NULL,
    NULL
    WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'usuario@flightbooking.com'
);

INSERT INTO user_roles (
    user_id,
    role_id
)
SELECT
    u.id,
    r.id
FROM users u
         INNER JOIN roles r
                    ON r.name = 'ROLE_USER'
WHERE u.email = 'usuario@flightbooking.com'
  AND NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role_id = r.id
);


-- ============================================================
-- CATÁLOGO DE CIUDADES Y DESTINOS
-- ============================================================

INSERT INTO cities (
    name,
    country,
    airport_code,
    active
)
SELECT
    seed.name,
    seed.country,
    seed.airport_code,
    1
FROM (
         SELECT 'Bariloche' AS name, 'Argentina' AS country, 'BRC' AS airport_code
         UNION ALL
         SELECT 'Buenos Aires', 'Argentina', 'BUE'
         UNION ALL
         SELECT 'Calafate', 'Argentina', 'FTE'
         UNION ALL
         SELECT 'Colombia', 'Colombia', 'BOG'
         UNION ALL
         SELECT 'Córdoba', 'Argentina', 'COR'
         UNION ALL
         SELECT 'Dubái', 'Emiratos Árabes Unidos', 'DXB'
         UNION ALL
         SELECT 'Estambul', 'Turquía', 'IST'
         UNION ALL
         SELECT 'Florianópolis', 'Brasil', 'FLN'
         UNION ALL
         SELECT 'Iguazú', 'Argentina', 'IGR'
         UNION ALL
         SELECT 'Jujuy', 'Argentina', 'JUJ'
         UNION ALL
         SELECT 'Londres', 'Reino Unido', 'LON'
         UNION ALL
         SELECT 'Madrid', 'España', 'MAD'
         UNION ALL
         SELECT 'Mendoza', 'Argentina', 'MDZ'
         UNION ALL
         SELECT 'Miami', 'Estados Unidos', 'MIA'
         UNION ALL
         SELECT 'New York', 'Estados Unidos', 'NYC'
         UNION ALL
         SELECT 'Paris', 'Francia', 'PAR'
         UNION ALL
         SELECT 'Puerto Madryn', 'Argentina', 'PMY'
         UNION ALL
         SELECT 'Rio de Janeiro', 'Brasil', 'RIO'
         UNION ALL
         SELECT 'Roma', 'Italia', 'ROM'
         UNION ALL
         SELECT 'Salta', 'Argentina', 'SLA'
         UNION ALL
         SELECT 'Tokio', 'Japón', 'TYO'
         UNION ALL
         SELECT 'Ushuaia', 'Argentina', 'USH'
     ) AS seed
WHERE NOT EXISTS (
    SELECT 1
    FROM cities c
    WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(seed.name))
);


-- ============================================================
-- CATEGORÍAS
-- ============================================================

INSERT INTO categories (
    title,
    image,
    promo_text
)
SELECT
    'Nacionales',
    'b2719a9e-b2ae-44b7-9286-fa1cb3886905.jpg',
    'Descubrí destinos increíbles dentro de Argentina.'
    WHERE NOT EXISTS (
    SELECT 1
    FROM categories
    WHERE UPPER(TRIM(title)) = 'NACIONALES'
);

INSERT INTO categories (
    title,
    image,
    promo_text
)
SELECT
    'Internacionales',
    '155cfdfd-9214-4cae-bf64-0257e85b8c4d.jpg',
    'Conocé ciudades y culturas de todo el mundo.'
    WHERE NOT EXISTS (
    SELECT 1
    FROM categories
    WHERE UPPER(TRIM(title)) = 'INTERNACIONALES'
);

INSERT INTO categories (
    title,
    image,
    promo_text
)
SELECT
    'Low Cost',
    'c9d10659-c6c7-486c-9d7f-1e9da30738ee.jpg',
    'Viajá con tarifas accesibles y servicios esenciales.'
    WHERE NOT EXISTS (
    SELECT 1
    FROM categories
    WHERE UPPER(TRIM(title)) = 'LOW COST'
);

INSERT INTO categories (
    title,
    image,
    promo_text
)
SELECT
    'Premium',
    '3ad790f7-33d6-4cff-bfec-127a85c6824a.jpg',
    'Viví una experiencia exclusiva con servicios superiores.'
    WHERE NOT EXISTS (
    SELECT 1
    FROM categories
    WHERE UPPER(TRIM(title)) = 'PREMIUM'
);


-- ============================================================
-- RECOMENDACIÓN: BARILOCHE
-- ============================================================

INSERT INTO recommendations (
    airport,
    departure_date,
    description,
    destination,
    discount_percent,
    flight_type,
    image1,
    image2,
    image3,
    image4,
    image_url,
    long_description,
    main_image,
    origin,
    price,
    return_date,
    short_description,
    title
)
SELECT
    'Desde Ezeiza',
    DATE_FORMAT(CURDATE() + INTERVAL 30 DAY, '%Y-%m-%d'),
    'Montañas, lagos y paisajes únicos en la Patagonia argentina.',
    'Bariloche',
    15,
    'Ida y vuelta',
    'bd54d840-a404-4cc3-a03c-eccc5bc9c6a1_bariloche03-min.jpg',
    'd329ace9-7544-459a-b0dd-d7785816a929_bariloche04-min.jpg',
    'eda574ff-9460-47e9-8fd2-ff9128bd7d66_bariloche05-min.jpg',
    'ab0a3fe3-f7e8-44f5-8e34-8a44107b98e1_bariloche06-min.jpg',
    'd1ea4016-6f86-41ec-aeb1-5741aaa0ce4e_bariloche01-min.jpg',
    'Descubrí Bariloche, uno de los destinos más increíbles de la Patagonia argentina. Rodeada de montañas, lagos cristalinos y bosques únicos, esta ciudad combina aventura, naturaleza y gastronomía. Disfrutá de sus paisajes, sus excursiones y su reconocida tradición chocolatera.',
    'df2df686-f9db-4c02-b50d-627026522d2b_bariloche02-min.jpg',
    'Buenos Aires',
    180000,
    DATE_FORMAT(CURDATE() + INTERVAL 37 DAY, '%Y-%m-%d'),
    'Naturaleza, aventura y gastronomía en la Patagonia.',
    'Bariloche'
    WHERE NOT EXISTS (
    SELECT 1
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'bariloche'
);


-- ============================================================
-- RECOMENDACIÓN: DUBÁI
-- ============================================================

INSERT INTO recommendations (
    airport,
    departure_date,
    description,
    destination,
    discount_percent,
    flight_type,
    image1,
    image2,
    image3,
    image4,
    image_url,
    long_description,
    main_image,
    origin,
    price,
    return_date,
    short_description,
    title
)
SELECT
    'Desde Ezeiza',
    DATE_FORMAT(CURDATE() + INTERVAL 75 DAY, '%Y-%m-%d'),
    'Lujo, innovación y experiencias únicas en medio del desierto.',
    'Dubái',
    5,
    'Ida y vuelta',
    'c21a2aee-69b1-40c4-ab1b-88b84817aafb_dubai03-min.jpg',
    '0a924384-421a-4498-bfa5-c49c08486378_dubai04.jpg',
    'bbcf8090-ceb2-4448-a191-92051f3fc613_dubai05-min.jpg',
    '4c421203-474d-4a3a-8c8a-53d94cf0fa89_dubai06-min.jpg',
    'bc7d0739-2c9c-4bc7-983c-215601b5b5a5_dubai01.jpg',
    'Descubrí Dubái, una ciudad futurista donde el lujo, la innovación y la aventura se encuentran en medio del desierto. Admirá sus rascacielos, centros comerciales, playas y propuestas gastronómicas mientras disfrutás de una experiencia internacional inolvidable.',
    '641f33b3-52ef-4c8b-95dd-925c80aaebf3_dubai02-min.jpg',
    'Buenos Aires',
    1650000,
    DATE_FORMAT(CURDATE() + INTERVAL 85 DAY, '%Y-%m-%d'),
    'Una experiencia de lujo, innovación y aventura.',
    'Dubái'
    WHERE NOT EXISTS (
    SELECT 1
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'dubái'
);


-- ============================================================
-- RECOMENDACIÓN: MADRID
-- ============================================================

INSERT INTO recommendations (
    airport,
    departure_date,
    description,
    destination,
    discount_percent,
    flight_type,
    image1,
    image2,
    image3,
    image4,
    image_url,
    long_description,
    main_image,
    origin,
    price,
    return_date,
    short_description,
    title
)
SELECT
    'Desde Ezeiza',
    DATE_FORMAT(CURDATE() + INTERVAL 45 DAY, '%Y-%m-%d'),
    'Historia, arte, cultura y gastronomía en la capital española.',
    'Madrid',
    10,
    'Ida y vuelta',
    'b89b9b3b-8838-453e-b91d-878ccb6b86d4_madrid03-min.jpg',
    '212bdd83-37ce-4f18-a388-eaa60b56e019_madrid04-min.jpg',
    '24a5b1ad-969f-4cb9-9ea9-fee9da1c3d73_madrid05-min.jpg',
    '7465ceb4-fe92-49b5-bd1a-8deb996a8c17_madrid06-min.jpg',
    '33f9f0a2-14cc-4c06-ac70-8053be7f353f_madrid01-min.jpg',
    'Descubrí Madrid, una ciudad vibrante donde la historia, el arte y la pasión española se viven en cada rincón. Recorré sus plazas emblemáticas, museos, parques y avenidas mientras disfrutás de una gastronomía reconocida en todo el mundo.',
    'd33ce0a2-ccb1-43c4-a8fa-5518bf58b321_madrid02-min.jpg',
    'Buenos Aires',
    980000,
    DATE_FORMAT(CURDATE() + INTERVAL 55 DAY, '%Y-%m-%d'),
    'Cultura, arte y gastronomía en el corazón de España.',
    'Madrid'
    WHERE NOT EXISTS (
    SELECT 1
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'madrid'
);


-- ============================================================
-- RECOMENDACIÓN: RIO DE JANEIRO
-- ============================================================

INSERT INTO recommendations (
    airport,
    departure_date,
    description,
    destination,
    discount_percent,
    flight_type,
    image1,
    image2,
    image3,
    image4,
    image_url,
    long_description,
    main_image,
    origin,
    price,
    return_date,
    short_description,
    title
)
SELECT
    'Desde Ezeiza',
    DATE_FORMAT(CURDATE() + INTERVAL 50 DAY, '%Y-%m-%d'),
    'Playas, música y paisajes inolvidables en Brasil.',
    'Rio de Janeiro',
    10,
    'Ida y vuelta',
    'a587d8c4-8bbe-4613-abfd-1c9de6195ec6_rio de janeiro03-min.jpg',
    'a17137df-20d7-422d-a6f3-b3a516721c3f_rio de janeiro04-min.jpg',
    '9844cc4f-27c1-451d-8e02-7d3f22e866b0_rio de janeiro05-min.jpg',
    '195507fa-cdf5-4b7f-b54a-8e7169e1db2d_rio de janeiro06-min.jpg',
    '1c89e738-84a8-4594-bda3-241ba2fcd6ed_rio de janeiro01-min.jpg',
    'Descubrí Rio de Janeiro, una ciudad vibrante donde las playas, la música y la alegría brasileña crean una experiencia inolvidable. Visitá Copacabana, Ipanema, el Cristo Redentor y disfrutá de sus paisajes, su cultura y su energía única.',
    '5bbcee38-a8d1-43cb-8488-be95ce3a45f6_rio de janeiro02-min.jpg',
    'Buenos Aires',
    520000,
    DATE_FORMAT(CURDATE() + INTERVAL 57 DAY, '%Y-%m-%d'),
    'Playas, cultura y alegría brasileña.',
    'Rio de Janeiro'
    WHERE NOT EXISTS (
    SELECT 1
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'rio de janeiro'
);


-- ============================================================
-- RECOMENDACIÓN: USHUAIA
-- ============================================================

INSERT INTO recommendations (
    airport,
    departure_date,
    description,
    destination,
    discount_percent,
    flight_type,
    image1,
    image2,
    image3,
    image4,
    image_url,
    long_description,
    main_image,
    origin,
    price,
    return_date,
    short_description,
    title
)
SELECT
    'Desde Ezeiza',
    DATE_FORMAT(CURDATE() + INTERVAL 40 DAY, '%Y-%m-%d'),
    'Naturaleza y aventura en la ciudad más austral del mundo.',
    'Ushuaia',
    10,
    'Ida y vuelta',
    'c1d90fd1-dcfd-42f3-8912-54832329c59f_ushuaia03-min.jpg',
    '3548fced-7284-4e2c-84c7-02de0c80fb50_ushuaia04-min.jpg',
    '69bf1a95-6635-4517-be49-ba51282f577e_ushuaia05-min.jpg',
    '8e52c0eb-1608-4f68-bc90-c0f43a12702c_ushuaia06-min.jpg',
    '0ea2b9c5-ab4e-473b-a391-5589bdea119d_ushuaia01-min.jpg',
    'Descubrí Ushuaia, la ciudad más austral del mundo. Rodeada de montañas, bosques, canales y paisajes nevados, ofrece experiencias únicas entre naturaleza y aventura. Navegá por el Canal Beagle y conocé uno de los destinos más impactantes de la Patagonia.',
    '4ce772e2-9b93-4248-9861-6d101c936aae_ushuaia02-min.jpg',
    'Buenos Aires',
    320000,
    DATE_FORMAT(CURDATE() + INTERVAL 47 DAY, '%Y-%m-%d'),
    'Viví la naturaleza y la aventura en el fin del mundo.',
    'Ushuaia'
    WHERE NOT EXISTS (
    SELECT 1
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'ushuaia'
);


-- ============================================================
-- VUELOS NACIONALES
-- BUENOS AIRES → BARILOCHE
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 737',
    'AeroLinea',
    CURDATE() + INTERVAL 30 DAY,
    '11:50:00',
    20,
    CURDATE() + INTERVAL 30 DAY,
    '09:30:00',
    'Vuelo nacional precargado para evaluación.',
    'Bariloche',
    120,
    10,
    'AL-BUE-BRC-0930',
    'programado',
    'Buenos Aires',
    180000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'NACIONALES'
    LIMIT 1
    ),
    (
    SELECT id
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'bariloche'
    LIMIT 1
    )
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-BUE-BRC-0930'
    );


-- ============================================================
-- VUELOS NACIONALES
-- BARILOCHE → BUENOS AIRES
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 737',
    'AeroLinea',
    CURDATE() + INTERVAL 37 DAY,
    '20:50:00',
    20,
    CURDATE() + INTERVAL 37 DAY,
    '18:30:00',
    'Vuelo nacional de regreso precargado para evaluación.',
    'Buenos Aires',
    120,
    10,
    'AL-BRC-BUE-1830',
    'programado',
    'Bariloche',
    180000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'NACIONALES'
    LIMIT 1
    ),
    NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-BRC-BUE-1830'
    );


-- ============================================================
-- VUELOS INTERNACIONALES
-- BUENOS AIRES → MADRID
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 787',
    'AeroLinea',
    CURDATE() + INTERVAL 46 DAY,
    '14:30:00',
    20,
    CURDATE() + INTERVAL 45 DAY,
    '22:00:00',
    'Vuelo internacional precargado para evaluación.',
    'Madrid',
    120,
    10,
    'AL-BUE-MAD-2200',
    'programado',
    'Buenos Aires',
    980000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'INTERNACIONALES'
    LIMIT 1
    ),
    (
    SELECT id
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'madrid'
    LIMIT 1
    )
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-BUE-MAD-2200'
    );


-- ============================================================
-- VUELOS INTERNACIONALES
-- MADRID → BUENOS AIRES
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 787',
    'AeroLinea',
    CURDATE() + INTERVAL 55 DAY,
    '22:30:00',
    20,
    CURDATE() + INTERVAL 55 DAY,
    '11:00:00',
    'Vuelo internacional de regreso precargado para evaluación.',
    'Buenos Aires',
    120,
    10,
    'AL-MAD-BUE-1100',
    'programado',
    'Madrid',
    980000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'INTERNACIONALES'
    LIMIT 1
    ),
    NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-MAD-BUE-1100'
    );


-- ============================================================
-- VUELOS LOW COST
-- BUENOS AIRES → FLORIANÓPOLIS
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 737',
    'AeroLinea',
    CURDATE() + INTERVAL 60 DAY,
    '18:00:00',
    20,
    CURDATE() + INTERVAL 60 DAY,
    '14:14:00',
    'Vuelo Low Cost precargado para evaluación.',
    'Florianópolis',
    120,
    10,
    'AL-BUE-FLO-1414',
    'programado',
    'Buenos Aires',
    450000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'LOW COST'
    LIMIT 1
    ),
    NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-BUE-FLO-1414'
    );


-- ============================================================
-- VUELOS LOW COST
-- FLORIANÓPOLIS → BUENOS AIRES
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 737',
    'AeroLinea',
    CURDATE() + INTERVAL 67 DAY,
    '13:00:00',
    20,
    CURDATE() + INTERVAL 67 DAY,
    '09:00:00',
    'Vuelo Low Cost de regreso precargado para evaluación.',
    'Buenos Aires',
    120,
    10,
    'AL-FLO-BUE-0900',
    'programado',
    'Florianópolis',
    450000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'LOW COST'
    LIMIT 1
    ),
    NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-FLO-BUE-0900'
    );


-- ============================================================
-- VUELOS PREMIUM
-- BUENOS AIRES → DUBÁI
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 787',
    'AeroLinea',
    CURDATE() + INTERVAL 76 DAY,
    '17:30:00',
    20,
    CURDATE() + INTERVAL 75 DAY,
    '21:00:00',
    'Vuelo Premium precargado para evaluación.',
    'Dubái',
    120,
    10,
    'AL-BUE-DXB-2100',
    'programado',
    'Buenos Aires',
    1650000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'PREMIUM'
    LIMIT 1
    ),
    (
    SELECT id
    FROM recommendations
    WHERE LOWER(TRIM(title)) = 'dubái'
    LIMIT 1
    )
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-BUE-DXB-2100'
    );


-- ============================================================
-- VUELOS PREMIUM
-- DUBÁI → BUENOS AIRES
-- ============================================================

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
    seats_available,
    category_id,
    recommendation_id
)
SELECT
    'Boeing 787',
    'AeroLinea',
    CURDATE() + INTERVAL 86 DAY,
    '22:00:00',
    20,
    CURDATE() + INTERVAL 85 DAY,
    '08:30:00',
    'Vuelo Premium de regreso precargado para evaluación.',
    'Buenos Aires',
    120,
    10,
    'AL-DXB-BUE-0830',
    'programado',
    'Dubái',
    1650000,
    150,
    (
    SELECT id
    FROM categories
    WHERE UPPER(TRIM(title)) = 'PREMIUM'
    LIMIT 1
    ),
    NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM flights
    WHERE flight_number = 'AL-DXB-BUE-0830'
    );


COMMIT;


-- ============================================================
-- VERIFICACIONES FINALES
-- ============================================================

SELECT
    id,
    name,
    country,
    airport_code,
    active
FROM cities
ORDER BY name;


SELECT
    id,
    title,
    promo_text,
    image
FROM categories
ORDER BY id;


SELECT
    id,
    title,
    origin,
    destination,
    departure_date,
    return_date,
    price
FROM recommendations
WHERE LOWER(TRIM(title)) IN (
                             'bariloche',
                             'dubái',
                             'madrid',
                             'rio de janeiro',
                             'ushuaia'
    )
ORDER BY title;


SELECT
    c.title AS category_title,
    COUNT(f.id) AS future_flights
FROM categories c
         LEFT JOIN flights f
                   ON f.category_id = c.id
                       AND f.departure_date >= CURDATE()
WHERE UPPER(TRIM(c.title)) IN (
                               'NACIONALES',
                               'INTERNACIONALES',
                               'LOW COST',
                               'PREMIUM'
    )
GROUP BY c.id, c.title
ORDER BY c.id;


SELECT
    f.flight_number,
    f.origin,
    f.destination,
    f.departure_date,
    f.departure_time,
    f.arrival_date,
    f.arrival_time,
    f.seats_available,
    c.title AS category_title
FROM flights f
         INNER JOIN categories c
                    ON c.id = f.category_id
WHERE f.flight_number IN (
                          'AL-BUE-BRC-0930',
                          'AL-BRC-BUE-1830',
                          'AL-BUE-MAD-2200',
                          'AL-MAD-BUE-1100',
                          'AL-BUE-FLO-1414',
                          'AL-FLO-BUE-0900',
                          'AL-BUE-DXB-2100',
                          'AL-DXB-BUE-0830'
    )
ORDER BY f.departure_date, f.departure_time;


SELECT
    u.id,
    u.email,
    u.enabled,
    r.name AS role_name
FROM users u
         INNER JOIN user_roles ur
                    ON ur.user_id = u.id
         INNER JOIN roles r
                    ON r.id = ur.role_id
WHERE u.email IN (
                  'admin@admin1.com',
                  'usuario@flightbooking.com'
    )
ORDER BY u.email, r.name;