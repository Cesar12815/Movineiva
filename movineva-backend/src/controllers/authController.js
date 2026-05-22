const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Verificación de conexión
    try {
      await prisma.$connect();
    } catch (dbError) {
      return res.status(500).json({ success: false, message: 'No hay conexión con la base de datos', error: dbError.message });
    }

    // 2. ¿Ya existe?
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    // 3. Encriptar
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. CREAR (Aquí es donde falla)
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        role: 'USER'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado!',
      user: { id: newUser.id, email: newUser.email }
    });

  } catch (error) {
    console.error('🔴 [FATAL_ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Error de raíz en el servidor',
      detail: error.message,
      code: error.code // Esto nos dará el código de Prisma (ej: P2002)
    });
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
      process.env.JWT_SECRET || 'dev_secret',
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
