// src/middleware/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl });

  // Errores de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Registro duplicado.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Registro no encontrado.' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
