# ✈️ FlightBooking — Sistema de Reservas de Vuelos

Proyecto full stack desarrollado con **React + Spring Boot** para gestionar vuelos, recomendaciones, reservas, pasajeros, usuarios, valoraciones y administración del sitio.

La aplicación simula una plataforma de reservas aéreas donde los usuarios pueden buscar vuelos, explorar destinos recomendados, guardar favoritos, realizar reservas y puntuar sus experiencias de viaje.

---

## 🧭 Tecnologías utilizadas

### Frontend

* React
* Vite
* React Router
* CSS Modules
* LocalStorage para persistencia temporal de reservas
* Consumo de API REST

### Backend

* Java 21
* Spring Boot
* Spring Data JPA
* Spring Security
* JWT
* MySQL
* Lombok
* Maven

### Herramientas

* Git / GitHub
* VS Code
* IntelliJ IDEA
* Postman
* MySQL Workbench

---

## 🧩 Estructura general del proyecto

```txt
Proyecto Aerolinea/
├── Backend-aerolinea/
├── frontend-aerolinea/
├── uploads/
├── README.md
└── .gitignore
```

### Carpetas importantes

* `Backend-aerolinea`: contiene la API desarrollada con Spring Boot.
* `frontend-aerolinea`: contiene la interfaz desarrollada con React.
* `uploads`: contiene imágenes necesarias para visualizar correctamente categorías, recomendaciones y otros elementos del sitio.
* `Backend-aerolinea/uploads`: contiene imágenes utilizadas por el backend para recomendaciones, categorías y hero.

---

## 🛫 Funcionalidades principales

### 🔍 Búsqueda de vuelos

El sistema permite buscar vuelos a partir de:

* Ciudad de origen.
* Ciudad de destino.
* Fecha de ida.
* Fecha de vuelta.
* Cantidad de pasajeros.
* Clase del vuelo.

Clases disponibles:

* Economy.
* Business.
* First.

### Mejoras implementadas

* Página de resultados con calendario doble.
* Calendario de ida y calendario de vuelta.
* Fechas disponibles marcadas visualmente.
* Fechas no disponibles diferenciadas.
* Horarios disponibles por fecha seleccionada.
* Mensajes de error cuando no se puede cargar la disponibilidad.
* Resumen visual de búsqueda con origen, destino, pasajeros y clase.
* Carruseles compactos de recomendaciones y categorías relacionadas.

---

## 📅 Disponibilidad de vuelos

Se incorporó un sistema de disponibilidad para mostrar fechas habilitadas de acuerdo al origen y destino seleccionados.

### Funcionalidades

* Consulta de disponibilidad desde backend.
* Fechas disponibles visibles en el calendario.
* Fechas no disponibles bloqueadas visualmente.
* Horarios asociados a una fecha disponible.
* Separación entre disponibilidad de ida y disponibilidad de vuelta.

### Endpoints relacionados

```txt
GET /api/availability
GET /api/availability/slots
```

---

## 💺 Gestión de pasajeros

El sistema permite administrar pasajeros desde el panel correspondiente.

### Funcionalidades

* Creación de pasajeros.
* Asignación automática o manual de número de asiento.
* Gestión de clase seleccionada.
* Integración con vuelos disponibles.

---

## 📌 Recomendaciones de destinos

El sistema incluye una sección de recomendaciones de destinos en la página principal.

Cada recomendación muestra:

* Imagen del destino.
* Título del destino.
* Precio promocional.
* Fecha de vuelo.
* Valoración promedio.
* Cantidad de valoraciones.
* Botón para marcar como favorito.

Al hacer clic en una recomendación, el usuario accede a la página de detalle del destino.

---

## 🖼️ Detalle de recomendación

La página de detalle permite visualizar información ampliada del destino.

### Incluye

