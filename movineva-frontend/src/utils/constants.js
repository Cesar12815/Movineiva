// 🌐 CONFIGURACIÓN DE CONEXIÓN - NEIVA PRO v2.9.5
// -------------------------------------------------------------------------

/**
 * IMPORTANTE:
 * Si tu backend en Render tiene un nombre distinto, cámbialo aquí.
 * Ejemplo: 'https://neiva-pro-api.onrender.com'
 */
const BACKEND_URL = 'https://neivapro-backend.onrender.com';

const getApiBase = () => {
  const hostname = window.location.hostname;

  // Si corremos dentro de Render (Web), usamos rutas relativas
  if (hostname.includes('onrender.com')) {
    return '/api/v1';
  }

  // En el CELULAR (APK) forzamos la URL del servidor
  return `${BACKEND_URL}/api/v1`;
};

export const API_BASE = getApiBase();
export const BASE_URL = BACKEND_URL;

console.log('🚀 [NEIVAPRO] Sistema de Red conectado a:', API_BASE);

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
