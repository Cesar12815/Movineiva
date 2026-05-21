// src/routes/fareRoutes.js
const express = require('express');
const router = express.Router();
const { getFares } = require('../controllers/fareController');

router.get('/', getFares); // RF-08: Tabla de tarifas vigentes

module.exports = router;
