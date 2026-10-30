const BASE = import.meta.env.VITE_API_URL || '/api';

/** Turn the UI filter state into the query string the REST API expects. */
export function buildQuery(filters, extra = {}) {
  const p = new URLSearchParams();
  const set = (k, v) => {
    if (v !== '' && v !== null && v !== undefined && v !== 0) p.set(k, v);
  };
  set('q', filters.q?.trim());
  set('listingType', filters.listingType);
  set('city', filters.city);
  set('type', filters.type);
  set('minPrice', filters.minPrice);
  set('maxPrice', filters.maxPrice);
  set('beds', filters.beds);
  set('baths', filters.baths);
  set('sort', filters.sort);
  if (filters.amenities?.length) p.set('amenities', filters.amenities.join(','));
  Object.entries(extra).forEach(([k, v]) => set(k, v));
  return p.toString();
}

async function request(path, signal) {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  meta: (signal) => request('/meta', signal),
  list: (filters, page, limit, signal) =>
    request(`/properties?${buildQuery(filters, { page, limit })}`, signal),
  pins: (filters, signal) => request(`/properties/pins?${buildQuery(filters)}`, signal),
  get: (id, signal) => request(`/properties/${encodeURIComponent(id)}`, signal),
};
