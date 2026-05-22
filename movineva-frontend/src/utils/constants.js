// 🌐 CONFIGURACIÓN DE CONEXIÓN GLOBAL (MONOLITO)
// -------------------------------------------------------------------------

// URL DE TU SERVIDOR GLOBAL EN RENDER
const GLOBAL_RENDER_URL = 'https://movineiva-global.onrender.com';

const getApiBase = () => {
  const hostname = window.location.hostname;

  // 1. Si estamos en PRODUCCIÓN (Navegador en Render)
  // Usamos ruta relativa para que el mismo servidor responda
  if (hostname.includes('onrender.com')) {
    return '/api/v1';
  }

  // 2. PARA TODO LO DEMÁS (Localhost, Android, APK)
  // Apuntamos directamente a Render para que no dependa de tu PC local
  return `${GLOBAL_RENDER_URL}/api/v1`;
};

export const API_BASE = getApiBase();

// La BASE_URL debe ser siempre la de Render si estamos en producción o modo global
export const BASE_URL = window.location.hostname.includes('onrender.com')
  ? GLOBAL_RENDER_URL
  : GLOBAL_RENDER_URL;

console.log('🚀 [SYSTEM] Modo Global Activo. Conectado a:', GLOBAL_RENDER_URL);

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
