import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';
import { queryKeys } from '@/lib/queryKeys';

export function useDashboard(brandId) {
  return useQuery({
    queryKey: queryKeys.dashboard(brandId),
    queryFn: () => dashboardApi.get(brandId),
    enabled: !!brandId,
  });
}
