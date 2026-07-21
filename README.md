# ✈️ FlightBooking — Sistema de Reservas de Vuelos

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.3-brightgreen)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-4.5-646CFF)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1)
![License](https://img.shields.io/badge/License-Academic-lightgrey)

Proyecto Integrador Final desarrollado para la carrera de Desarrollo Full Stack.

FlightBooking es una aplicación web basada en una arquitectura cliente-servidor con React, Spring Boot y MySQL. Permite buscar vuelos, consultar fechas y horarios disponibles, seleccionar asientos, registrar pasajeros, confirmar reservas, guardar destinos favoritos y valorar experiencias de viaje.

También incluye un panel de administración para gestionar vuelos, categorías, recomendaciones, políticas, imágenes, pasajeros y usuarios administradores.

## 🌟 Funcionalidades principales

### Usuario

- Registro de cuenta con activación por correo electrónico.
- Inicio de sesión mediante JWT.
- Búsqueda de vuelos por origen, destino, fechas, pasajeros y clase.
- Calendario doble con disponibilidad de ida y vuelta.
- Consulta de horarios disponibles.
- Selección de vuelo y asiento.
- Carga de los datos de cada pasajero.
- Confirmación de reserva y pago simulado.
- Consulta de reservas desde el perfil.
- Guardado y eliminación de recomendaciones favoritas.
- Valoración de destinos mediante estrellas y comentarios.
- Consulta de políticas del viaje.
- Envío de consultas mediante formulario de contacto.

### Administración

- Gestión de vuelos.
- Gestión de pasajeros y asignación de asientos.
- Gestión de recomendaciones y sus galerías.
- Gestión de categorías y promociones.
- Gestión del hero de la página principal.
- Gestión de políticas.
- Gestión de administradores.
- Consulta de pasajeros asociados a cada vuelo.

---

## 🖼️ Imágenes del proyecto

### Resultado del buscador

<img width="1356" height="633" alt="Resultado del buscador" src="https://github.com/user-attachments/assets/2081d32e-419e-41f7-babe-bf3e22faf374" />

### Recomendaciones

<img width="1346" height="532" alt="Recomendaciones" src="https://github.com/user-attachments/assets/f19e639e-6acd-4d38-a184-52337592e5ea" />

### Compartir en redes

<img width="664" height="617" alt="Compartir en redes" src="https://github.com/user-attachments/assets/7e201621-d679-45fd-94e6-4f282b079b58" />

### Categorías

<img width="1334" height="409" alt="Categorías" src="https://github.com/user-attachments/assets/a61df726-bf5c-446b-9ee9-d934eb353dc8" />

---

## 🛠️ Tecnologías utilizadas

### Backend

- Java 21.
- Eclipse Temurin OpenJDK 21.0.5 LTS.
- Spring Boot 3.5.3.
- Spring Web.
- Spring Data JPA.
- Spring Security.
- Spring Validation.
- Spring Mail.
- JWT con JJWT 0.11.5.
- MySQL Connector/J 8.0.33.
- Lombok.
- Apache Maven 3.9.9.

### Frontend

- Node.js 18.18.2.
- npm 9.8.1.
- React 19.1.0.
- React DOM 19.1.0.
- React Router DOM 7.6.3.
- Vite 4.5.0.
- Axios 1.10.0.
- Material UI 7.2.0.
- React Calendar 6.0.0.
- React Icons 5.7.0.
- React Slick 0.30.3.
- Slick Carousel 1.8.1.
- CSS Modules.

### Herramientas

- Git y GitHub.
- Visual Studio Code.
- IntelliJ IDEA.
- Postman.
- MySQL Workbench.
- Mailtrap.

---

## 📂 Estructura del proyecto

```text
Proyecto Aerolinea/
├── Backend-aerolinea/
├── Frontend-aerolinea/
├── database/
│   └── vuelos_prueba.sql
├── uploads/
├── README.md
└── .gitignore
```

### Carpetas principales

- `Backend-aerolinea`: API REST desarrollada con Spring Boot.
- `Frontend-aerolinea`: interfaz desarrollada con React y Vite.
- `database`: scripts SQL preparados para las pruebas del sistema.
- `uploads`: imágenes utilizadas por categorías, recomendaciones, hero y otros elementos visuales.

---

## ✅ Requisitos previos

- Java 21.
- Apache Maven 3.9.9.
- Node.js 18 o superior.
- npm.
- MySQL.
- Git.

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd "Proyecto Aerolinea"
```

Reemplazar `<URL_DEL_REPOSITORIO>` por la dirección del repositorio en GitHub.

### 2. Crear la base de datos

Abrir MySQL Workbench y ejecutar:

```sql
CREATE DATABASE IF NOT EXISTS aerolinea_db;
USE aerolinea_db;
```

### 3. Configurar el backend

Ingresar en:

```text
Backend-aerolinea/src/main/resources/
```

El repositorio incluye:

```text
application.properties.example
```

Crear una copia con el nombre:

```text
application.properties
```

Completar los valores locales:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/aerolinea_db
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=TU_CLAVE_JWT

spring.mail.host=TU_HOST_SMTP
spring.mail.port=TU_PUERTO_SMTP
spring.mail.username=TU_USUARIO_SMTP
spring.mail.password=TU_CONTRASEÑA_SMTP
```

> `application.properties` no se incluye en el repositorio para evitar publicar credenciales privadas.

El archivo real `application.properties` no se incluye en GitHub porque contiene credenciales privadas.

Para configurar el proyecto:

1. Copiar el archivo:

   `Backend-aerolinea/src/main/resources/application.example.properties`

2. Crear una copia con el nombre:

   `Backend-aerolinea/src/main/resources/application.properties`

3. Completar en esa copia las credenciales locales de MySQL y Mailtrap.

### 4. Iniciar el backend

Desde `Backend-aerolinea`:

```bash
mvn spring-boot:run
```

También puede iniciarse desde IntelliJ IDEA.

El backend queda disponible en:

```text
http://localhost:8080
```

### 5. Iniciar el frontend

Desde `Frontend-aerolinea`:

```bash
npm install
npm run dev
```

El frontend queda disponible en:

```text
http://localhost:5173
```

---

## 🧩 Puertos utilizados

| Servicio | Dirección                   |
| -------- | --------------------------- |
| Frontend | `http://localhost:5173`     |
| Backend  | `http://localhost:8080`     |
| API REST | `http://localhost:8080/api` |
| MySQL    | `localhost:3306`            |

---

## 🗄️ Base de datos y vuelos de prueba

La base de datos utilizada es:

```text
aerolinea_db
```

El proyecto incluye:

```text
database/vuelos_prueba.sql
```

El script genera vuelos con fechas futuras calculadas desde el momento de ejecución.

### Cómo ejecutarlo

1. Abrir MySQL Workbench.
2. Seleccionar `aerolinea_db`.
3. Abrir `database/vuelos_prueba.sql`.
4. Ejecutar el script completo.
5. Verificar los vuelos insertados mediante la consulta final.

Los vuelos no se generan automáticamente al iniciar la aplicación.

---

## 🔐 Credenciales de prueba

### Administrador

```text
Usuario: admin@admin1.com
Contraseña: Admin1234
```

Acceso:

```text
http://localhost:5173/login
```

> Las credenciales funcionan cuando el usuario administrador correspondiente se encuentra cargado en la base de datos.

---

## 💺 Pasajeros y asignación de asientos

Los pasajeros quedan asociados a:

- Un vuelo específico.
- Una clase.
- Un asiento.
- Un canal de compra: `COUNTER` u `ONLINE`.

| Clase    | Numeración    |
| -------- | ------------- |
| Economy  | `A1` a `A120` |
| Business | `B1` a `B24`  |
| First    | `F1` a `F8`   |

El backend valida que un asiento no pueda asignarse dos veces dentro del mismo vuelo.

Las reservas realizadas desde el sitio usan el canal `ONLINE`. Las ventas cargadas desde administración utilizan `COUNTER`. Ambos canales comparten el mismo control de disponibilidad.

---

## 🔐 Autenticación y seguridad

El sistema implementa:

- Registro de usuarios.
- Activación de cuenta mediante correo electrónico.
- Inicio de sesión con JWT.
- Identificación del usuario autenticado.
- Roles `ROLE_USER` y `ROLE_ADMIN`.
- Protección de rutas administrativas.
- Validaciones desde backend.
- Configuración de CORS para el entorno local.

---

## 🔌 API REST

| Módulo          | Ruta base               | Descripción                                          |
| --------------- | ----------------------- | ---------------------------------------------------- |
| Autenticación   | `/api/auth`             | Registro, activación, login y usuario actual         |
| Vuelos          | `/api/flights`          | CRUD, búsquedas, ciudades, categorías y asientos     |
| Disponibilidad  | `/api/availability`     | Fechas y horarios disponibles                        |
| Reservas        | `/api/bookings`         | Registro de reservas                                 |
| Pasajeros       | `/api/passengers`       | Pasajeros, reservas online y asignación de asientos  |
| Categorías      | `/api/categories`       | Categorías, promociones y contenido editorial        |
| Recomendaciones | `/api/recommendations`  | CRUD, detalle, imágenes y recomendaciones aleatorias |
| Favoritos       | `/api/favorites`        | Favoritos del usuario autenticado                    |
| Valoraciones    | `/api/reviews`          | Comentarios, puntuaciones y resúmenes                |
| Políticas       | `/api/policies`         | Políticas públicas                                   |
| Administración  | `/api/admin`            | Usuarios, políticas y características                |
| Hero            | `/api/hero`             | Gestión de imágenes de portada                       |
| Imágenes        | `/api/images`           | Carga y consulta de archivos                         |
| Contacto        | `/api/contact-messages` | Envío de consultas                                   |

---

## 🧪 Recorrido sugerido para la evaluación

### Preparación

1. Crear o seleccionar `aerolinea_db`.
2. Configurar `application.properties`.
3. Ejecutar `database/vuelos_prueba.sql`.
4. Iniciar el backend.
5. Iniciar el frontend.

### Administrador

1. Iniciar sesión con las credenciales de administrador.
2. Ingresar al panel administrativo.
3. Revisar o crear categorías.
4. Crear una recomendación con imágenes.
5. Crear vuelos futuros.
6. Consultar el listado de vuelos.
7. Registrar un pasajero.
8. Seleccionar vuelo, clase y asiento.
9. Verificar el pasajero en el listado.
10. Revisar hero, políticas y administradores.

### Usuario

1. Registrar una cuenta.
2. Activarla mediante correo.
3. Iniciar sesión.
4. Buscar un vuelo.
5. Seleccionar fechas y horarios.
6. Elegir el vuelo.
7. Completar los datos de los pasajeros.
8. Seleccionar los asientos.
9. Completar el pago simulado.
10. Confirmar la reserva.
11. Revisar `Perfil → Mis reservas`.
12. Guardar una recomendación como favorita.
13. Consultarla desde `Mis favoritos`.
14. Puntuar una experiencia.
15. Verificar la valoración publicada.

---

## 📌 Consideraciones importantes

- Para reservar debe existir un vuelo real para la ruta y fecha seleccionadas.
- Las ciudades pueden aparecer en los selectores aunque todavía no exista un vuelo para todas las combinaciones.
- Las carpetas `uploads` forman parte del repositorio porque contienen recursos necesarios.
- El pago es una simulación académica y no procesa transacciones reales.
- El envío de correos requiere una cuenta SMTP de prueba configurada.
- El backend y el frontend están preparados para ejecutarse localmente en los puertos indicados.

---

## 👩‍💻 Autora

**Marina Rao**

Proyecto Integrador Final de Desarrollo Full Stack.

---

## 📄 Licencia

Proyecto de uso académico.
