// src/routes/adminRoutes.js
// AC-02: Rutas protegidas para el Administrador de datos
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const {
  createRoute, updateRoute, deleteRoute,
  createStop, updateStop,
  addStopToRoute,
  upsertFare,
  getReports, resolveReport,
  publishDatasetVersion,
} = require('../controllers/adminController');

// Aplicar autenticación a todas las rutas de administrador
router.use(adminAuth);

// ─── RUTAS ────────────────────────────────────────────────────────────────────
router.post('/routes', createRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

// ─── PARADEROS ────────────────────────────────────────────────────────────────
router.post('/stops', createStop);
router.put('/stops/:id', updateStop);
router.post('/route-stops', addStopToRoute);

// ─── TARIFAS ─────────────────────────────────────────────────────────────────
router.put('/fares', upsertFare);

// ─── REPORTES ────────────────────────────────────────────────────────────────
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);

// ─── DATASET ─────────────────────────────────────────────────────────────────
router.post('/dataset/publish', publishDatasetVersion);

module.exports = router;
