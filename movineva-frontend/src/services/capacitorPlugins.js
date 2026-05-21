import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Obtener la ubicación actual del usuario
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCurrentLocation = async () => {
    try {
        const coordinates = await Geolocation.getCurrentPosition();
        return {
            lat: coordinates.coords.latitude,
            lng: coordinates.coords.longitude,
            accuracy: coordinates.coords.accuracy,
        };
    } catch (error) {
        console.error('Error al obtener ubicación:', error);
        throw error;
    }
};

/**
 * Monitorear cambios de ubicación en tiempo real
 * @param {Function} callback - Función que se ejecuta cuando la ubicación cambia
 * @returns {string} ID para poder detener el monitoreo
 */
export const watchLocation = (callback) => {
    try {
        const watchId = Geolocation.watchPosition({}, (position, error) => {
            if (error) {
                console.error('Error al monitorear ubicación:', error);
                return;
            }
            callback({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
            });
        });
        return watchId;
    } catch (error) {
        console.error('Error al iniciar monitoreo de ubicación:', error);
        throw error;
    }
};

/**
 * Detener el monitoreo de ubicación
 * @param {string} watchId - ID retornado por watchLocation
 */
export const stopWatchingLocation = async (watchId) => {
    try {
        if (watchId) {
            await Geolocation.clearWatch({ id: watchId });
        }
    } catch (error) {
        console.error('Error al detener monitoreo de ubicación:', error);
    }
};

/**
 * Tomar una foto con la cámara
 * @returns {Promise<string>} Base64 de la imagen o ruta
 */
export const takePicture = async () => {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
        });
        return image.base64String;
    } catch (error) {
        console.error('Error al tomar foto:', error);
        throw error;
    }
};

/**
 * Seleccionar una foto de la galería
 * @returns {Promise<string>} Base64 de la imagen
 */
export const selectPhotoFromGallery = async () => {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos,
        });
        return image.base64String;
    } catch (error) {
        console.error('Error al seleccionar foto:', error);
        throw error;
    }
};

/**
 * Solicitar permisos de notificaciones push
 */
export const requestPushNotificationPermission = async () => {
    try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            throw new Error('Usuario denegó permisos de notificaciones');
        }

        // Registrar para recibir notificaciones
        await PushNotifications.register();

        return permStatus;
    } catch (error) {
        console.error('Error al solicitar permisos de notificaciones:', error);
        throw error;
    }
};

/**
 * Configurar handlers para notificaciones push
 * @param {Function} onReceive - Callback cuando se recibe una notificación
 * @param {Function} onActionPerformed - Callback cuando el usuario interactúa con la notificación
 */
export const setupPushNotificationHandlers = (onReceive, onActionPerformed) => {
    // Escuchar notificaciones recibidas
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notificación recibida:', notification);
        onReceive?.(notification);
    });

    // Escuchar acciones de notificaciones
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Acción de notificación:', notification);
        onActionPerformed?.(notification);
    });
};

/**
 * Verificar si está corriendo en una app nativa de Capacitor
 */
export const isNativeApp = () => {
    return window.capacitor !== undefined;
};

export default {
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    takePicture,
    selectPhotoFromGallery,
    requestPushNotificationPermission,
    setupPushNotificationHandlers,
    isNativeApp,
};
