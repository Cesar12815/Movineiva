// src/controllers/routeController.js
// RF-01, RF-02, RF-04, RF-07
// v2.1 — búsqueda por dirección exacta con geocodificación Nominatim

const prisma = require('../config/database');
const { geocodeAddress, haversineMeters } = require('../services/geocoder');
const logger = require('../utils/logger');

// ─── RF-01 ─────────────────────────────────────────────────────────────────────
const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      select: {
        id: true, lineNumber: true, name: true,
        color: true, serviceType: true, fare: true,
        frequency: true, polyline: true,
      },
      orderBy: { lineNumber: 'asc' },
    });
    res.json({ success: true, count: routes.length, data: routes });
  } catch (err) { next(err); }
};

// ─── RF-04 ─────────────────────────────────────────────────────────────────────
const getRouteById = async (req, res, next) => {
  try {
    const route = await prisma.route.findFirst({
      where: { id: req.params.id, isActive: true },
      include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } } },
    });
    if (!route) return res.status(404).json({ success: false, message: 'Ruta no encontrada.' });

    res.json({
      success: true,
      data: {
        id: route.id, lineNumber: route.lineNumber, name: route.name,
        color: route.color, serviceType: route.serviceType,
        fare: route.fare, nightFare: route.nightFare,
        frequency: route.frequency, polyline: route.polyline,
        stops: route.stops.map(rs => ({
          order: rs.order, isKeyStop: rs.isKeyStop,
          id: rs.stop.id, name: rs.stop.name,
          latitude: rs.stop.latitude, longitude: rs.stop.longitude,
          address: rs.stop.address, zone: rs.stop.zone,
        })),
      },
    });
  } catch (err) { next(err); }
};

// ─── RF-07 ─────────────────────────────────────────────────────────────────────
const filterRoutes = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1)
      return res.status(400).json({ success: false, message: 'Ingresa un término de búsqueda.' });

    const routes = await prisma.route.findMany({
      where: {
        isActive: true,
        OR: [
          { name:       { contains: q, mode: 'insensitive' } },
          { lineNumber: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, lineNumber: true, name: true, color: true, polyline: true },
    });
    res.json({ success: true, count: routes.length, data: routes });
  } catch (err) { next(err); }
};

// ─── RF-02: BÚSQUEDA POR DIRECCIÓN EXACTA ──────────────────────────────────────
/**
 * GET /api/v1/routes/search?origin=Cra 8 # 15-32&destination=Cll 21 # 5-10
 *
 * Flujo:
 *  1. Geocodificar origen y destino con Nominatim (OpenStreetMap)
 *  2. Encontrar el paradero más cercano a cada punto (radio máx 1.5 km)
 *  3. Buscar rutas que pasen por el paradero origen ANTES del paradero destino
 *  4. Devolver rutas + paraderos de abordaje/bajada + distancias a pie
 */
