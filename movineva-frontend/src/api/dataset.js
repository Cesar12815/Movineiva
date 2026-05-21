// RF-06, RB-02
import { apiClient } from './client'

export const datasetApi = {
  /** RF-06 / RB-02 — Versión activa del dataset */
  getVersion: () =>
    apiClient.get('/dataset/version'),

  /** RF-06 — Descarga completa: rutas + paraderos + relaciones + tarifas */
  download: () =>
    apiClient.get('/dataset/download'),
}
