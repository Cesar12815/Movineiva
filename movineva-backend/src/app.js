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

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MoviNeiva Backend', timestamp: new Date().toISOString() });
});

// ─── RUTAS DE LA API ─────────────────────────────────────────────────────────
// Prefijo versión /api/v1
const API = '/api/v1';

app.use(`${API}/routes`, routeRoutes);           // RF-01, RF-02, RF-04, RF-07
app.use(`${API}/stops`, stopRoutes);             // RF-03, RF-04
app.use(`${API}/favorites`, favoriteRoutes);     // RF-05, RB-03
app.use(`${API}/reports`, reportRoutes);         // RF-09, RB-05
app.use(`${API}/fares`, fareRoutes);             // RF-08
app.use(`${API}/notifications`, notificationRoutes); // RF-10
app.use(`${API}/dataset`, datasetRoutes);        // RF-06, RB-02 (offline)
app.use(`${API}/admin`, adminRoutes);            // AC-02 (panel admin)
app.use(`${API}/delivery`, deliveryRoutes);       // Nuevas funciones de domicilios
app.use(`${API}/auth`, authRoutes);               // Autenticación de usuarios

// ─── MANEJO DE ERRORES ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
