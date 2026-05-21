// src/controllers/datasetController.js
// RF-06: Consultar rutas sin conexión | RB-02: Dataset obligatorio antes del uso offline

const prisma = require('../config/database');

/**
 * GET /api/v1/dataset/version
 * Retorna la versión activa del dataset para que el cliente sepa si debe actualizar.
 */
const getDatasetVersion = async (req, res, next) => {
  try {
    const version = await prisma.datasetVersion.findFirst({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
    });

    if (!version) {
      return res.status(503).json({ success: false, message: 'Dataset no disponible temporalmente.' });
    }

    res.json({ success: true, data: version });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dataset/download
 * Descarga el dataset completo (rutas + paraderos) para almacenamiento en caché local.
 * RB-02: Debe descargarse al menos una vez con conexión activa.
 * RNF-05: Permite el modo offline.
 */
const downloadDataset = async (req, res, next) => {
  try {
    const version = await prisma.datasetVersion.findFirst({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
    });

    if (!version) {
      return res.status(503).json({ success: false, message: 'Dataset no disponible.' });
    }

    // Descargar rutas completas con polilíneas
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      select: {
        id: true,
        lineNumber: true,
        name: true,
        color: true,
        serviceType: true,
        fare: true,
        nightFare: true,
        frequency: true,
        polyline: true,
      },
    });

    // Descargar todos los paraderos
    const stops = await prisma.stop.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        address: true,
        zone: true,
      },
    });

    // Relación rutas-paraderos
    const routeStops = await prisma.routeStop.findMany({
      select: {
        routeId: true,
        stopId: true,
        order: true,
        isKeyStop: true,
      },
    });

    // Tarifas vigentes
    const fares = await prisma.fare.findMany();

    res.json({
      success: true,
      data: {
        version: version.version,
        publishedAt: version.publishedAt,
        routes,
        stops,
        routeStops,
        fares,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDatasetVersion, downloadDataset };
