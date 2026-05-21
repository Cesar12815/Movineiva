// src/api/stops.js
import { apiClient } from './client'

export const stopsApi = {
  /** RF-03 — Paraderos cercanos (RB-01: requiere lat/lng) */
  getNearby: (lat, lng, radius = 500) =>
    apiClient.get(`/stops/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  /** RF-06 — Todos los paraderos para dataset offline y autocompletado */
  getAll: () =>
    apiClient.get('/stops'),
}
