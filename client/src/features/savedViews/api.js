import { api } from '@/lib/apiClient';

export const savedViewsApi = {
  list: (brandId) => api.get(`/brands/${brandId}/views`),
  create: (brandId, data) => api.post(`/brands/${brandId}/views`, data),
  remove: (id) => api.del(`/views/${id}`),
};
