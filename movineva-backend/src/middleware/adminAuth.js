// src/middleware/adminAuth.js
// AC-02: Autenticación simple por API Key para el Administrador de datos

const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-admin-api-key'] || req.headers.authorization?.replace('Bearer ', '');

  if (!apiKey || apiKey !== process.env.API_KEY_ADMIN) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Se requiere API Key de administrador.',
    });
  }

  next();
};

module.exports = { adminAuth };
