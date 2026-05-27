// 🌐 CONFIGURACIÓN GLOBAL - NEIVA PRO v2.8.5
// -------------------------------------------------------------------------

// IMPORTANTE: Verifica que esta URL sea la que aparece en tu Dashboard de Render
const GLOBAL_RENDER_URL = 'https://neivapro-backend.onrender.com';

const getApiBase = () => {
  const hostname = window.location.hostname;

  // 1. En PRODUCCIÓN (Si el frontend corre en el mismo servidor de Render)
  if (hostname.includes('onrender.com')) {
    return '/api/v1';
  }

  // 2. En ANDROID / APK / LOCALHOST
  // Forzamos la URL completa del backend de producción
  return `${GLOBAL_RENDER_URL}/api/v1`;
};

export const API_BASE = getApiBase();
export const BASE_URL = GLOBAL_RENDER_URL;

console.log('🚀 [SYSTEM] NeivaPro Conectado a:', API_BASE);

export const DEVICE_ID = (() => {
  let id = localStorage.getItem('neivapro_device_id');
  if (!id) {
    id = 'user-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('neivapro_device_id', id);
  }
  return id;
})();

export const SESSION_ID = Math.random().toString(36).substring(2, 10);

export const REPORT_TYPES = [
  { value: 'TRAFFIC', label: 'Trancón' },
  { value: 'POLICE', label: 'Retén' },
  { value: 'DANGER', label: 'Peligro' },
  { value: 'ROAD_BLOCK', label: 'Vía Cerrada' }
];

export const MAX_FAVORITES = 20;

export const REPORT_STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En Revisión',
  RESOLVED: 'Resuelto',
  REJECTED: 'Rechazado'
};

export const REPORT_STATUS_COLORS = {
  PENDING: '#f59e0b',
  IN_REVIEW: '#3b82f6',
  RESOLVED: '#22c55e',
  REJECTED: '#ef4444'
};

export const SERVICE_LABELS = {
  maintenance: 'Mantenimiento',
  cleaning: 'Limpieza',
  inspection: 'Inspección'
};

export const SERVICE_COLORS = {
  maintenance: '#3b82f6',
  cleaning: '#10b981',
  inspection: '#f59e0b'
};
