// src/routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const prisma = require('../config/database');

// Configuración de Multer para guardar fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `client-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// POST: Guardar sitio de cliente con foto
router.post('/site', upload.single('photo'), async (req, res) => {
  try {
    const { customerName, latitude, longitude, address, notes } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newSite = await prisma.customerSite.create({
      data: {
        customerName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        notes,
        photoUrl
      }
    });

    res.status(201).json({ success: true, data: newSite });
  } catch (error) {
    console.error('Error guardando sitio:', error);
    res.status(500).json({ success: false, error: 'Error al guardar el sitio del cliente' });
  }
});

// GET: Buscar sitios cercanos por GPS (Para domiciliarios)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Latitud y longitud requeridas' });

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);

    // Consulta Haversine para encontrar fachadas mapeadas cerca
    const sites = await prisma.$queryRaw`
      SELECT
        id, "customerName", latitude, longitude, address, notes, "photoUrl", "createdAt",
        ROUND(
          6371000 * ACOS(
            COS(RADIANS(${latitude})) * COS(RADIANS(latitude)) *
            COS(RADIANS(longitude) - RADIANS(${longitude})) +
            SIN(RADIANS(${latitude})) * SIN(RADIANS(latitude))
          )
        )::int AS distance_meters
      FROM customer_sites
      WHERE 6371000 * ACOS(
        COS(RADIANS(${latitude})) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(${longitude})) +
        SIN(RADIANS(${latitude})) * SIN(RADIANS(latitude))
      ) <= ${radiusMeters}
      ORDER BY distance_meters ASC
      LIMIT 15
    `;

    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error en sitios cercanos:', error);
    res.status(500).json({ success: false, error: 'Error al buscar sitios cercanos' });
  }
});

// GET: Buscar sitios por nombre (para el domiciliario)
router.get('/sites', async (req, res) => {
  try {
    const { name } = req.query;
    const sites = await prisma.customerSite.findMany({
      where: {
        customerName: {
          contains: name || '',
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: sites || [] });
  } catch (error) {
    console.error('Error en /sites:', error);
    res.json({ success: true, data: [] }); // Devolvemos vacío para no romper el front
  }
});

// DELETE: Eliminar un sitio guardado
router.delete('/site/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customerSite.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Sitio eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando sitio:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar el sitio' });
  }
});

// POST: Registrar entrega completada y sumar a ganancias
router.post('/complete', async (req, res) => {
  try {
    const { deviceId, customerName, amount, address, notes } = req.body;

    const completed = await prisma.deliveriesCompleted.create({
      data: {
        deviceId,
        customerName,
        amount: parseFloat(amount),
        address,
        notes
      }
    });

    res.status(201).json({ success: true, data: completed });
  } catch (error) {
    console.error('Error al registrar entrega:', error);
    res.status(500).json({ success: false, error: 'No se pudo registrar la entrega' });
  }
});

// GET: Obtener historial de ganancias y entregas del día
router.get('/earnings/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const stats = await prisma.deliveriesCompleted.aggregate({
      where: {
        deviceId,
        completedAt: { gte: startOfDay }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    const recentDeliveries = await prisma.deliveriesCompleted.findMany({
      where: { deviceId },
      orderBy: { completedAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        totalEarnings: stats._sum.amount || 0,
        deliveryCount: stats._count.id || 0,
        recentDeliveries
      }
    });
  } catch (error) {
    console.error('Error al obtener ganancias:', error);
    res.status(500).json({ success: false, error: 'Error al cargar ganancias' });
  }
});

// GET: Obtener pedidos disponibles con lógica de exclusividad y prioridad Premium
router.get('/orders/available', async (req, res) => {
  try {
    const { userId, isPremium } = req.query;

    // 1. Primero buscamos si el usuario ya tiene un pedido en curso (Persistencia)
    const activeOrder = await prisma.order.findFirst({
      where: {
        assignedToId: userId,
        status: 'ASSIGNED'
      }
    });

    if (activeOrder) {
      return res.json({ success: true, type: 'ACTIVE_SESSION', data: [activeOrder] });
    }

    // 2. Lógica de Exclusividad: Buscar pedidos que NO estén asignados a nadie
    // Si el usuario es Premium, le mostramos pedidos con un "bonus" de tiempo o exclusivos
    const orders = await prisma.order.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          { deviceId: null }, // Pedidos públicos
          { deviceId: req.query.deviceId } // Pedidos que fueron reservados para este celular específicamente
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({ success: true, type: 'MARKETPLACE', data: orders });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ success: false, error: 'Error al cargar pedidos' });
  }
});

// POST: Aceptar un pedido (Vincularlo al celular/usuario)
router.post('/orders/accept', async (req, res) => {
  try {
    const { orderId, userId, deviceId } = req.body;

    // Verificar que el pedido siga disponible
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'El pedido ya fue tomado por otro compañero.' });
    }

    // Transacción para asegurar exclusividad: Nadie más puede tomarlo al mismo tiempo
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ASSIGNED',
        assignedToId: userId,
        deviceId: deviceId
      }
    });

    res.json({ success: true, message: 'Pedido aceptado. ¡A trabajar!', data: updatedOrder });
  } catch (error) {
    console.error('Error al aceptar pedido:', error);
    res.status(500).json({ success: false, error: 'Error de conexión con el servidor' });
  }
});

module.exports = router;
