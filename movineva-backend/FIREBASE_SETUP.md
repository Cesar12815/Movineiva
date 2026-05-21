# 🔥 Guía de configuración Firebase para MoviNeiva

## ¿Qué necesitas Firebase?

Firebase Cloud Messaging (FCM) es lo que permite enviar **notificaciones push** a los usuarios de la app (RF-10). Es completamente gratuito para el volumen de MoviNeiva.

---

## Paso a paso — 10 minutos

### 1. Crear proyecto Firebase

1. Ve a → https://console.firebase.google.com
2. Haz clic en **"Agregar proyecto"**
3. Nombre del proyecto: `movineva-app`
4. Desactiva Google Analytics si no la necesitas → **Crear proyecto**

---

### 2. Obtener credenciales del servidor (Admin SDK)

1. En la consola, ve a ⚙️ **Configuración del proyecto** (rueda dentada arriba a la izquierda)
2. Pestaña **"Cuentas de servicio"**
3. Haz clic en **"Generar nueva clave privada"**
4. Se descarga un archivo `.json` con este formato:

```json
{
  "type": "service_account",
  "project_id": "movineva-app",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@movineva-app.iam.gserviceaccount.com",
  ...
}
```

---

### 3. Copiar valores al .env del backend

Abre `movineva-backend/.env` y reemplaza:

```env
FIREBASE_PROJECT_ID=movineva-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@movineva-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCLAVE_COPIADA_AQUI\n-----END PRIVATE KEY-----\n"
```

> ⚠️ **Importante**: copia la `private_key` exactamente como está en el JSON,
> incluyendo los `\n`. Pon todo entre comillas dobles en el `.env`.

---

### 4. Configurar FCM en la app móvil (frontend)

Para que los usuarios reciban notificaciones, la app debe registrarse con FCM y enviar su token al backend.

En la app (React Native / Flutter / Web), instala Firebase SDK y obtén el token:

```javascript
// Ejemplo con Firebase JS SDK
import { getMessaging, getToken } from 'firebase/messaging'

const messaging = getMessaging()
const fcmToken = await getToken(messaging, {
  vapidKey: 'TU_VAPID_KEY_DE_FIREBASE_CONSOLE'
})

// Enviar al backend al crear notificación
await fetch('/api/v1/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Device-ID': deviceId },
  body: JSON.stringify({ routeId, fcmToken, scheduledAt, daysOfWeek })
})
```

La **VAPID Key** la encuentras en:
Firebase Console → Configuración del proyecto → Cloud Messaging → Certificados web push

---

### 5. Verificar que funciona

Al iniciar el backend verás en la consola:
```
✅ Firebase Admin inicializado correctamente.
```

Si ves:
```
⚠️  Firebase no configurado. Las notificaciones push están desactivadas.
```
...significa que las credenciales en `.env` no están correctamente configuradas.

---

## Preguntas frecuentes

**¿Es de pago?**
No. El plan Spark (gratuito) de Firebase cubre millones de notificaciones al mes, más que suficiente para MoviNeiva.

**¿Funciona en iOS y Android?**
Sí. FCM maneja ambas plataformas. En iOS necesitas registrar los certificados APNs en Firebase Console.

**¿El backend necesita internet?**
Sí, el servidor backend necesita poder conectarse a `fcm.googleapis.com` para enviar notificaciones.
