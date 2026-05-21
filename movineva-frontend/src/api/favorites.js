// RF-05: Sitios favoritos para domiciliarios
import { apiClient } from './client'

export const favoritesApi = {
  /** Listar sitios favoritos */
  getAll: () =>
    apiClient.get('/favorites'),

  /** Agregar sitio a favoritos */
  add: (siteId) =>
    apiClient.post('/favorites', { siteId }),

  /** Eliminar sitio de favoritos */
  remove: (siteId) =>
    apiClient.delete(`/favorites/${siteId}`),
}
