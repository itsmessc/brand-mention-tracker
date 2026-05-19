import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mentionsApi } from './api';
import { queryKeys } from '@/lib/queryKeys';

export function useMentions(brandId, filters) {
  return useQuery({
    queryKey: queryKeys.mentions(brandId, filters),
    queryFn: () => mentionsApi.list(brandId, filters),
    enabled: !!brandId,
    keepPreviousData: true,
  });
}

function invalidateAll(qc, brandId) {
  qc.invalidateQueries({ queryKey: ['brands', brandId, 'mentions'] });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard(brandId) });
  qc.invalidateQueries({ queryKey: queryKeys.brands() });
}

export function useCreateMention(brandId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => mentionsApi.create(brandId, data),
    onSuccess: () => invalidateAll(qc, brandId),
  });
}

export function useUpdateMention(brandId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => mentionsApi.update(id, data),
    onSuccess: () => invalidateAll(qc, brandId),
  });
}

export function useDeleteMention(brandId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => mentionsApi.remove(id),
    onSuccess: () => invalidateAll(qc, brandId),
  });
}

export function useBulkIngest(brandId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (input.file) return mentionsApi.bulkCsv(brandId, input.file);
      return mentionsApi.bulkJson(brandId, input.items);
    },
    onSuccess: () => invalidateAll(qc, brandId),
  });
}
