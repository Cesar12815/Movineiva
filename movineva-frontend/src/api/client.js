import { API_BASE, DEVICE_ID, SESSION_ID } from '../utils/constants'

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  console.log('📡 [API_CALL]:', url);

  const headers = {
    'Content-Type': 'application/json',
    'X-Device-ID':  DEVICE_ID,
    'X-Session-ID': SESSION_ID,
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
      throw new Error(data.message || data.error || `Error ${res.status}`);
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
