// src/controllers/fareController.js
// RF-08: Ver tarifas actualizadas por tipo de servicio (Corriente, Ejecutivo, Nocturno)

const prisma = require('../config/database');

/**
 * GET /api/v1/fares
 * Retorna la tabla de tarifas vigentes diferenciada por tipo de servicio.
 */
const getFares = async (req, res, next) => {
  try {
    const fares = await prisma.fare.findMany({
      orderBy: { serviceType: 'asc' },
    });

    const labels = {
      CORRIENTE: 'Corriente',
      EJECUTIVO: 'Ejecutivo',
      NOCTURNO: 'Nocturno',
    };

    const formatted = fares.map((f) => ({
      id: f.id,
      serviceType: f.serviceType,
      label: labels[f.serviceType] || f.serviceType,
      amount: Number(f.amount),
      effectiveAt: f.effectiveAt,
      updatedAt: f.updatedAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFares };
