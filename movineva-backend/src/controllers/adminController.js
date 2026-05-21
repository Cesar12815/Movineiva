// src/controllers/adminController.js
// AC-02: Panel de administración para Administrador de datos
// Actualizar rutas, gestionar tarifas, revisar reportes ciudadanos

const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ─── GESTIÓN DE RUTAS ─────────────────────────────────────────────────────────

const createRoute = async (req, res, next) => {
  try {
    const { lineNumber, name, color, serviceType, fare, nightFare, frequency, polyline } = req.body;

    const route = await prisma.route.create({
      data: { lineNumber, name, color, serviceType, fare, nightFare, frequency, polyline },
    });

    res.status(201).json({ success: true, message: 'Ruta creada.', data: route });
  } catch (err) {
    next(err);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const route = await prisma.route.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
    res.json({ success: true, message: 'Ruta actualizada.', data: route });
  } catch (err) {
    next(err);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Soft delete
    await prisma.route.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'Ruta desactivada.' });
  } catch (err) {
    next(err);
  }
};

// ─── GESTIÓN DE PARADEROS ─────────────────────────────────────────────────────

const createStop = async (req, res, next) => {
  try {
    const { name, latitude, longitude, address, zone } = req.body;
    const stop = await prisma.stop.create({ data: { name, latitude, longitude, address, zone } });
    res.status(201).json({ success: true, data: stop });
  } catch (err) {
    next(err);
  }
};

const updateStop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stop = await prisma.stop.update({ where: { id }, data: { ...req.body, updatedAt: new Date() } });
    res.json({ success: true, data: stop });
  } catch (err) {
    next(err);
  }
};

// ─── ASIGNAR PARADERO A RUTA ─────────────────────────────────────────────────

const addStopToRoute = async (req, res, next) => {
  try {
    const { routeId, stopId, order, isKeyStop } = req.body;
    const rs = await prisma.routeStop.create({ data: { routeId, stopId, order, isKeyStop } });
    res.status(201).json({ success: true, data: rs });
  } catch (err) {
    next(err);
  }
};

// ─── GESTIÓN DE TARIFAS ───────────────────────────────────────────────────────

const upsertFare = async (req, res, next) => {
  try {
    const { serviceType, amount, effectiveAt } = req.body;

    const fare = await prisma.fare.upsert({
      where: { serviceType },
      update: { amount, effectiveAt: new Date(effectiveAt), updatedAt: new Date() },
      create: { serviceType, amount, effectiveAt: new Date(effectiveAt) },
    });

    res.json({ success: true, message: 'Tarifa actualizada.', data: fare });
  } catch (err) {
    next(err);
  }
};

// ─── GESTIÓN DE REPORTES ─────────────────────────────────────────────────────

const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          stop: { select: { name: true, address: true } },
          route: { select: { lineNumber: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        adminNotes,
        resolvedAt: ['RESOLVED', 'REJECTED'].includes(status) ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// ─── VERSIÓN DE DATASET ───────────────────────────────────────────────────────

const publishDatasetVersion = async (req, res, next) => {
  try {
    const { description } = req.body;

    // Desactivar versión anterior
    await prisma.datasetVersion.updateMany({ where: { isActive: true }, data: { isActive: false } });

    // Crear nueva versión
    const now = new Date();
    const version = await prisma.datasetVersion.create({
      data: {
        version: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.v${Date.now()}`,
        description,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, message: 'Nueva versión del dataset publicada.', data: version });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRoute, updateRoute, deleteRoute,
  createStop, updateStop,
  addStopToRoute,
  upsertFare,
  getReports, resolveReport,
  publishDatasetVersion,
};
