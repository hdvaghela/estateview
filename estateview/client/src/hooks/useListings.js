import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

const initial = {
  items: [],
  page: 0,
  total: 0,
  hasMore: false,
  loading: true,
  loadingMore: false,
  error: null,
};

/** Paginated listing feed with request cancellation. Resets whenever filters change. */
export function useListings(filters, limit = 12) {
  const [state, setState] = useState(initial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const controller = useRef(null);
  const requestId = useRef(0);
  const key = JSON.stringify(filters);

  const fetchPage = useCallback(
    async (page, reset) => {
      controller.current?.abort();
      const c = new AbortController();
      controller.current = c;
      const id = ++requestId.current;

      setState((s) => ({
        ...s,
        ...(reset ? { items: [], page: 0, total: 0, hasMore: false } : {}),
        loading: reset,
        loadingMore: !reset,
        error: null,
      }));

      try {
        const data = await api.list(filters, page, limit, c.signal);
        if (id !== requestId.current) return;
        setState((s) => ({
          items: reset ? data.items : [...s.items, ...data.items],
          page: data.page,
          total: data.total,
          hasMore: data.hasMore,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      } catch (err) {
        if (err.name === 'AbortError' || id !== requestId.current) return;
        setState((s) => ({ ...s, loading: false, loadingMore: false, error: err.message }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, limit]
  );

  useEffect(() => {
    fetchPage(1, true);
    return () => controller.current?.abort();
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    const s = stateRef.current;
    if (!s.hasMore || s.loading || s.loadingMore || s.error) return;
    fetchPage(s.page + 1, false);
  }, [fetchPage]);

  const retry = useCallback(() => {
    const s = stateRef.current;
    fetchPage(s.page > 0 ? s.page + 1 : 1, s.page === 0);
  }, [fetchPage]);

  return { ...state, loadMore, retry };
}
