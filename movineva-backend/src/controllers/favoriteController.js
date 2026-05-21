// src/controllers/favoriteController.js
// RF-05: Guardar sitios favoritos para domiciliarios | RB-03: Máximo 20 favoritos por usuario

const prisma = require('../config/database');

const MAX_FAVORITES = 20; // RB-03

/**
 * GET /api/v1/favorites
 * Headers: X-Device-ID
 * Retorna los sitios favoritos del domiciliario.
 */
const getFavorites = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Se requiere el header X-Device-ID.' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { deviceId, siteId: { not: null } },
      include: {
        site: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: favorites.length,
      remaining: MAX_FAVORITES - favorites.length,
      data: favorites.map((f) => f.site),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/favorites
 * Headers: X-Device-ID
 * Body: { siteId }
 * Guarda un sitio de entrega como favorito.
 * RB-03: Máximo 20 favoritos.
 */
const addFavorite = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const { siteId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Se requiere el header X-Device-ID.' });
    }

    if (!siteId) {
      return res.status(400).json({ success: false, message: 'Se requiere el campo siteId.' });
    }

    // Verificar que el sitio existe
    const site = await prisma.customerSite.findUnique({ where: { id: siteId } });
    if (!site) {
      return res.status(404).json({ success: false, message: 'Sitio de entrega no encontrado.' });
    }

    // RB-03: Verificar límite de 20 favoritos
    const count = await prisma.favorite.count({ where: { deviceId, siteId: { not: null } } });
    if (count >= MAX_FAVORITES) {
      return res.status(422).json({
        success: false,
        message: 'Has alcanzado el límite de favoritos. Elimina un sitio para agregar otro.',
        code: 'FAVORITES_LIMIT_REACHED',
      });
    }

    // Crear el favorito
    const favorite = await prisma.favorite.create({
      data: { deviceId, siteId },
      include: { site: true },
    });

    res.status(201).json({
      success: true,
      message: 'Sitio guardado en favoritos.',
      data: favorite.site,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Este sitio ya está en tus favoritos.' });
    }
    next(err);
  }
};

/**
 * DELETE /api/v1/favorites/:siteId
 * Headers: X-Device-ID
 */
const removeFavorite = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const { siteId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Se requiere el header X-Device-ID.' });
    }

    const deleted = await prisma.favorite.deleteMany({
      where: { deviceId, siteId },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ success: false, message: 'Favorito no encontrado.' });
    }

    res.json({ success: true, message: 'Sitio eliminado de favoritos.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };

module.exports = { getFavorites, addFavorite, removeFavorite };
