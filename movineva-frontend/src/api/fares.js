// RF-08
import { apiClient } from './client'

export const faresApi = {
  /** RF-08 — Tabla de tarifas vigentes */
  getAll: () =>
    apiClient.get('/fares'),
}
