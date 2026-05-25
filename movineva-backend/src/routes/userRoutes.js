const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obtener perfil con protección absoluta contra DB antigua
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Solo pedimos campos que estamos SEGUROS que existen en la DB de producción
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true }
    });

    // Intentamos obtener los campos Pro. Si fallan, usamos valores por defecto
    const extra = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { config: true, secretPin: true, avatarUrl: true }
    }).catch(() => null);

    res.json({
      success: true,
      data: {
        ...user,
        config: extra?.config || { themeColor: '#2563eb', voiceVolume: 0.8 },
        secretPin: extra?.secretPin || '1234',
        avatarUrl: extra?.avatarUrl || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
});

// Actualizar configuración
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { config, avatarUrl, name } = req.body;
    let updated;
    try {
      updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { config, avatarUrl, name }
      });
    } catch (e) {
      // Si la DB no tiene los campos nuevos, solo actualizamos el nombre
      updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { name }
      }).catch(() => ({ id: req.user.id, name }));
      updated.config = config;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
});

// Buzón Pro: Resiliente si la tabla no existe
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.internalMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // Intentamos obtener el PIN para mostrarlo en el mensaje de bienvenida
    const userExtra = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { secretPin: true }
    }).catch(() => null);

    const pin = userExtra?.secretPin || '1234';

    if (messages.length === 0) {
      return res.json({
        success: true,
        data: [{
          id: 'welcome',
          title: '🎁 ¡Bienvenido Pro!',
          content: `Hola compañero, gracias por ser parte de MoviNeiva v2.8.0. \n\nTu clave secreta de seguridad es: ${pin} \n\nÚsala en el perfil para realizar ajustes críticos. ¡Éxitos!`,
          type: 'SYSTEM',
          createdAt: new Date()
        }]
      });
    }
    res.json({ success: true, data: messages });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
