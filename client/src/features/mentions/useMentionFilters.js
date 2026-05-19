import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

const KEYS = ['source', 'sentiment', 'tag', 'from', 'to', 'q', 'page', 'limit'];

export function useMentionFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const out = {};
    for (const k of KEYS) {
      const v = params.get(k);
      if (v !== null && v !== '') out[k] = v;
    }
    out.page = Number(out.page ?? 1);
    out.limit = Number(out.limit ?? 25);
    return out;
  }, [params]);

  const setFilters = useCallback(
    (patch, { resetPage = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === null || v === '') next.delete(k);
            else next.set(k, String(v));
          }
          if (resetPage && Object.keys(patch).some((k) => k !== 'page')) {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const applyFilterObject = useCallback(
    (obj) => {
      const next = new URLSearchParams();
      for (const k of KEYS) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
          next.set(k, String(obj[k]));
        }
      }
      setParams(next, { replace: true });
    },
    [setParams]
  );

  return { filters, setFilters, applyFilterObject };
}
