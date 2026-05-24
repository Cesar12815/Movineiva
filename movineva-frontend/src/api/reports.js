// RF-09, RB-05
import { apiClient } from './client'

export const reportsApi = {
  /** Crear reporte de zona caliente (Tráfico, Retén, Peligro) */
  create: ({ latitude, longitude, type, description, userName }) =>
    apiClient.post('/reports', {
      latitude,
      longitude,
      type,
      description,
      userName,
    }),

  /** Obtener reportes activos en un área */
  getNearby: (lat, lng, radius = 2000) =>
    apiClient.get(`/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  /** Consultar estado de un reporte propio */
  getStatus: (id) =>
    apiClient.get(`/reports/${id}`),
}
