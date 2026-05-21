# 🚌 MoviNeiva: Documentación Técnica Integral (ACTUALIZADO)

Este documento detalla la arquitectura, el nuevo sistema de usuarios y la guía de despliegue en la nube para la plataforma **MoviNeiva**.

---

## 1. Arquitectura y Nuevas Entidades

### 👤 Sistema de Usuarios (Auth)
Se ha implementado un sistema de autenticación completo para asegurar que solo usuarios registrados puedan acceder a funciones críticas.

- **Modelo User (`users`)**:
    - `id`, `email`, `password` (encriptada con bcrypt), `name`.
    - `role`: Define si es un usuario estándar (`USER`), domiciliario (`DRIVER`) o administrador (`ADMIN`).
- **Seguridad**:
    - Uso de **JSON Web Tokens (JWT)** para sesiones seguras.
    - Contraseñas protegidas mediante hashing.

### 🔌 API Endpoints de Autenticación
- `POST /api/v1/auth/register`: Crea un nuevo usuario.
- `POST /api/v1/auth/login`: Valida credenciales y devuelve un Token JWT.

---

## 2. Frontend: Flujo de Usuario
- **AuthContext**: Gestiona el estado de "Sesión Iniciada" en toda la App.
- **Rutas Protegidas**: Si un usuario no ha iniciado sesión, es redirigido automáticamente a la pantalla de Login.
- **LocalStorage**: El token de seguridad se guarda localmente para evitar loguearse cada vez que se abra la App.

---

## 3. Guía de Despliegue en la Nube (RENDER.COM)

Para que la App funcione 24/7 sin tu PC encendida, sigue estos pasos:

### Paso 1: Base de Datos (PostgreSQL)
1.  En Render.com, crea un **New > PostgreSQL**.
2.  Copia la "Internal Database URL".
3.  Esta URL será tu nueva `DATABASE_URL` en las variables de entorno.

### Paso 2: Backend (Node.js)
1.  Sube tu código a un repositorio de GitHub.
2.  En Render, crea un **New > Web Service**.
3.  Conecta tu repositorio y selecciona la carpeta `movineva-backend`.
4.  **Runtime**: Node.
5.  **Build Command**: `npm install && npx prisma generate`.
6.  **Start Command**: `npm start`.
7.  **Environment Variables**:
    - `DATABASE_URL`: (La de tu base de datos de Render).
    - `PORT`: 10000.
    - `JWT_SECRET`: Una clave larga y aleatoria.

### Paso 3: Frontend (Web/Static)
1.  Crea un **New > Static Site** en Render.
2.  Conecta el repositorio y selecciona la carpeta `movineva-frontend`.
3.  **Build Command**: `npm run build`.
4.  **Publish Directory**: `dist`.
5.  **Environment Variables**:
    - Cambia `VITE_API_BASE` a la URL que te dio Render para tu backend.

---

## 4. Estructura de Archivos Clave

- `movineva-backend/src/controllers/authController.js`: Lógica de registro y login.
- `movineva-frontend/src/context/AuthContext.jsx`: Proveedor global de identidad.
- `movineva-frontend/src/pages/LoginPage.jsx`: Interfaz de acceso.

---
*MoviNeiva - Sistema de Movilidad Inteligente para Neiva, Huila.*
