const num = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function parseFilters(query) {
  return {
    q: String(query.q || '').trim().toLowerCase(),
    listingType: ['sale', 'rent'].includes(query.listingType) ? query.listingType : null,
    city: String(query.city || '').trim().toLowerCase(),
    type: String(query.type || '').trim().toLowerCase(),
    minPrice: num(query.minPrice),
    maxPrice: num(query.maxPrice),
    beds: num(query.beds),
    baths: num(query.baths),
    amenities: String(query.amenities || '').split(',').map((s) => s.trim()).filter(Boolean),
    sort: String(query.sort || 'newest'),
  };
}

export function applyFilters(list, f) {
  const out = list.filter((p) => {
    if (f.listingType && p.listingType !== f.listingType) return false;
    if (f.city && p.city.toLowerCase() !== f.city) return false;
    if (f.type && p.type.toLowerCase() !== f.type) return false;
    if (f.minPrice !== null && p.price < f.minPrice) return false;
    if (f.maxPrice !== null && p.price > f.maxPrice) return false;
    if (f.beds !== null && p.beds < f.beds) return false;
    if (f.baths !== null && p.baths < f.baths) return false;
    if (f.amenities.length && !f.amenities.every((a) => p.amenities.includes(a))) return false;
    if (f.q) {
      const hay = `${p.title} ${p.address} ${p.city} ${p.state} ${p.type}`.toLowerCase();
      if (!f.q.split(/\s+/).every((word) => hay.includes(word))) return false;
    }
    return true;
  });

  const sorters = {
    newest: (a, b) => new Date(b.listedAt) - new Date(a.listedAt),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    beds_desc: (a, b) => b.beds - a.beds || a.price - b.price,
  };
  return out.sort(sorters[f.sort] || sorters.newest);
}
