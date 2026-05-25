const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'MiClaveMaestra2024';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    // REGISTRO RESILIENTE: Solo usamos campos que existen 100% en la tabla users
    // Si la DB es vieja, no fallará por falta de columnas nuevas
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim()
      }
    });

    // Intentamos guardar el PIN en segundo plano, si la DB no tiene la columna, no pasa nada
    const secretPin = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { secretPin, config: { themeColor: '#2563eb', voiceVolume: 0.8, alertVolume: 1.0 } }
      });
    } catch (e) {
      console.log("⚠️ DB antigua: no se pudo guardar secretPin/config");
    }

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        secretPin: secretPin,
        config: { themeColor: '#2563eb', voiceVolume: 0.8, alertVolume: 1.0 }
      }
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ success: false, message: 'Error interno al registrar. Verifica tu conexión.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan credenciales' });

    // SELECT SEGURO: Solo pedimos campos que existen físicamente en la DB de Render
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, password: true, name: true, role: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Correo o clave incorrectos' });
    }

    // Intentar obtener PIN y Config por separado.
    // Si falla (porque la DB no tiene las columnas), devolvemos valores Pro por defecto.
    let extra = { secretPin: '1234', config: { themeColor: '#2563eb', voiceVolume: 0.8, alertVolume: 1.0 } };
    try {
      const dbExtra = await prisma.user.findUnique({
        where: { id: user.id },
        select: { secretPin: true, config: true }
      });
      if (dbExtra) {
        extra.secretPin = dbExtra.secretPin || extra.secretPin;
        // Mezclamos con defaults para asegurar que campos nuevos existan
        extra.config = { ...extra.config, ...(dbExtra.config || {}) };
      }
    } catch (e) {
      console.log("⚠️ DB antigua: usando configuración Pro por defecto");
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        ...user,
        secretPin: extra.secretPin,
        config: extra.config
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
};
