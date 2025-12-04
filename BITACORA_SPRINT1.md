# Bitácora – Sprint 1  

**Proyecto:** Sistema de Gestión y Reservas para Aerolínea  
**Desarrolladora:** Marina Rao  


## 1. Descripción general del proyecto 

El proyecto consiste en un sistema web para una aerolínea, dividido en dos áreas principales:

### Sitio público
- Visualización de recomendaciones de viaje.
- Búsqueda de vuelos con autocomplete.
- Visualización de detalles de destinos.
- Formulario de reservas.
- Hero dinámico con imágenes administrables.
- Navegación general con header y footer unificados.

### Panel administrativo
- Gestión de vuelos (creación, edición y eliminación).
- Gestión de pasajeros.
- Gestión de recomendaciones, incluyendo descripción larga e imágenes.
- Gestión de categorías promocionales.
- Gestión de imágenes del hero.
- Acceso restringido a usuarios administradores.
- Bloqueo de acceso en pantallas pequeñas con mensaje de advertencia.

El objetivo general del sistema es brindar una plataforma moderna y funcional que permita administrar la información principal de una aerolínea y, al mismo tiempo, ofrecer a los usuarios una experiencia clara para consultar vuelos y destinos.

---

## 2. Objetivo del Sprint 1

- Definir la arquitectura base del frontend (React + Vite) y del backend (Spring Boot + MySQL).
- Implementar el layout público con header, footer y página principal.
- Implementar el layout del panel de administración con header, sidebar y footer propios.
- Desarrollar los CRUD principales de vuelos, pasajeros y recomendaciones.
- Incorporar el módulo de categorías y el hero administrable.
- Configurar la conexión con la base de datos MySQL.
- Restringir el acceso al panel admin en dispositivos pequeños.

---

## 3. Alcances desarrollados

### Backend (Spring Boot)

- Proyecto configurado con estructura en capas (controller, service, repository, entity, dto).
- CRUD completo de vuelos.
- CRUD de pasajeros.
- Sistema de asignación automática de asientos según clase.
- Endpoints para recomendaciones, incluyendo soporte para descripción larga e imágenes.
- Endpoints para categorías.
- Endpoints para imágenes del hero.
- Manejo de validaciones y excepciones.
- Conexión establecida con la base de datos MySQL (`aerolinea_db`).

### Frontend (React + Vite)

- Layout público con header y footer reutilizables.
- Página Home con hero dinámico.
- Buscador de vuelos con autocomplete.
- Páginas: Home, Login, Register, listado de vuelos y detalle de recomendaciones.
- Layout de administración con sidebar fijo, header y footer propios.
- Protección de rutas para el panel admin según usuario logueado y rol.
- Bloqueo del panel admin en pantallas pequeñas, mostrando mensaje de advertencia.
- Pantallas para gestión visual de vuelos, pasajeros, recomendaciones y categorías.
- Carga y previsualización de imágenes en formularios de administración.

---

## 4. Casos de prueba realizados (resumen)

### Navegación y acceso

- Acceso correcto a las rutas públicas (Home, Login, Register, Listado de vuelos).
- Acceso correcto al panel admin solo con usuario administrador.
- Redirección cuando el usuario no tiene permisos.
- Bloqueo y mensaje de advertencia al intentar usar el admin en pantalla pequeña.

### Vuelos

- Creación de un vuelo con datos completos.
- Edición de un vuelo existente.
- Eliminación de un vuelo.
- Validación de fechas y horarios.
- Verificación de actualización de asientos disponibles al asignar pasajeros.

### Pasajeros

- Creación de pasajero asociado a un vuelo.
- Asignación automática de asiento según clase.
- Selección manual de asiento cuando corresponde.
- Validación para no permitir guardar sin asiento asignado.

### Recomendaciones

- Visualización de recomendaciones en la página principal.
- Carga de nuevas recomendaciones desde el panel admin.
- Edición de recomendaciones existentes (texto e imágenes).
- Verificación de que las imágenes se mantengan al editar.

### Categorías y hero

- Carga de categorías con título e imagen.
- Verificación de su visualización en la Home.
- Carga y actualización de imágenes del hero.

---

## 5. Principales dificultades encontradas

- Ajustes del layout del panel admin (coordinación entre header, sidebar y footer).
- Manejo de previsualización y persistencia de imágenes al editar recomendaciones.
- Sincronización entre el formulario de pasajeros y la lógica de asignación de asientos.
- Ajustes de estilos para evitar solapamientos entre panel público y panel admin.
- Restricción del panel admin en pantallas pequeñas sin afectar el resto del sitio.

Estas dificultades fueron abordadas durante el Sprint, realizando correcciones tanto en frontend como en backend.-

## 6. Conclusiones del Sprint 1

El Sprint 1 permitió establecer la base técnica del proyecto, tanto en el frontend como en el backend.  
Se lograron los siguientes puntos:

- Estructura general del sistema definida y en funcionamiento.
- Panel administrativo operativo con los módulos principales.
- Módulos clave de negocio (vuelos, pasajeros, recomendaciones, categorías) implementados.
- Conexión con la base de datos y flujo completo entre frontend y backend.
- Restricción adecuada del acceso al panel admin según rol y tamaño de pantalla.

El proyecto queda en una base sólida para continuar con nuevas funcionalidades, mejoras visuales y optimizaciones en los próximos sprints.

