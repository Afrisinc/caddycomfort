import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types/api';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export const MIN_QUERY_LENGTH = 2;

export function useProductSearch(query: string, limit = 6) {
  const debounced = useDebounce(query.trim(), 250);
  const [results, setResults] = useState<Product[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [attempt, setAttempt] = useState(0);
  const latestRequest = useRef(0);

  useEffect(() => {
    if (debounced.length < MIN_QUERY_LENGTH) {
      latestRequest.current++;
      setResults([]);
      setStatus('idle');
      return;
    }

    const requestId = ++latestRequest.current;
    setStatus('loading');
    productsApi
      .search(debounced, limit)
      .then((products) => {
        if (requestId !== latestRequest.current) return;
        setResults(products);
        setStatus('success');
      })
      .catch(() => {
        if (requestId !== latestRequest.current) return;
        setStatus('error');
      });
  }, [debounced, limit, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const isStale = query.trim() !== debounced;

  return { results, status, retry, isPending: status === 'loading' || isStale };
}
