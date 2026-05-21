// src/controllers/stopController.js
// RF-03: Mostrar paraderos cercanos por GPS | RF-04: Detalle de paradero

const prisma = require('../config/database');

/**
 * RF-03 / CU-01 (AC-03)
 * GET /api/v1/stops/nearby?lat=...&lng=...&radius=500
 * Retorna los paraderos más cercanos a la ubicación GPS del usuario,
 * ordenados por distancia, con las líneas que pasan por cada uno.
 *
 * RB-01: Si el usuario no proporciona coordenadas, retorna error descriptivo.
 */
const getNearbyStops = async (req, res, next) => {
  try {
    const { lat, lng, radius = 500 } = req.query;

    // RB-01: GPS obligatorio para esta funcionalidad
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere permiso de GPS para usar "Paraderos cercanos". Activa la ubicación en tu dispositivo.',
        code: 'GPS_REQUIRED',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = Math.min(parseInt(radius), 2000); // Máximo 2km

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, message: 'Coordenadas inválidas.' });
    }

    // Cálculo de distancia con la fórmula de Haversine usando SQL raw
    // Nota: Usamos "is_active" que es el mapeo de isActive en la DB
    const stops = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        latitude,
        longitude,
        address,
        zone,
        ROUND(
          6371000 * ACOS(
            COS(RADIANS(${latitude})) * COS(RADIANS(latitude)) *
            COS(RADIANS(longitude) - RADIANS(${longitude})) +
            SIN(RADIANS(${latitude})) * SIN(RADIANS(latitude))
          )
        )::int AS distance_meters
      FROM stops
      WHERE "isActive" = true
        AND 6371000 * ACOS(
          COS(RADIANS(${latitude})) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(${longitude})) +
          SIN(RADIANS(${latitude})) * SIN(RADIANS(latitude))
        ) <= ${radiusMeters}
      ORDER BY distance_meters ASC
      LIMIT 20
    `;

    if (stops.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: 'No hay paraderos en un radio de 500 metros.',
      });
    }

    // Enriquecer con las rutas que pasan por cada paradero
    const stopIds = stops.map((s) => s.id);
    const routesByStop = await prisma.routeStop.findMany({
      where: { stopId: { in: stopIds } },
      include: {
        route: { select: { lineNumber: true, name: true, color: true } },
      },
    });

    const routesMap = {};
    routesByStop.forEach(({ stopId, route }) => {
      if (!routesMap[stopId]) routesMap[stopId] = [];
      routesMap[stopId].push(route);
    });

    const enriched = stops.map((stop) => ({
      ...stop,
      distanceMeters: Number(stop.distance_meters),
      routes: routesMap[stop.id] || [],
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/stops
 * Retorna todos los paraderos activos (para el dataset offline RF-06).
 */
const getAllStops = async (req, res, next) => {
  try {
    const stops = await prisma.stop.findMany({
      where: { isActive: true },
      include: {
        routes: {
          include: {
            route: { select: { lineNumber: true, name: true, color: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = stops.map((stop) => ({
      id: stop.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      address: stop.address,
      zone: stop.zone,
      routes: stop.routes.map((rs) => rs.route),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNearbyStops, getAllStops };
