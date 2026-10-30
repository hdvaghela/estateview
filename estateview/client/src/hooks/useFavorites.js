import { useCallback, useEffect, useState } from 'react';

const KEY = 'estateview:favorites';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch { /* storage unavailable */ }
  }, [ids]);

  const toggle = useCallback(
    (id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])),
    []
  );

  return { favorites: ids, isFavorite: (id) => ids.includes(id), toggle };
}
