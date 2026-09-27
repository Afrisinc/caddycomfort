import { useEffect, useRef, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, fallback: T) {
  const fallbackRef = useRef(fallback);
  const [state, setState] = useState({ data: fallback, loading: true });

  useEffect(() => {
    let cancelled = false;
    loader().then(
      (data) => !cancelled && setState({ data, loading: false }),
      () => !cancelled && setState({ data: fallbackRef.current, loading: false }),
    );
    return () => {
      cancelled = true;
    };
  }, [loader]);

  return state;
}
