# 🚌 MoviNeiva: Documentación Técnica de Ingeniería (Proyecto Final)

**Nombre del Proyecto:** MoviNeiva  
**Versión Actual:** 2.8.0 ("Humanized")  
**Área:** Desarrollo Móvil e Infraestructura Backend  
**Fecha de Entrega:** Mayo 2026  

---

## 1. Resumen Ejecutivo
MoviNeiva es una solución tecnológica diseñada para optimizar la movilidad urbana en Neiva, Huila. Integra una aplicación híbrida (Android/iOS) que permite a los ciudadanos visualizar rutas de transporte público en tiempo real, calcular tarifas, reportar incidencias viales y gestionar servicios de mensajería (domicilios). La plataforma utiliza un backend centralizado escalable y servicios en la nube para garantizar alta disponibilidad.

---

## 2. Historias de Usuario (User Stories)

| ID | Usuario | Historia de Usuario | Criterio de Aceptación |
|----|---------|---------------------|------------------------|
| US-01 | Ciudadano | "Quiero ver las rutas de colectivo disponibles en un mapa interactivo para planear mi trayecto." | Visualización de polilíneas y paraderos en tiempo real sobre Leaflet/Google Maps. |
| US-02 | Domiciliario | "Quiero que los clientes vean mi ubicación GPS mientras entrego su pedido." | Transmisión de coordenadas vía WebSockets con latencia < 2s. |
| US-03 | Usuario Pro | "Quiero un acceso personalizado con un PIN de seguridad y mensajes de bienvenida." | Registro exitoso, asignación de PIN de 4 dígitos y buzón de mensajes operativo. |
| US-04 | Admin | "Quiero actualizar la base de datos de paraderos sin redistribuir la app." | Sistema de 'Datasets' consumible vía API que actualiza el frontend dinámicamente. |

---

## 3. Requerimientos del Sistema

### 3.1 Requerimientos Funcionales (RF)
*   **RF-01 (Autenticación):** Sistema de Registro/Login basado en JWT con roles diferenciados: `USER`, `DRIVER`, `ADMIN`.
*   **RF-02 (Geolocalización):** Obtención de coordenadas del dispositivo mediante el plugin `@capacitor/geolocation`.
*   **RF-03 (Mapas):** Renderizado de capas GeoJSON para rutas y marcadores para paraderos oficiales.
*   **RF-04 (Mensajería Pro):** Implementación de `InternalMessages` para comunicación directa sistema-usuario.
*   **RF-05 (Reportes):** Envío de reportes ciudadanos sobre tráfico, cierres viales o accidentes con evidencia fotográfica.
*   **RF-06 (Calculadora):** Cálculo dinámico de tarifas basado en `ServiceType` (Corriente, Ejecutivo, Nocturno).

### 3.2 Requerimientos No Funcionales (RNF)
*   **RNF-01 (Seguridad):** Encriptación de datos sensibles (passwords) mediante `bcryptjs`.
*   *   **RNF-02 (Rendimiento):** Compresión de respuestas Gzip en el backend para reducir consumo de datos móviles.
*   **RNF-03 (Resiliencia):** Sistema de compilación Gradle capaz de operar en entornos con red limitada (bypass de anotaciones).
*   **RNF-04 (Multiplataforma):** Código base único mediante React + Capacitor para Android e iOS.

---

## 4. Arquitectura de Software

### 4.1 Frontend (Capa de Cliente)
*   **Core:** React 18.3 (Hooks, Context API para Auth).
*   **Nativo:** Capacitor 8.0 para acceso a sensores de hardware (Cámara, GPS, Notificaciones).
*   **Estado:** Manejo de sesión persistente en `localStorage`.

### 4.2 Backend (Capa de Servidor)
*   **Motor:** Node.js + Express.js.
*   **Persistencia:** Prisma ORM interactuando con PostgreSQL.
*   **Seguridad:** Middlewares personalizados para validación de tokens y protección contra ataques de fuerza bruta (`express-rate-limit`).
*   **Logística:** `Winston` para el registro de eventos y errores críticos.

---

## 5. Modelo de Datos (Esquema Relacional)

La base de datos se estructura bajo las siguientes entidades clave (Prisma Schema):

*   **Users:** Almacena perfiles, `UserRole`, `secretPin` y configuración visual personalizada.
*   **Routes & Stops:** Relación N:M que define las líneas de bus, sus polilíneas y paraderos asociados.
*   **Deliveries:** Gestión de estados de pedidos y vinculación con `DeliveryTracking` para seguimiento GPS.
*   **Reports:** Registro de incidencias ciudadanas vinculadas a rutas o paraderos específicos.
*   **InternalMessages:** Sistema de notificaciones internas para usuarios registrados.

---

## 6. Guía de Despliegue e Infraestructura

### 6.1 Backend (Render Cloud)
*   **Base de Datos:** PostgreSQL administrado.
*   **Servicio:** Web Service conectado a GitHub.
*   **Build Pipeline:** 
    1. `npm install`
    2. `npx prisma generate` (Generación de tipos del cliente)
    3. `npx prisma migrate deploy` (Aplicación de cambios en esquema)
    4. `npm start`

### 6.2 Frontend & Mobile (Android Build)
Para entornos de desarrollo final, se ha optimizado el proceso de compilación nativa:
*   **JDK:** 21 (Forzado en `build.gradle`).
*   **Bypass de Red:** El archivo `android/build.gradle` incluye una lógica de `configureEach` que inhabilita las tareas de anotaciones externas que suelen fallar por firewalls o falta de red, asegurando la generación del APK en cualquier entorno.
*   **Generación del APK:**
    ```powershell
    cd movineva-frontend/android
    ./gradlew assembleDebug
    ```

---

## 7. Protocolos de Seguridad
1.  **Auth JWT:** Cada petición a rutas protegidas (`/api/v1/admin/*`, `/api/v1/user/pro/*`) requiere un header `Authorization: Bearer <token>`.
2.  **Validación de Datos:** Uso de `express-validator` para sanear inputs antes de procesar transacciones en la base de datos.
3.  **CORS:** Configuración estricta para permitir solo dominios autorizados y la comunicación local con el bridge de Capacitor.

---

## 8. Conclusiones
MoviNeiva v2.8.0 representa una madurez tecnológica significativa, pasando de ser una app de visualización estática a una plataforma de servicios transaccionales completa. La implementación de Capacitor garantiza una experiencia nativa fluida, mientras que el backend basado en Prisma y PostgreSQL asegura la integridad y escalabilidad de los datos de movilidad de la ciudad.

---
*Documento generado para la entrega final del proyecto MoviNeiva.*
