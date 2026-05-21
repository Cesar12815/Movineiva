// src/routes/stopRoutes.js
const express = require('express');
const router = express.Router();
const { getNearbyStops, getAllStops } = require('../controllers/stopController');

// RF-03: Paraderos cercanos por GPS (RB-01: requiere permiso GPS)
router.get('/nearby', getNearbyStops);

// RF-06: Todos los paraderos para dataset offline
router.get('/', getAllStops);

module.exports = router;
