// 🌐 CONFIGURACIÓN DE CONEXIÓN UNIVERSAL
// -------------------------------------------------------------------------
// 1. Para EMULADOR: Deja '10.0.2.2'
// 2. Para CELULAR REAL / APK: Pon la IP de tu PC (ej: '192.168.1.15')
//    (Obtén tu IP escribiendo 'ipconfig' en la terminal de Windows)
const SERVER_IP = '10.0.2.2';
const MI_IP_PC = '192.168.40.8';

// URL DE TU BACKEND EN RENDER (Cópiala de tu Dashboard de Render)
const RENDER_BACKEND_URL = 'https://movineiva-backend.onrender.com'; // <--- SUSTITUYE POR TU URL REAL

const getApiBase = () => {
  const hostname = window.location.hostname;
  const userAgent = navigator.userAgent || '';
  const isAndroid = /Android/i.test(userAgent);

  // 1. Si estamos en PRODUCCIÓN (Render)
  if (hostname.includes('onrender.com')) {
    return `${RENDER_BACKEND_URL}/api/v1`;
  }

  // 2. Si estamos en Android (Emulador o APK local)
  if (isAndroid) {
    return `http://${MI_IP_PC}:3001/api/v1`;
  }

  // 3. Si estamos en el navegador del PC (Desarrollo Web)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api/v1';
  }

  return `http://${hostname}:3001/api/v1`;
};

export const API_BASE = getApiBase();
export const BASE_URL = API_BASE.replace('/api/v1', '');

console.log('🚀 [SYSTEM] Conectado a API:', API_BASE);

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