const searchRoutes = async (req, res, next) => {
  try {
    const { origin, destination } = req.query;

    if (!origin?.trim() || !destination?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Debes ingresar tanto el origen como el destino.',
      });
    }

    // ── 1. Geocodificar las dos direcciones en paralelo ──────────────────────
    logger.info(`Búsqueda: "${origin}" → "${destination}"`);

    const [originGeo, destGeo] = await Promise.all([
      geocodeAddress(origin),
      geocodeAddress(destination),
    ]);

    // Si Nominatim no pudo resolver alguna dirección
    if (!originGeo && !destGeo) {
      return res.json({
        success: false,
        geocodeError: true,
        message: 'No pudimos ubicar ninguna de las dos direcciones en Neiva. Revisa que estén escritas correctamente.',
        hints: [
          'Usa el formato: Cra 5 # 8-32 o Calle 21 con Carrera 8',
          'Incluye el barrio si la calle es muy corta: Cra 3 # 5-10, Barrio Centro',
          'Intenta con un punto de referencia: cerca al Parque Santander',
        ],
      });
    }
    if (!originGeo) {
      return res.json({
        success: false,
        geocodeError: 'origin',
        message: `No pudimos ubicar el origen: "${origin}". ¿Está en Neiva?`,
        hints: ['Ej: Cra 5 # 8-32', 'Cll 15 con Cra 7', 'Barrio Comuneros, Cll 45'],
      });
    }
    if (!destGeo) {
      return res.json({
        success: false,
        geocodeError: 'destination',
        message: `No pudimos ubicar el destino: "${destination}". ¿Está en Neiva?`,
        hints: ['Ej: Cra 9 # 20-15', 'Universidad Surcolombiana', 'Terminal de Transportes'],
      });
    }

    // ── 2. Cargar todos los paraderos activos ────────────────────────────────
    const allStops = await prisma.stop.findMany({
      where: { isActive: true },
      select: { id: true, name: true, latitude: true, longitude: true, address: true, zone: true },
    });

    // ── 3. Encontrar el paradero más cercano a cada punto ────────────────────
    const MAX_WALK_METERS = 1500; // 1.5 km máximo a pie

    const withDistOrigin = allStops
      .map(s => ({ ...s, dist: haversineMeters(originGeo.lat, originGeo.lng, s.latitude, s.longitude) }))
      .sort((a, b) => a.dist - b.dist);

    const withDistDest = allStops
      .map(s => ({ ...s, dist: haversineMeters(destGeo.lat, destGeo.lng, s.latitude, s.longitude) }))
      .sort((a, b) => a.dist - b.dist);

    // Tomar los 3 más cercanos de cada extremo para dar más opciones de match
    const nearOrigin = withDistOrigin.filter(s => s.dist <= MAX_WALK_METERS).slice(0, 3);
    const nearDest   = withDistDest.filter(s => s.dist <= MAX_WALK_METERS).slice(0, 3);

    if (nearOrigin.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        originCoords: originGeo,
        destCoords: destGeo,
        closestStopOrigin: withDistOrigin[0],  // info para mostrar el más cercano aunque esté lejos
        message: `El origen está muy lejos de cualquier paradero (el más cercano queda a ${Math.round(withDistOrigin[0]?.dist || 0)} m). Intenta con una dirección más céntrica.`,
      });
    }
    if (nearDest.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        originCoords: originGeo,
        destCoords: destGeo,
        closestStopDest: withDistDest[0],
        message: `El destino está muy lejos de cualquier paradero (el más cercano queda a ${Math.round(withDistDest[0]?.dist || 0)} m). Intenta con una dirección más céntrica.`,
      });
    }

    const originStopIds = nearOrigin.map(s => s.id);
    const destStopIds   = nearDest.map(s => s.id);

    // ── 4. Buscar rutas comunes origen→destino (destino en orden posterior) ──
    const originRoutes = await prisma.routeStop.findMany({
      where: { stopId: { in: originStopIds } },
      select: { routeId: true, stopId: true, order: true },
    });
    const destRoutes = await prisma.routeStop.findMany({
      where: { stopId: { in: destStopIds } },
      select: { routeId: true, stopId: true, order: true },
    });

    // Mapa routeId → menor order del origen
    const originMap = new Map(); // routeId → { order, stopId }
    originRoutes.forEach(({ routeId, stopId, order }) => {
      if (!originMap.has(routeId) || originMap.get(routeId).order > order)
        originMap.set(routeId, { order, stopId });
    });

    // Filtrar: destino debe venir DESPUÉS del origen en la misma ruta
    const matches = destRoutes.filter(({ routeId, order }) =>
      originMap.has(routeId) && originMap.get(routeId).order < order
    );

    if (matches.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        originCoords: originGeo,
        destCoords: destGeo,
        boardingStop:  nearOrigin[0],
        alightingStop: nearDest[0],
        message: 'No encontramos una ruta directa entre esas dos direcciones. Puede que necesites hacer un transbordo.',
      });
    }

    // ── 5. Obtener detalle de las rutas encontradas ──────────────────────────
    const routeIds = [...new Set(matches.map(m => m.routeId))];
    const routes = await prisma.route.findMany({
      where: { id: { in: routeIds }, isActive: true },
      include: {
        stops: {
          where: { isKeyStop: true },
          include: { stop: { select: { name: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Construir stopId → stop info
    const stopById = {};
    allStops.forEach(s => { stopById[s.id] = s; });

    const result = routes.map(r => {
      const originEntry = originMap.get(r.id);
      const destEntry   = matches.find(m => m.routeId === r.id);
      const boarding    = stopById[originEntry?.stopId];
      const alighting   = stopById[destEntry?.stopId];

      // Estimar tiempo: distancia entre paradas en el orden * frecuencia/2
      const orderDiff = (destEntry?.order || 0) - (originEntry?.order || 0);
      const estimatedMin = Math.max(5, orderDiff * Math.round(r.frequency / 2));

      return {
        id: r.id,
        lineNumber: r.lineNumber,
        name: r.name,
        color: r.color,
        fare: r.fare,
        frequency: r.frequency,
        estimatedTime: estimatedMin,
        keyStops: r.stops.map(rs => rs.stop.name),
        // Paraderos específicos de abordaje y bajada
        boarding: boarding ? {
          id: boarding.id,
          name: boarding.name,
          address: boarding.address,
          zone: boarding.zone,
          walkMeters: Math.round(nearOrigin.find(s => s.id === boarding.id)?.dist || 0),
        } : null,
        alighting: alighting ? {
          id: alighting.id,
          name: alighting.name,
          address: alighting.address,
          zone: alighting.zone,
          walkMeters: Math.round(nearDest.find(s => s.id === alighting.id)?.dist || 0),
        } : null,
      };
    });

    // Ordenar: primero los de menor tiempo estimado
    result.sort((a, b) => a.estimatedTime - b.estimatedTime);

    res.json({
      success: true,
      count: result.length,
      data: result,
      // Metadatos de geocodificación para el frontend
      originResolved:      originGeo.displayName,
      destinationResolved: destGeo.displayName,
      originCoords:        originGeo,
      destCoords:          destGeo,
    });

  } catch (err) { next(err); }
};

// ─── Nuevo endpoint: geocodificar una dirección (para autocompletado live) ────
const geocodeEndpoint = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 4)
      return res.json({ success: false, message: 'Escribe al menos 4 caracteres.' });

    const result = await geocodeAddress(q);
    if (!result)
      return res.json({ success: false, message: 'Dirección no encontrada en Neiva.' });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ─── RF-08: RUTAS CERCANAS A MI UBICACIÓN ──────────────────────────────────────
const getNearbyRoutes = async (req, res, next) => {
  try {
    const { lat, lng, radius = 800 } = req.query; // Radio por defecto 800m

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Se requiere latitud y longitud.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 1. Buscar paraderos en el radio
    const allStops = await prisma.stop.findMany({
      where: { isActive: true },
    });

    const nearbyStops = allStops
      .map(s => ({
        ...s,
        distance: haversineMeters(latitude, longitude, s.latitude, s.longitude)
      }))
      .filter(s => s.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    if (nearbyStops.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: 'No hay rutas o paraderos cerca de tu ubicación actual (radio 800m).'
      });
    }

    // 2. Obtener los IDs de los paraderos cercanos
    const stopIds = nearbyStops.map(s => s.id);

    // 3. Buscar rutas que pasen por esos paraderos
    const routeStops = await prisma.routeStop.findMany({
      where: { stopId: { in: stopIds } },
      select: { routeId: true, stopId: true }
    });

    const routeIds = [...new Set(routeStops.map(rs => rs.routeId))];

    // 4. Obtener detalle de las rutas
    const routes = await prisma.route.findMany({
      where: { id: { in: routeIds }, isActive: true },
      select: {
        id: true, lineNumber: true, name: true,
        color: true, serviceType: true, fare: true,
        frequency: true
      }
    });

    // 5. Enriquecer con la información del paradero más cercano para esa ruta
    const result = routes.map(r => {
      // Encontrar qué paraderos de esta ruta están cerca
      const stopsOfThisRoute = routeStops.filter(rs => rs.routeId === r.id).map(rs => rs.stopId);
      const closestStop = nearbyStops.find(ns => stopsOfThisRoute.includes(ns.id));

      return {
        ...r,
        closestStop: {
          name: closestStop.name,
          distance: Math.round(closestStop.distance),
          address: closestStop.address
        }
      };
    });

    res.json({
      success: true,
      count: result.length,
      data: result.sort((a, b) => a.closestStop.distance - b.closestStop.distance)
    });

  } catch (err) { next(err); }
};

module.exports = { getAllRoutes, getRouteById, searchRoutes, filterRoutes, geocodeEndpoint, getNearbyRoutes };
