// 🌐 CONFIGURACIÓN GLOBAL - MOVI NEIVA v2.8.0 (HUMANIZED)
// -------------------------------------------------------------------------

const GLOBAL_RENDER_URL = 'https://movineiva-global.onrender.com';

const getApiBase = () => {
  const hostname = window.location.hostname;
  const isAndroid = /Android/i.test(navigator.userAgent);

  // 1. En PRODUCCIÓN (Render)
  if (hostname.includes('onrender.com')) {
    return '/api/v1';
  }

  // 2. En ANDROID / APK / LOCALHOST
  // Apuntamos siempre a la nube para que no dependa de tu PC
  return `${GLOBAL_RENDER_URL}/api/v1`;
};

export const API_BASE = getApiBase();
export const BASE_URL = GLOBAL_RENDER_URL;

console.log('🚀 [SYSTEM] Conectado a:', API_BASE);

export const DEVICE_ID = (() => {
  let id = localStorage.getItem('movineva_device_id');
  if (!id) {
    id = 'user-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('movineva_device_id', id);
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
  active: 'Activo',
  resolved: 'Resuelto',
  expired: 'Expirado'
};

export const REPORT_STATUS_COLORS = {
  active: '#22c55e',
  resolved: '#6b7280',
  expired: '#ef4444'
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
