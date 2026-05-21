const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Carga de Rutas Reales de Neiva...');

  await prisma.routeStop.deleteMany({});
  await prisma.route.deleteMany({});
  await prisma.stop.deleteMany({});

  // --- 1. RED DE PARADEROS ESTRATÉGICOS (MÁS DE 30 PUNTOS) ---
  const sitios = [
    // NORTE
    { name: 'CC San Pedro Plaza', lat: 2.9565, lng: -75.2838, addr: 'Av. 26', zone: 'NORTE' },
    { name: 'Intercambiador El Tizón', lat: 2.9490, lng: -75.2920, addr: 'Av. Pastrana', zone: 'NORTE' },
    { name: 'Aeropuerto Benito Salas', lat: 2.9500, lng: -75.2950, addr: 'Av. 26', zone: 'NORTE' },
    { name: 'USCO (Norte)', lat: 2.9416, lng: -75.2985, addr: 'Av. Pastrana', zone: 'NORTE' },
    { name: 'SENA Industrial', lat: 2.9520, lng: -75.2860, addr: 'Cra 9', zone: 'NORTE' },
    { name: 'Barrio Chicalá', lat: 2.9650, lng: -75.2850, addr: 'Cll 64', zone: 'NORTE' },
    { name: 'Puente El Tizón', lat: 2.9470, lng: -75.3020, addr: 'Cll 21', zone: 'NORTE' },

    // CENTRO
    { name: 'Parque Santander', lat: 2.9333, lng: -75.2872, addr: 'Cll 8', zone: 'CENTRO' },
    { name: 'Hospital Universitario', lat: 2.9370, lng: -75.2910, addr: 'Cra 7', zone: 'CENTRO' },
    { name: 'Alcaldía / Cra 5', lat: 2.9340, lng: -75.2885, addr: 'Cra 5', zone: 'CENTRO' },
    { name: 'Terminal de Transportes', lat: 2.9275, lng: -75.2818, addr: 'Cra 7', zone: 'CENTRO' },
    { name: 'Centro Comercial Los Comuneros', lat: 2.9315, lng: -75.2855, addr: 'Cll 9', zone: 'CENTRO' },
    { name: 'Caja Agraria', lat: 2.9355, lng: -75.2880, addr: 'Cra 7', zone: 'CENTRO' },

    // ORIENTE
    { name: 'CC Santa Lucía Plaza', lat: 2.9360, lng: -75.2660, addr: 'Cll 8', zone: 'ORIENTE' },
    { name: 'Barrio Buganviles', lat: 2.9300, lng: -75.2750, addr: 'Cll 19', zone: 'ORIENTE' },
    { name: 'Ipanema', lat: 2.9250, lng: -75.2600, addr: 'Cll 8 Oriente', zone: 'ORIENTE' },
    { name: 'Las Catleyas', lat: 2.9390, lng: -75.2550, addr: 'Comuna 10', zone: 'ORIENTE' },
    { name: 'Parque de los Niños', lat: 2.9350, lng: -75.2780, addr: 'Cra 15', zone: 'ORIENTE' },

    // SUR
    { name: 'CC Unicentro', lat: 2.9150, lng: -75.2750, addr: 'Cra 15 Sur', zone: 'SUR' },
    { name: 'Canaima', lat: 2.9050, lng: -75.2850, addr: 'Cll 22 Sur', zone: 'SUR' },
    { name: 'Puertas del Sol', lat: 2.8980, lng: -75.2900, addr: 'Cll 30 Sur', zone: 'SUR' },
    { name: 'Limonar', lat: 2.8920, lng: -75.2880, addr: 'Sur Extremo', zone: 'SUR' },
    { name: 'Parque Metropolitano', lat: 2.9020, lng: -75.2780, addr: 'Sur', zone: 'SUR' },
    { name: 'Timanco', lat: 2.9120, lng: -75.2820, addr: 'Cra 15 Sur', zone: 'SUR' },

    // OCCIDENTE
    { name: 'El Triángulo', lat: 2.9380, lng: -75.3050, addr: 'Cll 21', zone: 'OCCIDENTE' },
    { name: 'Barrio Galán', lat: 2.9280, lng: -75.3100, addr: 'Carrera 1', zone: 'OCCIDENTE' },
    { name: 'Cándido Leguízamo', lat: 2.9480, lng: -75.3020, addr: 'Cra 1', zone: 'OCCIDENTE' }
  ];

  const stopsMap = {};
  for (const s of sitios) {
    const created = await prisma.stop.create({
      data: { name: s.name, latitude: s.lat, longitude: s.lng, address: s.addr, zone: s.zone, isActive: true }
    });
    stopsMap[s.name] = created.id;
  }

  // --- 2. RUTAS REALES DETALLADAS ---
  const megaRoutes = [
    {
      num: '06', name: 'Galán - Centro - San Pedro', color: '#dc2626', type: 'CORRIENTE', fare: 2400, freq: 7,
      poly: [ {lat: 2.928, lng: -75.31}, {lat: 2.933, lng: -75.287}, {lat: 2.949, lng: -75.292}, {lat: 2.956, lng: -75.283} ],
      stops: ['Barrio Galán', 'Parque Santander', 'Intercambiador El Tizón', 'CC San Pedro Plaza']
    },
    {
      num: '11', name: 'Sur (Limonar) - Norte (San Pedro)', color: '#16a34a', type: 'CORRIENTE', fare: 2400, freq: 8,
      poly: [ {lat: 2.892, lng: -75.288}, {lat: 2.905, lng: -75.285}, {lat: 2.915, lng: -75.275}, {lat: 2.933, lng: -75.287}, {lat: 2.956, lng: -75.283} ],
      stops: ['Limonar', 'Canaima', 'CC Unicentro', 'Parque Santander', 'CC San Pedro Plaza']
    },
    {
      num: '19', name: 'Oriente (Catleyas) - Terminal - USCO', color: '#2563eb', type: 'EJECUTIVO', fare: 2500, freq: 10,
      poly: [ {lat: 2.939, lng: -75.255}, {lat: 2.936, lng: -75.266}, {lat: 2.927, lng: -75.281}, {lat: 2.941, lng: -75.298} ],
      stops: ['Las Catleyas', 'CC Santa Lucía Plaza', 'Terminal de Transportes', 'USCO (Norte)']
    },
    {
      num: '45', name: 'Circular Sur (Timanco - Unicentro - Centro)', color: '#9333ea', type: 'CORRIENTE', fare: 2400, freq: 12,
      poly: [ {lat: 2.912, lng: -75.282}, {lat: 2.915, lng: -75.275}, {lat: 2.927, lng: -75.281}, {lat: 2.933, lng: -75.287} ],
      stops: ['Timanco', 'CC Unicentro', 'Terminal de Transportes', 'Parque Santander']
    },
    {
      num: '01', name: 'Expreso Norte (SENA - Centro)', color: '#ea580c', type: 'CORRIENTE', fare: 2400, freq: 10,
      poly: [ {lat: 2.972, lng: -75.282}, {lat: 2.952, lng: -75.286}, {lat: 2.933, lng: -75.287} ],
      stops: ['Barrio Chicalá', 'SENA Industrial', 'Parque Santander']
    },
    {
      num: '02', name: 'Oriente Directo (Ipanema - Terminal)', color: '#0891b2', type: 'EJECUTIVO', fare: 2500, freq: 15,
      poly: [ {lat: 2.925, lng: -75.26}, {lat: 2.935, lng: -75.278}, {lat: 2.927, lng: -75.281} ],
      stops: ['Ipanema', 'Parque de los Niños', 'Terminal de Transportes']
    }
  ];

  for (const r of megaRoutes) {
    await prisma.route.create({
      data: {
        lineNumber: r.num,
        name: r.name,
        color: r.color,
        serviceType: r.type,
        fare: r.fare,
        frequency: r.freq,
        isActive: true,
        polyline: r.poly,
        stops: {
          create: r.stops.map((stopName, idx) => ({
            stopId: stopsMap[stopName],
            order: idx + 1,
            isKeyStop: true
          }))
        }
      }
    });
  }

  console.log('✅ Base de datos de Neiva actualizada con rutas reales y paraderos densos.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
