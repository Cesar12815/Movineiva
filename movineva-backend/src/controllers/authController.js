// 🚀 SISTEMA DE AUTENTICACIÓN GLOBAL v1.2.0
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'MiClaveMaestra2024';

// Función para generar tokens
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role || 'USER' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// --- REGISTRO ---
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Este correo ya tiene cuenta. ¡Inicia sesión!' });
    }

    // Generar PIN secreto de 4 dígitos (ej: 4821)
    const secretPin = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        secretPin: secretPin,
        config: { voiceVolume: 0.8, alertVolume: 1.0, themeColor: '#2563eb' }
      }
    });

    // Crear el primer "SMS" interno de bienvenida con el PIN
    await prisma.internalMessage.create({
      data: {
        userId: user.id,
        title: '🔒 Tu Clave Secreta',
        content: `¡Hola ${user.name}! Bienvenido a la comunidad MoviNeiva Pro. Tu clave secreta para acceder a la configuración avanzada es: ${secretPin}. ¡Éxitos en tus rutas!`,
        type: 'SYSTEM'
      }
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, secretPin: user.secretPin }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en el servidor al registrar' });
  }
};

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Ingresa correo y clave' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'El correo no está registrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = generateToken(user);

    // Asegurar que usuarios antiguos tengan config y PIN sin romper el login
    const userConfig = user.config || { themeColor: '#2563eb', voiceVolume: 0.8, alertVolume: 1.0 };
    const userPin = user.secretPin || Math.floor(1000 + Math.random() * 9000).toString();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        config: userConfig,
        secretPin: userPin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener sesión' });
  }
};