* Descripción completa del destino.
* Imagen principal.
* Galería adicional.
* Información del viaje.
* Políticas del viaje.
* Promedio de valoraciones.
* Cantidad total de valoraciones.
* Comentarios realizados por usuarios.
* Botón para compartir destino.

---

## ⭐ Valoraciones y puntuaciones

Se implementó un sistema de valoraciones para que los usuarios puedan puntuar destinos asociados a sus reservas.

### Flujo de puntuación

El usuario puede puntuar desde:

```txt
Perfil → Mis reservas → Puntuar vuelo
```

Al hacer clic, se abre una ventana emergente con:

* Resumen de la reserva.
* Selector de estrellas.
* Comentario opcional.
* Botón para publicar la valoración.

### Visualización de valoraciones

Las valoraciones se muestran en:

* Detalle de recomendación.
* Cards de recomendaciones del Home.

En las cards se visualiza:

* Promedio de estrellas.
* Cantidad de valoraciones.
* Estado “Sin valoraciones” cuando todavía no existen puntuaciones.

### Endpoints principales

```txt
GET /api/reviews/recommendation/{recommendationId}
GET /api/reviews/recommendation/{recommendationId}/summary
POST /api/reviews/recommendation/{recommendationId}
```

---

## ❤️ Favoritos

Los usuarios autenticados pueden marcar recomendaciones como favoritas.

### Funcionalidades

* Agregar recomendación a favoritos desde el Home.
* Quitar recomendación de favoritos.
* Visualizar favoritos desde el perfil.
* Persistencia de favoritos asociada al usuario autenticado.

### Endpoint principal

```txt
/api/favorites
```

---

## 👤 Perfil de usuario

El perfil fue mejorado visual y funcionalmente.

### Secciones disponibles

* Mi perfil.
* Mis reservas.
* Mis favoritos.

### Mejoras implementadas

* Sidebar funcional.
* Cambio dinámico de secciones.
* Visualización de datos del usuario.
* Listado de reservas.
* Listado de favoritos.
* Acceso a puntuación de reservas.
* Botones y cards visualmente alineados.

---

## 🧾 Reservas

Desde los resultados de búsqueda, el usuario puede avanzar a una reserva.

### Flujo

```txt
Home → Buscar vuelo → Resultados → Reservar → Perfil → Mis reservas
```

### Funcionalidades

* Pre-reserva desde resultados.
* Visualización de reserva en perfil.
* Información de origen, destino, fechas, pasajeros y clase.
* Opción para eliminar reserva.
* Opción para puntuar el viaje reservado.

---

## 🗂️ Categorías

El sistema incluye categorías para clasificar destinos y promociones.

Categorías utilizadas:

* Nacionales.
* Internacionales.
* Low Cost.
* Premium.

### Visualización pública

Las categorías se muestran en:

* Home.
* Filtros por categoría.
* Bloque compacto dentro de resultados.

### Panel administrador

Se mejoró la gestión de categorías desde el panel admin.

Funcionalidades disponibles:

* Listar categorías.
* Agregar nueva categoría.
* Editar categoría existente.
* Guardar cambios.
* Cancelar edición.
* Eliminar categoría.
* Cambiar imagen.
* Gestionar filtrado de categorías.

### Mejora importante

Se agregó un botón visible de **Agregar categoría**, respondiendo a la observación de que antes no existía una acción clara para crear nuevas categorías.

---

## 📋 Políticas del viaje

Se incorporó una sección de políticas para informar condiciones importantes del viaje.

### Funcionalidades

* Visualización pública de políticas.
* Administración de políticas desde el panel admin.
* Orden de visualización.
* Cards informativas en resultados y detalle.

### Endpoints relacionados

```txt
GET /api/policies
/api/admin/policies
```

---

## 🎨 HomePage

La página principal incluye:

* Hero dinámico con imágenes.
* Buscador funcional.
* Categorías destacadas.
* Filtros por categorías.
* Características del vuelo.
* Recomendaciones para el usuario.
* Cards con favoritos.
* Cards con valoraciones.

