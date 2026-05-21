const axios = require('axios');
const logger = require('../utils/logger');

// Caché en memoria para no repetir llamadas a la misma dirección
const geocodeCache = new Map();

/**
 * Normaliza una dirección colombiana para maximizar el match en Nominatim.
 */
function normalizeAddress(raw) {
  let addr = raw.trim();

  // Abreviaciones comunes → forma larga
  addr = addr
    .replace(/\bCra\.?\s*/gi,  'Carrera ')
    .replace(/\bCr\.?\s*/gi,   'Carrera ')
    .replace(/\bCll\.?\s*/gi,  'Calle ')
    .replace(/\bCl\.?\s*/gi,   'Calle ')
    .replace(/\bAv\.?\s*/gi,   'Avenida ')
    .replace(/\bDiag\.?\s*/gi, 'Diagonal ')
    .replace(/\bTrans\.?\s*/gi,'Transversal ')
    .replace(/\bMz\.?\s*/gi,   'Manzana ')
    .replace(/#\s*/g, ' ')
    .replace(/\bcon\b/gi, '&');

  if (!/neiva|huila/i.test(addr)) {
    addr += ', Neiva, Huila, Colombia';
  } else if (!/colombia/i.test(addr)) {
    addr += ', Colombia';
  }

  return addr;
}

/**
 * Llama a Nominatim para geocodificar una dirección.
 */
async function geocodeAddress(rawAddress) {
  const normalized = normalizeAddress(rawAddress);

  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized);
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: normalized,
        format: 'json',
        limit: 1,
        countrycodes: 'co',
        viewbox: '-75.34,2.86,-75.22,2.97',
        bounded: 1
      },
      headers: {
        'User-Agent': 'MoviNeiva/2.0 (app de transporte Neiva; contacto@movineva.co)'
      },
      timeout: 8000
    });

    const results = response.data;

    if (!results || results.length === 0) {
      // Intento laxo sin el bounding box de Neiva
      const res2 = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: normalized, format: 'json', limit: 1, countrycodes: 'co' },
        headers: { 'User-Agent': 'MoviNeiva/2.0' },
        timeout: 8000
      });

      const results2 = res2.data;
      if (!results2 || results2.length === 0) {
        geocodeCache.set(normalized, null);
        return null;
      }
      const r = results2[0];
      const result = { lat: parseFloat(r.lat), lng: parseFloat(r.lon), displayName: r.display_name };
      geocodeCache.set(normalized, result);
      return result;
    }

    const best = results[0];
    const result = {
      lat: parseFloat(best.lat),
      lng: parseFloat(best.lon),
      displayName: best.display_name,
    };

    geocodeCache.set(normalized, result);
    logger.info(`Geocode ✓ "${rawAddress}" → ${result.lat}, ${result.lng}`);
    return result;

  } catch (err) {
    logger.error(`Geocode error para "${rawAddress}": ${err.message}`);
    return null;
  }
}

/**
 * Calcula distancia Haversine en metros entre dos puntos.
 */
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { geocodeAddress, haversineMeters, normalizeAddress };
