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

// ─── MIDDLEWARES DE SEGURIDAD ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false, // Permitir cargar imágenes desde el frontend
}));

app.use(cors({
  origin: '*', // Permitir todo en desarrollo para el emulador
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Session-ID'],
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
app.get('/health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', version: '1.0.1' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

// ─── RUTAS DE LA API ─────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/routes`, routeRoutes);
app.use(`${API}/stops`, stopRoutes);
app.use(`${API}/favorites`, favoriteRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/fares`, fareRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/dataset`, datasetRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/delivery`, deliveryRoutes);
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);

// ─── SERVIR FRONTEND (ESTÁTICOS) ─────────────────────────────────────────────
const path = require('path');
// Servimos la carpeta dist que generará el build del frontend
app.use(express.static(path.join(__dirname, '../../movineva-frontend/dist')));

// Cualquier ruta que no sea de la API, entrega el index.html del Frontend
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../../movineva-frontend/dist/index.html'));
  }
});

// ─── MANEJO DE ERRORES (AL FINAL) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
