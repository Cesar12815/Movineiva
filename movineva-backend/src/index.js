// src/index.js
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const { startNotificationScheduler } = require('./services/notificationScheduler');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Crear servidor HTTP para Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir todo en desarrollo
    methods: ['GET', 'POST']
  }
});

// Hacer socket.io accesible desde los controladores
app.set('socketio', io);

// Configuración de Socket.io para tiempo real
io.on('connection', (socket) => {
  logger.info(`🔌 Nuevo dispositivo conectado: ${socket.id}`);

  // Unirse a una sala específica (ej: rastreo de un domicilio)
  socket.on('join-tracking', (deliveryId) => {
    socket.join(`tracking-${deliveryId}`);
    logger.info(`📍 Dispositivo ${socket.id} siguiendo a: ${deliveryId}`);
  });

  // Recibir ubicación del domiciliario y retransmitir
  socket.on('update-location', (data) => {
    // data: { deliveryId, latitude, longitude }
    const { deliveryId, latitude, longitude } = data;
    io.to(`tracking-${deliveryId}`).emit('location-updated', {
      latitude,
      longitude,
      timestamp: new Date()
    });
    // Opcional: Podríamos guardar en DB aquí también si es necesario
  });

  socket.on('disconnect', () => {
    logger.info(`❌ Dispositivo desconectado: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚌 MoviNeiva Backend corriendo en http://0.0.0.0:${PORT}`);
  logger.info(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);

  // RF-10: Iniciar scheduler de notificaciones
  startNotificationScheduler();
  logger.info('🔔 Scheduler de notificaciones iniciado');
});
