const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obtener perfil y configuración
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatarUrl: true, config: true, secretPin: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
});

// Actualizar configuración (colores, volúmenes)
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { config, avatarUrl, name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { config, avatarUrl, name }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
  }
});

// Obtener mensajes internos (tipo SMS)
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.internalMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener mensajes' });
  }
});

module.exports = router;
