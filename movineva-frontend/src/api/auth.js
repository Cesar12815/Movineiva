import { apiClient } from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    // ✅ Corregido: apiClient ya devuelve el JSON, no hay que pedir .data
    return res;
  },
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res;
  }
};
