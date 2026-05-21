// RF-01, RF-02, RF-04, RF-07
import { apiClient } from './client'

export const routesApi = {
  /** RF-01 — Todas las rutas activas con polilínea */
  getAll: () =>
    apiClient.get('/routes'),

  /** RF-04 — Detalle completo de una ruta (paradas, tarifa, frecuencia) */
  getById: (id) =>
    apiClient.get(`/routes/${id}`),

  /** RF-02 — Buscar ruta por origen-destino (RB-04: ambos campos requeridos) */
  search: (origin, destination) =>
    apiClient.get(`/routes/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`),

  /** RF-07 — Filtrar rutas por nombre o número de línea */
  filter: (q) =>
    apiClient.get(`/routes/filter?q=${encodeURIComponent(q)}`),

  /** RF-08 — Buscar rutas cerca de una ubicación (GPS) */
  getNearby: (lat, lng, radius = 800) =>
    apiClient.get(`/routes/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
}
