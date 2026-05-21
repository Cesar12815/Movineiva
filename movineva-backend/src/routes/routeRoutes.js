// src/routes/routeRoutes.js
const express = require('express');
const router  = express.Router();
const { getAllRoutes, getRouteById, searchRoutes, filterRoutes, geocodeEndpoint, getNearbyRoutes } =
  require('../controllers/routeController');

router.get('/',         getAllRoutes);
router.get('/nearby',   getNearbyRoutes); // Nueva función: por GPS
router.get('/search',   searchRoutes);    // RF-02 — con geocodificación
router.get('/filter',   filterRoutes);    // RF-07
router.get('/geocode',  geocodeEndpoint); // Validar dirección en tiempo real
router.get('/:id',      getRouteById);    // RF-04

module.exports = router;
