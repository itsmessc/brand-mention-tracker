import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

const FILTER_KEYS = ['source', 'sentiment', 'tag', 'from', 'to', 'q'];

export function useMentionFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const out = {};
    for (const k of FILTER_KEYS) {
      const v = params.get(k);
      if (v !== null && v !== '') out[k] = v;
    }
    return out;
  }, [params]);

  const setFilters = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (!FILTER_KEYS.includes(k)) continue;
            if (v === undefined || v === null || v === '') next.delete(k);
            else next.set(k, String(v));
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
      for (const k of FILTER_KEYS) {
        if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== '') {
          next.set(k, String(obj[k]));
        }
      }
      setParams(next, { replace: true });
    },
    [setParams]
  );

  return { filters, setFilters, applyFilterObject };
}