### Mejoras visuales

* Ajustes de buscador principal.
* Corrección de colores y estados hover.
* Mejoras en las cards de recomendaciones.
* Incorporación de estrellas en recomendaciones.
* Ajustes de espaciado, tipografía y estructura.

---

## 🔎 Página de resultados

La página de resultados fue ampliada con una experiencia más completa.

### Incluye

* Encabezado con resumen de búsqueda.
* Calendario doble.
* Leyenda de disponibilidad.
* Manejo de errores.
* Horarios de ida.
* Horarios de vuelta.
* Bloque de destino recomendado.
* Imagen decorativa de ventanilla de avión.
* Políticas del viaje.
* Botón para reservar.
* Carrusel compacto de recomendaciones.
* Carrusel compacto de categorías.

### Mejoras visuales

* Ajuste del bloque de destino recomendado.
* Diseño con imagen de fondo.
* Cards compactas mejoradas.
* Corrección de tamaños y espaciados.
* Separación visual entre secciones.

---

## 🛠️ Panel de administración

El panel de administración permite gestionar diferentes secciones del sistema.

### Módulos disponibles

* Vuelos.
* Pasajeros.
* Recomendaciones.
* Categorías.
* Hero del Home.
* Políticas.
* Administradores.

### Mejoras implementadas

* Acceso a gestión de categorías con botón claro para crear.
* Edición y eliminación de categorías.
* Gestión de políticas.
* Ajustes visuales en formularios y tablas.
* Sidebar de administración organizado.

---

## 🔐 Autenticación y seguridad

El sistema cuenta con autenticación y manejo de roles.

## Imagenes del Proyecto

## Resultado del buscador
<img width="1356" height="633" alt="resultado de buscador" src="https://github.com/user-attachments/assets/2081d32e-419e-41f7-babe-bf3e22faf374" />

## Recomendaciones
<img width="1346" height="532" alt="recomendaciones" src="https://github.com/user-attachments/assets/f19e639e-6acd-4d38-a184-52337592e5ea"  />

  ## Compartir en redes
  <img width="664" height="617" alt="compartir en redes" src="https://github.com/user-attachments/assets/7e201621-d679-45fd-94e6-4f282b079b58" />

  ## Categorias
  <img width="1334" height="409" alt="categorias" src="https://github.com/user-attachments/assets/a61df726-bf5c-446b-9ee9-d934eb353dc8" />

 





##


### Funcionalidades

* Registro de usuarios.
* Login.
* Activación de cuenta por email.
* JWT para autenticación.
* Roles de usuario y administrador.
* Protección de rutas administrativas.
* Configuración de CORS para entorno local.

### Roles

* `ROLE_USER`
* `ROLE_ADMIN`

---

## ✉️ Sistema de mailing

Se incorporó envío de emails desde backend.

### Funcionalidades

* Envío de email de activación.
* Endpoint de prueba de correo.
* Configuración de servicio de mail.

---

## 🔐 Acceso al panel de administración

Para acceder a la sección administrativa del sistema:

```txt
http://localhost:5173/login
```

Credenciales de administrador para prueba local:

```txt
Usuario: admin@admin1.com
Contraseña: Admin1234
```

Desde este panel es posible gestionar:

* Vuelos.
* Recomendaciones.
* Categorías.
* Hero.
* Pasajeros.
* Políticas.
* Administradores.

---

## 🧩 Puertos utilizados

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:8080
MySQL:    puerto 3306
```

Es necesario tener backend, frontend y base de datos activos para el correcto funcionamiento del sistema.

---

## 🚀 Cómo iniciar el proyecto

### 1. Backend

Abrir la carpeta:

```txt
Backend-aerolinea
```

Verificar la configuración de base de datos en `application.properties`.

Ejecutar desde el IDE o por terminal:

```bash
mvn spring-boot:run
```

El backend inicia en:

```txt
http://localhost:8080
```

---

### 2. Frontend

Abrir la carpeta:

```txt
frontend-aerolinea
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto:

