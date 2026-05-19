import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savedViewsApi } from './api';
import { queryKeys } from '@/lib/queryKeys';

export function useSavedViews(brandId) {
  return useQuery({
    queryKey: queryKeys.savedViews(brandId),
    queryFn: () => savedViewsApi.list(brandId),
    enabled: !!brandId,
  });
}

export function useCreateSavedView(brandId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => savedViewsApi.create(brandId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.savedViews(brandId) }),
  });
}

export function useDeleteSavedView(brandId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => savedViewsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.savedViews(brandId) }),
  });
}
