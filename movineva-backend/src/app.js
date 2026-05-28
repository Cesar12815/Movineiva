// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Rutas
const routeRoutes = require('./routes/routeRoutes');
const stopRoutes = require('./routes/stopRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reportRoutes = require('./routes/reportRoutes');
const fareRoutes = require('./routes/fareRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const adminRoutes = require('./routes/adminRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. LOG INICIAL (Para ver qué llega desde el celular en Render)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[RECV] ${req.method} ${req.path} - Type: ${req.headers['content-type']}`);
  }
  next();
});

// 2. CONFIGURACIÓN DE SEGURIDAD (CORS MAESTRO)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Session-ID'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Servir archivos estáticos (fotos de clientes)
app.use('/uploads', express.static('uploads'));

// Rate limiting global desactivado temporalmente para pruebas en emulador
// const globalLimiter = rateLimit({ ... });
// app.use('/api/', globalLimiter);

// ─── MIDDLEWARES GENERALES ────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ─── HEALTH CHECK (Diagnóstico) ────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NeivaPro-Backend', timestamp: new Date() });
});

app.get('/api/v1/health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', version: '2.8.5' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

// ─── RUTAS DE LA API ─────────────────────────────────────────────────────────
const API = '/api/v1';

// Prioridad Máxima: Auth y Users
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);

// Resto de rutas
app.use(`${API}/routes`, routeRoutes);
app.use(`${API}/stops`, stopRoutes);
app.use(`${API}/favorites`, favoriteRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/fares`, fareRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/dataset`, datasetRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/delivery`, deliveryRoutes);

// ─── SERVIR FRONTEND (ESTÁTICOS) ─────────────────────────────────────────────
const path = require('path');
const distPath = path.join(__dirname, '../../movineva-frontend/dist');

// Middleware para evitar que el 404 de la API entregue el index.html
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Endpoint no encontrado: ${req.path}` });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── MANEJO DE ERRORES (AL FINAL) ─────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`,
    hint: "Verifica que el endpoint sea /api/v1/auth/register"
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
