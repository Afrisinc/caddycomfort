import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

export const ALL = 'all';

const SEARCH_KEY = 'q';

export function useUrlFilters({ keep = [] }: { readonly keep?: readonly string[] } = {}) {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get(SEARCH_KEY) ?? '');
  const debouncedSearch = useDebounce(search.trim(), 350);

  const setFilter = useCallback(
    (key: string, value: string) => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        if (!value || value === ALL) next.delete(key);
        else next.set(key, value);
        if (key !== 'page') next.delete('page');
        return next;
      });
    },
    [setParams],
  );

  useEffect(() => {
    if (debouncedSearch !== (params.get(SEARCH_KEY) ?? '')) setFilter(SEARCH_KEY, debouncedSearch);
  }, [debouncedSearch, params, setFilter]);

  const setPage = useCallback(
    (page: number) => {
      setFilter('page', page > 1 ? String(page) : '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setFilter],
  );

  const keepKey = keep.join(',');
  const clearFilters = useCallback(() => {
    setSearch('');
    setParams((current) => {
      const next = new URLSearchParams();
      for (const key of keepKey ? keepKey.split(',') : []) {
        const value = current.get(key);
        if (value) next.set(key, value);
      }
      return next;
    });
  }, [setParams, keepKey]);

  return {
    params,
    get: (key: string) => params.get(key) ?? ALL,
    query: params.get(SEARCH_KEY) ?? '',
    search,
    setSearch,
    setFilter,
    page: Math.max(1, Number(params.get('page')) || 1),
    setPage,
    clearFilters,
    hasFilters: [...params.keys()].some((key) => key !== 'page' && !keep.includes(key)) || !!search,
  };
}
