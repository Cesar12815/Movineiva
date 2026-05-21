// src/services/notificationScheduler.js
// RF-10: Envío programado de notificaciones push via FCM / APNs (AC-04)

const cron = require('node-cron');
const prisma = require('../config/database');
const logger = require('../utils/logger');

let firebaseAdmin = null;

const initFirebase = () => {
  try {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

    if (!FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID === 'movineva-app') {
      logger.warn('⚠️ Firebase: Falta configurar el PROJECT_ID real en el archivo .env');
      return null;
    }
    if (!FIREBASE_PRIVATE_KEY || FIREBASE_PRIVATE_KEY.includes('TU_CLAVE_PRIVADA_AQUI')) {
      logger.warn('⚠️ Firebase: La PRIVATE_KEY en el archivo .env es la de ejemplo. Debes pegar la tuya.');
      return null;
    }

    const admin = require('firebase-admin');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    logger.info('✅ Firebase Admin inicializado correctamente.');
    return admin;
  } catch (err) {
    logger.error('❌ Error fatal inicializando Firebase:', err.message);
    return null;
  }
};

/**
 * Envía una notificación push al token FCM/APNs dado.
 */
const sendPushNotification = async (fcmToken, title, body) => {
  if (!firebaseAdmin) return;

  try {
    await firebaseAdmin.messaging().send({
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
  } catch (err) {
    logger.error(`Error enviando notificación a ${fcmToken.substring(0, 10)}...:`, err.message);
  }
};

/**
 * Scheduler: se ejecuta cada minuto para verificar avisos de agilidad.
 */
const checkAndSendNotifications = async () => {
  try {
    const now = new Date();
    // Aquí implementaremos lógica para notificar "Sitios Top" cercanos
    // o recordatorios de entregas programadas.

    // Por ahora, solo mantenemos la estructura activa para cuando
    // configures las llaves en el .env
  } catch (err) {
    logger.error('Error en scheduler de notificaciones:', err.message);
  }
};

/**
 * Notifica a todos los usuarios en un radio sobre un nuevo reporte de peligro/retén
 */
const notifyNearbyUsers = async (report) => {
  if (!firebaseAdmin) return;

  try {
    // Buscar dispositivos con notificaciones activas
    // En un sistema real, filtraríamos por ubicación GPS guardada recientemente
    const notifications = await prisma.notification.findMany({
      where: { isActive: true },
      distinct: ['fcmToken']
    });

    const tokens = notifications.map(n => n.fcmToken);
    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: `⚠️ ALERTA EN LA VÍA: ${report.type}`,
        body: report.description
      },
      tokens: tokens,
    };

    const response = await firebaseAdmin.messaging().sendMulticast(message);
    logger.info(`Notificaciones de alerta enviadas: ${response.successCount}`);
  } catch (err) {
    logger.error('Error enviando notificaciones multicast:', err.message);
  }
};

/**
 * Inicia el cron job que corre cada minuto.
 */
const startNotificationScheduler = () => {
  firebaseAdmin = initFirebase();
  // Ejecutar cada minuto
  cron.schedule('* * * * *', checkAndSendNotifications);
};

module.exports = { startNotificationScheduler, notifyNearbyUsers };
