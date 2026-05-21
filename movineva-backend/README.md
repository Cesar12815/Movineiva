# 🚌 MoviNeiva Backend — v2.0

API REST para MoviNeiva, la app de transporte urbano de **Neiva, Huila**.

## Novedades v2.0

- 📍 **30+ paraderos reales** de Neiva (Centro, Norte, Sur, Oriente)
- 🚌 **8 rutas** con polilíneas precisas (01, 03, 05A, 07, 08, 12, 15N, 22)
- 🔍 **Búsqueda mejorada** — encuentra rutas por barrio, paradero o zona
- 🔥 **Firebase listo** — guía paso a paso en `FIREBASE_SETUP.md`

---

## Instalación rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Editar .env con tu DATABASE_URL y credenciales Firebase

# 3. Crear base de datos PostgreSQL
psql -U postgres -c "CREATE USER movineva_user WITH PASSWORD 'movineva2026';"
psql -U postgres -c "CREATE DATABASE movineva_db OWNER movineva_user;"

# 4. Migrar schema
npx prisma migrate dev --name initial

# 5. Sembrar datos reales de Neiva (30 paraderos, 8 rutas)
npm run seed

# 6. Iniciar
npm run dev
```

Servidor → http://localhost:3000

---

## Endpoints principales

| Ruta | Descripción |
|------|-------------|
| `GET /api/v1/routes` | Todas las rutas activas |
| `GET /api/v1/routes/search?origin=X&destination=Y` | **Buscar ruta** |
| `GET /api/v1/routes/:id` | Detalle de ruta |
| `GET /api/v1/stops` | Todos los paraderos |
| `GET /api/v1/stops/nearby?lat=X&lng=Y&radius=500` | Cercanos por GPS |
| `GET /api/v1/fares` | Tarifas vigentes |

## Búsqueda — ejemplos

```
GET /api/v1/routes/search?origin=Terminal&destination=Surcolombiana
GET /api/v1/routes/search?origin=Centro&destination=Norte
GET /api/v1/routes/search?origin=Parque+Santander&destination=Comuneros
```

## Firebase

Ver → [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)

## Scripts

```bash
npm run dev          # Desarrollo
npm start            # Producción
npm run seed         # Datos de Neiva
npx prisma studio    # GUI BD
```
