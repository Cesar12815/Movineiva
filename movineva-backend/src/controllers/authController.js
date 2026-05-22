const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inicialización de Prisma con manejo de errores de URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('postgresql://', 'postgres://') : undefined
    },
  },
});

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Verificar conexión
    try {
      await prisma.$connect();
    } catch (err) {
      console.error('❌ Error de conexión DB:', err.message);
      return res.status(500).json({
        success: false,
        message: 'El servidor no puede conectar con la base de datos',
        error: err.message
      });
    }

    // 2. Verificar si existe
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    // 3. Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim()
      }
    });

    res.status(201).json({ success: true, message: '¡Registro exitoso! Ya puedes iniciar sesión' });

  } catch (error) {
    console.error('🔴 Error en Registro:', error);
    res.status(500).json({ success: false, message: 'Error interno al registrar', detail: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev_secret_123',
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en login', detail: error.message });
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
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
};
