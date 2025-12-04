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
- Cards estilo LATAM  
- Imágenes, precio promocional, descuento, fecha y aeropuerto  
- Detalles extendidos con galería de imágenes  

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
    
 <img width="1336" height="650" alt="Buscador y Hero" src="https://github.com/user-attachments/assets/15c5360a-d590-433b-9baa-65067fb3ddf2" />

 ### 🖼 ** Seccion Recomendaciones**
 
<img width="1354" height="578" alt="Seccion Recomendaciones" src="https://github.com/user-attachments/assets/1d0e51d4-42e5-4cd5-951d-d0bec3e65dcf" />

### 🖼 ** Seccion Categoria y Footer**

<img width="1347" height="583" alt="Categorias y footer" src="https://github.com/user-attachments/assets/cb479fda-1667-4057-bc88-3e0276087b47" />

## 🔐 Acceso al Panel de Administración

Para acceder a la sección administrativa del sistema:

**URL:**
http://localhost:5173/login

**Credenciales de administrador:**

- **Usuario:** admin
- **Contraseña:** admin123

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
