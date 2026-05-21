// src/controllers/notificationController.js
// RF-10: Activar notificación de ruta favorita | AC-04: FCM / APNs

const prisma = require('../config/database');

/**
 * POST /api/v1/notifications
 * Headers: X-Device-ID
 * Body: { routeId, fcmToken, scheduledAt, daysOfWeek }
 * Configura una alerta de salida para una ruta favorita.
 */
const createNotification = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const { routeId, fcmToken, scheduledAt, daysOfWeek } = req.body;

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Se requiere el header X-Device-ID.' });
    }

    if (!routeId || !fcmToken || !scheduledAt || !daysOfWeek?.length) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren: routeId, fcmToken, scheduledAt y daysOfWeek.',
      });
    }

    // Verificar que la ruta existe y está en favoritos del dispositivo
    const favorite = await prisma.favorite.findFirst({ where: { deviceId, routeId } });
    if (!favorite) {
      return res.status(422).json({
        success: false,
        message: 'Solo puedes activar notificaciones para rutas que tengas en favoritos.',
      });
    }

    // Upsert: si ya existe una notificación para esta ruta en este dispositivo, actualízala
    const notification = await prisma.notification.upsert({
      where: {
        // Usamos un campo ficticio único; en producción se crearía un índice compuesto
        id: (await prisma.notification.findFirst({ where: { deviceId, routeId } }))?.id || 'new',
      },
      update: { fcmToken, scheduledAt: new Date(scheduledAt), daysOfWeek, isActive: true, updatedAt: new Date() },
      create: {
        deviceId,
        routeId,
        fcmToken,
        scheduledAt: new Date(scheduledAt),
        daysOfWeek,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Notificación configurada. Recibirás un recordatorio antes de salir.',
      data: { id: notification.id, scheduledAt: notification.scheduledAt, daysOfWeek: notification.daysOfWeek },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/notifications/:id
 * Desactiva una notificación configurada.
 */
const deleteNotification = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const { id } = req.params;

    const updated = await prisma.notification.updateMany({
      where: { id, deviceId },
      data: { isActive: false },
    });

    if (updated.count === 0) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
    }

    res.json({ success: true, message: 'Notificación desactivada.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/notifications
 * Headers: X-Device-ID
 * Retorna las notificaciones activas del dispositivo.
 */
const getNotifications = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Se requiere el header X-Device-ID.' });
    }

    const notifications = await prisma.notification.findMany({
      where: { deviceId, isActive: true },
      include: { route: { select: { lineNumber: true, name: true, color: true } } },
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

module.exports = { createNotification, deleteNotification, getNotifications };
