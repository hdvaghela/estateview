import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const FALLBACK = { cities: [], amenities: [], types: [] };

export function useMeta() {
  const [meta, setMeta] = useState(FALLBACK);
  useEffect(() => {
    const c = new AbortController();
    api.meta(c.signal).then(setMeta).catch(() => {});
    return () => c.abort();
  }, []);
  return meta;
}
