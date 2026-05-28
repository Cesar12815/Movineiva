// src/index.js
// 🚀 NEIVA PRO - SISTEMA GLOBAL V2.9.6 (Certified Build)
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

// Validar DATABASE_URL de raíz
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL no está definida en las variables de entorno');
} else {
  console.log('✅ DATABASE_URL detectada (formato correcto)');
}

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
  logger.info(`🔌 Nuevo dispositivo conectado (NeivaPro): ${socket.id}`);

  // Unirse a una sala específica (ej: rastreo de un domicilio)
  socket.on('join-tracking', (deliveryId) => {
    socket.join(`tracking-${deliveryId}`);
    logger.info(`📍 Dispositivo siguiendo a: ${deliveryId}`);
  });

  // Recibir ubicación y retransmitir (Inteligencia Colectiva)
  socket.on('update-location', (data) => {
    // data: { deliveryId, latitude, longitude }
    const { deliveryId, latitude, longitude } = data;
    io.to(`tracking-${deliveryId}`).emit('location-updated', {
      latitude,
      longitude,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    logger.info(`❌ Dispositivo desconectado de NeivaPro: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`💎 NeivaPro Backend corriendo en http://0.0.0.0:${PORT}`);
  logger.info(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);

  // RF-10: Iniciar scheduler de notificaciones
  startNotificationScheduler();
  logger.info('🔔 Scheduler de notificaciones iniciado');
});
