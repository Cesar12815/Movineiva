const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'MiClaveMaestra2024';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, deviceId } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    // REGISTRO CON SOPORTE PARA PREMIUM DEMO Y DEVICE ID
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        deviceId: deviceId || null,
        isPremium: true,      // Activamos Premium por defecto para el Demo
        premiumLevel: 1,     // Nivel 1: Demo Testing
      }
    });

    const secretPin = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { secretPin, config: { themeColor: '#ffd700', voiceVolume: 0.9, alertVolume: 1.0 } }
      });
    } catch (e) {
      console.log("⚠️ Error al actualizar config inicial");
    }

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: true,
        premiumLevel: 1,
        deviceId: user.deviceId,
        secretPin: secretPin
      }
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ success: false, message: 'Error al registrar. El correo o dispositivo ya podrían estar en uso.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan credenciales' });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true, email: true, password: true, name: true, role: true,
        isPremium: true, premiumLevel: true, deviceId: true
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Correo o clave incorrectos' });
    }

    // Si el usuario no tiene deviceId guardado, lo vinculamos en este login
    if (deviceId && !user.deviceId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { deviceId }
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        premiumLevel: user.premiumLevel,
        deviceId: deviceId || user.deviceId
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
};
