// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { createReport, getNearbyReports, getReportStatus } = require('../controllers/reportController');

router.post('/', createReport);
router.get('/nearby', getNearbyReports);
router.get('/:id', getReportStatus);

module.exports = router;
