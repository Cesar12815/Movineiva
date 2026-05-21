// AC-02 — Panel de administración
import { adminClient } from './client'

export const adminApi = {
  // ─── RUTAS ─────────────────────────────────────────────────────────
  createRoute:  (data, key)       => adminClient.post('/admin/routes', data, key),
  updateRoute:  (id, data, key)   => adminClient.put(`/admin/routes/${id}`, data, key),
  deleteRoute:  (id, key)         => adminClient.delete(`/admin/routes/${id}`, key),

  // ─── PARADEROS ─────────────────────────────────────────────────────
  createStop:   (data, key)       => adminClient.post('/admin/stops', data, key),
  updateStop:   (id, data, key)   => adminClient.put(`/admin/stops/${id}`, data, key),
  addStopToRoute: (data, key)     => adminClient.post('/admin/route-stops', data, key),

  // ─── TARIFAS ───────────────────────────────────────────────────────
  upsertFare:   (data, key)       => adminClient.put('/admin/fares', data, key),

  // ─── REPORTES ──────────────────────────────────────────────────────
  getReports:   (params, key)     => adminClient.get(`/admin/reports?${new URLSearchParams(params)}`, key),
  resolveReport:(id, data, key)   => adminClient.patch(`/admin/reports/${id}`, data, key),

  // ─── DATASET ───────────────────────────────────────────────────────
  publishDataset:(data, key)      => adminClient.post('/admin/dataset/publish', data, key),

  // ─── AUTH CHECK (intentar GET /admin/reports) ──────────────────────
  checkAuth:    (key)             => adminClient.get('/admin/reports?limit=1', key),
}
