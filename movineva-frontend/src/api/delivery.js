import { apiClient } from './client';

export const deliveryApi = {
  saveSite: async (formData) => {
    return apiClient.post('/delivery/site', formData);
  },
  searchSites: async (name = '') => {
    return apiClient.get(`/delivery/sites?name=${name}`);
  },
  getNearbySites: async (lat, lng, radius = 1000) => {
    return apiClient.get(`/delivery/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },
  deleteSite: async (id) => {
    return apiClient.delete(`/delivery/site/${id}`);
  },
  completeDelivery: async (deliveryData) => {
    return apiClient.post('/delivery/complete', deliveryData);
  },
  getEarnings: async (deviceId) => {
    return apiClient.get(`/delivery/earnings/${deviceId}`);
  }
};
