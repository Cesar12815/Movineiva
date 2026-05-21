// src/routes/datasetRoutes.js
const express = require('express');
const router = express.Router();
const { getDatasetVersion, downloadDataset } = require('../controllers/datasetController');

// RF-06 + RB-02: Versión actual del dataset
router.get('/version', getDatasetVersion);

// RF-06: Descarga completa del dataset para modo offline
router.get('/download', downloadDataset);

module.exports = router;
