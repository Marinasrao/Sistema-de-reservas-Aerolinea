# ✈️ Aerolínea — Sistema de Reservas  
Proyecto full stack desarrollado con **React + Spring Boot** para gestionar vuelos, recomendaciones, reservas, pasajeros y administración del sitio.

## 🧭 Tecnologías utilizadas

### **Frontend**
- React (Vite)
- React Router
- CSS Modules


### **Backend**
- Spring Boot
- Spring Data JPA
- MySQL
- Lombok

## 🛫 Funcionalidades principales

### 🔍 **Búsqueda de vuelos**
- Origen, destino y fecha exacta  
- Resultados dinámicos y realistas  
- Asientos disponibles por clase  

### 💺 **Gestión de pasajeros**
- Creación de pasajeros  
- Asignación automática o manual de número de asiento  
- Clases: Economy, Business, First  

### 📌 **Recomendaciones**

El sistema incluye una sección de recomendaciones de destinos en la página principal.

Cada recomendación muestra:

- Imagen del destino
- Precio promocional
- Descuento aplicado
- Fecha de vuelo
- Aeropuerto de salida

👉 **Al hacer click en una recomendación se accede a la página de detalle del destino**, donde se puede visualizar:

- **Descripción completa del destino**
- **Galería principal con imágenes destacadas**
- **Galería adicional con múltiples fotografías del destino**

Esto permite explorar visualmente el destino antes de realizar una reserva.

### 🗂️ **Categorías**
- Nacionales, Internacionales, Low Cost, Premium  
- Gestión completa desde el panel de administración  

### 🎨 **HomePage**
- Buscador funcional  
- Hero dinámico con imágenes  
- Recomendaciones y categorías promocionales  

### 🛠️ **Admin Panel**
- Gestión de:
  - Vuelos  
  - Recomendaciones  
  - Categorías  
  - Carrusel Hero del home  
  - Pasajeros

### 🖼 ** Seccion Buscador y Hero**
    
<img width="1363" height="635" alt="Buscador-Hero" src="https://github.com/user-attachments/assets/c25b5d23-acd0-4f0c-a0c9-66d11bb3dae2" />


 ### 🖼 ** Seccion Recomendaciones**
<img width="1365" height="497" alt="Recomendaciones" src="https://github.com/user-attachments/assets/6cad0e75-4fe2-4d2d-b706-d25a8b8de61c" />

###Galeria**

<img width="1366" height="639" alt="Galeria" src="https://github.com/user-attachments/assets/388cbdac-bf11-4d32-a85a-20a436b7d073" />

###Descripcion del destino**


<img width="1111" height="634" alt="Descripcion del destino" src="https://github.com/user-attachments/assets/f56425ab-1ceb-4702-b78c-7b40a3425fbc" />




### 🖼 ** Seccion Categoria **
<img width="1360" height="518" alt="Categorias" src="https://github.com/user-attachments/assets/5bf412cb-9937-4118-9d68-edb4f814b27a" />



## 🔐 Acceso al Panel de Administración

Para acceder a la sección administrativa del sistema:

**URL:**
http://localhost:5173/login

**Credenciales de administrador:**

- **Usuario:** maru@test.com
- **Contraseña:** Admin123

Desde este panel es posible gestionar:
- Vuelos
- Recomendaciones
- Categorías
- Hero
- Pasajeros

## 🧩 Puertos utilizados

- **Frontend (React / Vite):** http://localhost:5173
- **Backend (Spring Boot):** http://localhost:8080
- **Base de datos:** MySQL en puerto 3306

Asegurarse de tener ambos servidores corriendo para el correcto funcionamiento del sistema.

## 🧩 Sprint 2 – Funcionalidades Implementadas

En esta segunda etapa del proyecto se incorporaron funcionalidades avanzadas de seguridad, administración y experiencia de usuario.

### 🔐 Autenticación y Seguridad
- Registro y login de usuarios
- Autenticación basada en cookies
- Roles de usuario: ADMIN y USER
- Protección de rutas administrativas
- Persistencia de sesión

### 👤 Gestión de Usuarios
- Panel de administración de usuarios
- Creación y asignación de roles
- Perfil de usuario con información personal

### 🗂️ Categorías y Características
- Categorías asociadas a vuelos (Nacionales, Internacionales, Low Cost, Premium)
- Gestión completa de categorías desde el panel admin
- Sistema de características asociadas a categorías
- Visualización dinámica en el home

### ✉️ Sistema de Mailing
- Envío de emails desde backend
- Endpoint de prueba de correo
- Configuración de servicio de mail

### 🛠️ Mejoras Técnicas
- DTOs y mappers para separar lógica de entidades
- Seguridad centralizada con Spring Security
- Configuración de CORS y proxy para entorno de desarrollo


## 🚀 Cómo iniciar el proyecto

### 1️⃣ Backend (Spring Boot)

1. Abrir el proyecto Backend-aerolinea en tu IDE (IntelliJ / Eclipse).
2. Verificar las credenciales de MySQL en `application.properties`.
3. Ejecutar la aplicación con `Run`.

El backend inicia en:
http://localhost:8080

---

### 2️⃣ Frontend (React)

1. Abrir la carpeta `frontend-aerolinea`.
2. Instalar dependencias:
   ```bash
   npm install
3. npm run dev


## 👩‍💻 Autora
**Marina Rao**  

## 📄 Licencia
Proyecto de uso académico