```bash
npm run dev
```

El frontend inicia en:

```txt
http://localhost:5173
```

---

## 🗄️ Base de datos

El proyecto utiliza MySQL.

Base de datos utilizada:

```txt
aerolinea_db
```

La configuración de conexión se encuentra en:

```txt
Backend-aerolinea/src/main/resources/application.properties
```

---

## 🧪 Pruebas sugeridas

### Usuario final

1. Iniciar sesión o registrarse.
2. Buscar un vuelo desde el Home.
3. Seleccionar fechas disponibles.
4. Revisar horarios de ida y vuelta.
5. Avanzar a reserva.
6. Ir al perfil.
7. Entrar en “Mis reservas”.
8. Puntuar un vuelo reservado.
9. Verificar que la valoración aparezca en el detalle y en la card del Home.

### Administrador

1. Iniciar sesión como administrador.
2. Ingresar al panel admin.
3. Ir a Gestión de Categorías.
4. Agregar una categoría nueva.
5. Editar una categoría existente.
6. Guardar cambios.
7. Eliminar una categoría si corresponde.
8. Gestionar políticas del viaje.
9. Verificar imágenes del hero y recomendaciones.

---

## 🧩 Sprint 1

En el primer sprint se trabajó sobre la estructura inicial del sistema.

### Funcionalidades principales

* Estructura del proyecto full stack.
* Home inicial.
* Header y footer.
* Recomendaciones.
* Categorías.
* Panel administrador inicial.
* Gestión de vuelos.
* Gestión de pasajeros.

---

## 🧩 Sprint 2

En el segundo sprint se incorporaron funcionalidades avanzadas de seguridad, administración y experiencia de usuario.

### Funcionalidades implementadas

* Registro e inicio de sesión.
* Activación por email.
* Roles de usuario y administrador.
* Perfil de usuario.
* Gestión de administradores.
* Gestión de categorías.
* Características asociadas a categorías.
* Mejoras visuales del Home.
* Integración de imágenes desde uploads.
* Configuración de CORS y seguridad.

---

## 🧩 Sprint 3

En el tercer sprint se incorporaron mejoras vinculadas a reservas, favoritos, valoraciones y experiencia final de usuario.

### Funcionalidades implementadas

* Reservas desde resultados de búsqueda.
* Sección “Mis reservas” en perfil.
* Sección “Mis favoritos” en perfil.
* Sistema de favoritos.
* Sistema de valoraciones.
* Promedio de estrellas.
* Comentarios de usuarios.
* Visualización de estrellas en cards.
* Políticas del viaje.
* Calendario doble de disponibilidad.
* Manejo de errores en disponibilidad.
* Mejoras visuales en SearchResults.
* Mejoras visuales en Profile.
* Mejoras en Admin Categorías.
* Botón para agregar categoría.
* Edición, cancelación y eliminación de categorías.

---

## 🖼️ Imágenes y recursos

El proyecto incluye carpetas de imágenes necesarias para visualizar correctamente:

* Hero principal.
* Categorías.
* Recomendaciones.
* Galerías de destinos.
* Recursos visuales del frontend.

Por este motivo, las carpetas `uploads` forman parte del repositorio.

---

## 📌 Estado actual

El sistema cuenta con funcionalidades completas para:

* Búsqueda de vuelos.
* Visualización de disponibilidad.
* Reservas.
* Perfil de usuario.
* Favoritos.
* Valoraciones.
* Administración de categorías.
* Administración de políticas.
* Recomendaciones.
* Gestión de imágenes.

El proyecto se encuentra preparado para presentación académica y pruebas locales.

---

## 👩‍💻 Autora

**Marina Rao**

---

## 📄 Licencia

Proyecto de uso académico.

