import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

/** Fetches every matching property as a lightweight pin for the map. */
export function usePins(filters) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(filters);

  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    api
      .pins(filters, c.signal)
      .then((d) => {
        setPins(d.pins);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setPins([]);
          setLoading(false);
        }
      });
    return () => c.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { pins, loading };
}
