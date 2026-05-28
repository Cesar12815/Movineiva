import { API_BASE, DEVICE_ID, SESSION_ID } from '../utils/constants'

async function request(path, options = {}) {
  // 1. Construcción de URL segura (Evita el bug del doble slash y no rompe el https://)
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const subPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${subPath}`;

  console.log('📡 [NEIVAPRO_API_CALL]:', url);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'X-Device-ID':  DEVICE_ID,
    'X-Session-ID': SESSION_ID,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      mode: 'cors'
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('❌ [SERVER_ERROR]:', data);
      const errorMsg = data.message || data.error || `Error ${res.status}`;
      // Esto te dirá en el celular: "[POST] 404 -> https://..."
      // Así sabrás exactamente a dónde está disparando la app.
      throw new Error(`[${options.method || 'GET'}] ${res.status} -> ${url}`);
    }

    return data;
  } catch (err) {
    console.error('🚨 [NETWORK_ERROR]:', err);
    // Este mensaje ayudará al usuario a saber si es un problema de IP
    if (err.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que estés en la misma red WiFi y la IP sea correcta.');
    }
    throw err;
  }
}

export const apiClient = {
  get:    (path, headers = {})       => request(path, { method: 'GET', headers }),
  post:   (path, body, headers = {}) => request(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers
  }),
  put:    (path, body, headers = {}) => request(path, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (path, headers = {})       => request(path, { method: 'DELETE', headers }),
}

export const adminClient = {
  post: (path, body, apiKey) => apiClient.post(path, body, { 'X-Admin-Api-Key': apiKey }),
}
