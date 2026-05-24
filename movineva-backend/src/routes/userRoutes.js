const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obtener perfil con fallback para usuarios antiguos
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatarUrl: true, config: true, secretPin: true }
    });

    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // Si es un usuario antiguo sin PIN o Config, los generamos en el momento
    if (!user.secretPin || !user.config) {
      user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          secretPin: user.secretPin || Math.floor(1000 + Math.random() * 9000).toString(),
          config: user.config || { themeColor: '#2563eb', voiceVolume: 0.8, alertVolume: 1.0 }
        }
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error Profile:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
});

// Actualizar configuración
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { config, avatarUrl, name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        config: config || undefined,
        avatarUrl: avatarUrl || undefined,
        name: name || undefined
      }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error Update Config:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
  }
});

// Obtener mensajes con autogeneración de bienvenida
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    let messages = await prisma.internalMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Si no tiene mensajes, le creamos el de bienvenida para evitar error de carga
    if (messages.length === 0) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const welcomeMsg = await prisma.internalMessage.create({
        data: {
          userId: req.user.id,
          title: '🎁 Bienvenida Pro',
          content: `¡Hola ${user.name}! Tu clave secreta es: ${user.secretPin || '1234'}. Úsala para personalizar tu experiencia.`,
          type: 'SYSTEM'
        }
      });
      messages = [welcomeMsg];
    }

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error Messages:', error);
    res.status(500).json({ success: false, message: 'Error al obtener mensajes' });
  }
});

module.exports = router;
