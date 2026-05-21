// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { createNotification, deleteNotification, getNotifications } = require('../controllers/notificationController');

router.get('/', getNotifications);          // Listar notificaciones activas
router.post('/', createNotification);        // RF-10: Configurar alerta de salida
router.delete('/:id', deleteNotification);  // Desactivar notificación

module.exports = router;
