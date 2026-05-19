import { api, buildUrl } from '@/lib/apiClient';

export const mentionsApi = {
  list: (brandId, filters) => api.get(`/brands/${brandId}/mentions`, filters),
  create: (brandId, data) => api.post(`/brands/${brandId}/mentions`, data),
  update: (id, data) => api.put(`/mentions/${id}`, data),
  remove: (id) => api.del(`/mentions/${id}`),
  bulkJson: (brandId, items) => api.post(`/brands/${brandId}/mentions/bulk`, items),
  bulkCsv: (brandId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.postForm(`/brands/${brandId}/mentions/bulk`, fd);
  },
  exportCsvUrl: (brandId, filters) =>
    buildUrl(`/brands/${brandId}/mentions/export.csv`, filters),
};
