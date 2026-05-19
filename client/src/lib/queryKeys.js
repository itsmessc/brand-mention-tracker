export const queryKeys = {
  brands: () => ['brands'],
  brand: (id) => ['brands', id],
  dashboard: (brandId) => ['brands', brandId, 'dashboard'],
  mentions: (brandId, filters) => ['brands', brandId, 'mentions', filters],
  savedViews: (brandId) => ['brands', brandId, 'views'],
};
