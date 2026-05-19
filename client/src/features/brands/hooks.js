import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from './api';
import { queryKeys } from '@/lib/queryKeys';

export function useBrands() {
  return useQuery({ queryKey: queryKeys.brands(), queryFn: brandsApi.list });
}

export function useBrand(id) {
  return useQuery({
    queryKey: queryKeys.brand(id),
    queryFn: () => brandsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: brandsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.brands() }),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => brandsApi.update(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.brands() });
      qc.invalidateQueries({ queryKey: queryKeys.brand(id) });
    },
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: brandsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.brands() }),
  });
}
