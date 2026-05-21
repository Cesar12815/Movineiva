# 📱 Guía: Usar Tu App MoviNeiva en el Celular

¡Tu aplicación está casi lista para usarse en dispositivos móviles! He configurado **Capacitor** que permite convertir tu app web en una aplicación nativa para Android e iOS.

## ✅ Lo que ya hemos hecho

1. ✅ Instalado **Capacitor** y sus plugins
2. ✅ Agregado soporte para **Android** e **iOS**
3. ✅ Instalado plugins para:
   - 📍 **Geolocalización** (GPS)
   - 📸 **Cámara** (fotos)
   - 🔔 **Notificaciones Push**
4. ✅ Optimizado tu app para dispositivos móviles
5. ✅ Creado funciones helper para usar fácilmente los plugins

## 🚀 Pasos siguientes

### Opción 1: Compilar para Android (Recomendado para empezar)

#### Requisitos previos (si no los tienes):
- **Android Studio** (descargar de https://developer.android.com/studio)
- **JDK 17+** (incluido en Android Studio)

#### Pasos:

1. **Actualizar la build del proyecto web:**
   ```bash
   cd movineva-frontend
   npm run build
   ```

2. **Copiar los cambios a Android:**
   ```bash
   npx cap sync android
   ```

3. **Compilar para Android:**
   ```bash
   npx cap build android
   ```
   Esto abrirá Android Studio automáticamente.

4. **En Android Studio:**
   - Espera a que sincronice los archivos Gradle
   - Haz clic en **Run** > **Run 'app'**
   - Selecciona tu dispositivo/emulador
   - ¡La app se compilará e instalará!

---

### Opción 2: Compilar para iOS (Requiere Mac)

#### Requisitos previos:
- **Xcode** (desde App Store)
- **Mac con iOS 14+**

#### Pasos:

1. **Actualizar la build del proyecto web:**
   ```bash
   cd movineva-frontend
   npm run build
   ```

2. **Copiar los cambios a iOS:**
   ```bash
   npx cap sync ios
   ```

3. **Abrir en Xcode:**
   ```bash
   npx cap build ios
   ```

4. **En Xcode:**
   - Espera a que cargue el proyecto
   - Selecciona tu dispositivo
   - Presiona el botón ▶ (Play) para compilar

---

## 🛠️ Cómo usar los plugins en tu código

Ya creé un archivo `src/services/capacitorPlugins.js` con funciones helper. Ejemplo de uso:

### Obtener ubicación actual:
```javascript
import { getCurrentLocation } from './services/capacitorPlugins';

const miUbicacion = await getCurrentLocation();
console.log(`Lat: ${miUbicacion.lat}, Lng: ${miUbicacion.lng}`);
```

### Tomar una foto:
```javascript
import { takePicture } from './services/capacitorPlugins';

const fotoBase64 = await takePicture();
// Enviar a tu backend
```

### Usar notificaciones:
```javascript
import { requestPushNotificationPermission, setupPushNotificationHandlers } from './services/capacitorPlugins';

// Solicitar permiso (hacer al iniciar la app)
await requestPushNotificationPermission();

// Configurar handlers
setupPushNotificationHandlers(
  (notification) => console.log('Notificación recibida:', notification),
  (action) => console.log('Usuario interactuó:', action)
);
```

---

## 📋 Permisos requeridos

### Android (archivo: android/app/src/main/AndroidManifest.xml)
Ya están configurados, pero verifica que incluya:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS (archivo: ios/App/App/Info.plist)
Ya están configurados automáticamente con prompts nativos.

---

## 🔧 Configuración importante en capacitor.config.json

Tu app ya tiene configurada:
- **App ID**: com.movineva.app
- **App Name**: Movineva
- **Web Directory**: dist/

Si necesitas cambiar algo, edita: `movineva-frontend/capacitor.config.json`

---

## 📤 Publicar en tiendas (Android Play Store / Apple App Store)

### Play Store (Android):
1. Necesitas una cuenta de Google Play Developer ($25 de una vez)
2. Desde Android Studio: Build > Generate Signed Bundle / APK
3. Seguir el asistente de Google Play Console

### App Store (iOS):
1. Necesitas una cuenta Apple Developer ($99/año)
2. Desde Xcode: Product > Archive
3. Seguir el asistente del App Store Connect

---

## 🆘 Solución de problemas

### "Error: Android SDK not found"
→ Abre Android Studio, ve a Tools > SDK Manager y descarga SDK para Android 14+

### "Error compiling for iOS"
→ Ejecuta en una Mac y asegúrate de tener Xcode actualizado:
```bash
sudo xcode-select --install
```

### App se cuelga al abrirse
→ Abre la consola de desarrollo:
- Android: `adb logcat` en la terminal
- iOS: Ver logs en Xcode

### GPS/Cámara no funcionan
→ Verifica que hayas accepted los permisos cuando la app los pide

---

## 📝 Próximos pasos

1. **Prueba en un emulador primero** (más rápido que dispositivo físico)
2. **Conecta tu teléfono** y prueba los plugins (GPS, cámara)
3. **Prueba el backend** - Asegúrate que la URL de API sea accesible desde el teléfono
4. **Publica en la tienda** cuando esté completamente listo

---

## 📚 Documentación oficial

- Capacitor: https://capacitorjs.com/docs
- Android: https://developer.android.com/docs
- iOS: https://developer.apple.com/documentation

---

¡Listo! Tu app está lista para convertirse en una verdadera aplicación móvil. 🎉
