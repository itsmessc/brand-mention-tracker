import { api } from '@/lib/apiClient';

export const dashboardApi = {
  get: (brandId) => api.get(`/brands/${brandId}/dashboard`),
};
