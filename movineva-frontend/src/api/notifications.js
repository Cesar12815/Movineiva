// RF-10
import { apiClient } from './client'

export const notificationsApi = {
  /** Listar notificaciones activas del dispositivo */
  getAll: () =>
    apiClient.get('/notifications'),

  /** RF-10 — Crear alerta de salida */
  create: ({ routeId, fcmToken, scheduledAt, daysOfWeek }) =>
    apiClient.post('/notifications', { routeId, fcmToken, scheduledAt, daysOfWeek }),

  /** Desactivar / eliminar notificación */
  remove: (id) =>
    apiClient.delete(`/notifications/${id}`),
}
