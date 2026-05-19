import { api } from '@/lib/apiClient';

export const brandsApi = {
  list: () => api.get('/brands'),
  get: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  remove: (id) => api.del(`/brands/${id}`),
};
