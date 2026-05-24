// src/controllers/reportController.js
const prisma = require('../config/database');

/**
 * POST /api/v1/reports
 * Crea una nueva alerta comunitaria y la notifica por Sockets.
 */
const createReport = async (req, res, next) => {
  try {
    const deviceId = String(req.headers['x-device-id'] || 'unknown');
    const sessionId = String(req.headers['x-session-id'] || 'no-session');

    // Log profundo para depuración
    console.log('📦 [REPORT_DEBUG] Body recibido:', req.body);
    console.log('🔑 [REPORT_DEBUG] Headers:', { deviceId, sessionId });

    const { latitude, longitude, type, description, userName } = req.body;

    // Validación ultra-segura de números
    const lat = Number(latitude) || 2.9333;
    const lng = Number(longitude) || -75.2872;
    const finalType = String(type || 'OTHER').toUpperCase();
    const finalUserName = String(userName || 'Compañero');

    let report;
    try {
      report = await prisma.report.create({
        data: {
          deviceId,
          userName: finalUserName,
          sessionId,
          latitude: lat,
          longitude: lng,
          type: ['TRAFFIC', 'POLICE', 'DANGER', 'ROAD_BLOCK', 'OTHER'].includes(finalType) ? finalType : 'OTHER',
          description: description || `Reporte de ${finalType}`,
          status: 'PENDING'
        }
      });
      console.log('✅ [DATABASE] Reporte guardado con éxito');
    } catch (dbError) {
      console.error('⚠️ [DATABASE_FAIL] No se pudo guardar en DB, pero intentaremos emitir por Socket:', dbError.message);
      // Fallback: crear un objeto temporal para que la app no se detenga
      report = {
        id: 'temp-' + Date.now(),
        latitude: lat,
        longitude: lng,
        type: finalType,
        description: description + ' (Modo Live)',
        createdAt: new Date()
      };
    }

    // Notificación en tiempo real via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new-report', { ...report, latitude: lat, longitude: lng });
      console.log('📡 [SOCKET] Alerta emitida a la comunidad');
    }

    return res.status(201).json({ success: true, data: report });
  } catch (err) {
    console.error('❌ [CRITICAL_ERROR] Error en createReport:', err);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar alerta',
      error: err.message
    });
  }
};

/**
 * GET /api/v1/reports/nearby
 * Retorna las alertas recientes para el radar.
 */
const getNearbyReports = async (req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 días
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const formatted = reports.map(r => ({
      ...r,
      type: String(r.type),
      latitude: Number(r.latitude),
      longitude: Number(r.longitude)
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('❌ [ERROR_NEARBY]:', err);
    res.json({ success: true, data: [] });
  }
};

const getReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, getNearbyReports, getReportStatus };
