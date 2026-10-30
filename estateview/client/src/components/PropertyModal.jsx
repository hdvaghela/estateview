import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ImageCarousel from './ImageCarousel.jsx';
import { CloseIcon, HeartIcon } from './Icons.jsx';
import { formatPrice, formatBeds, daysAgo } from '../lib/format.js';

export default function PropertyModal({ id, onClose, amenityLabels, favorite, onToggleFavorite }) {
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const c = new AbortController();
    setProperty(null); setError(null); setRequested(false);
    api.get(id, c.signal).then(setProperty).catch((e) => e.name !== 'AbortError' && setError(e.message));
    return () => c.abort();
  }, [id]);

  // Esc to close + lock page scroll while open
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Property details" className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <button onClick={onClose} aria-label="Close details" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow hover:bg-white">
          <CloseIcon />
        </button>

        {error && (
          <div role="alert" className="p-10 text-center">
            <h2 className="font-display text-xl font-semibold">Couldn’t load this property</h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
        )}

        {!error && !property && (
          <div aria-busy="true">
            <div className="skeleton aspect-[3/2] w-full" />
            <div className="space-y-3 p-6">
              <div className="skeleton h-7 w-1/3 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-20 w-full rounded" />
            </div>
          </div>
        )}

        {property && (
          <>
            <ImageCarousel images={property.images} alt={property.title} size="full" aspect="aspect-[3/2] sm:aspect-[16/9]" priorityFirst />
            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-3xl font-bold">{formatPrice(property.price, property.listingType)}</p>
                  <h2 className="mt-1 font-display text-xl font-semibold first-letter:uppercase">{property.title}</h2>
                  <p className="text-sm text-slate-500">{property.address}, {property.city}, {property.state}</p>
                </div>
                <button
                  onClick={() => onToggleFavorite(property.id)}
                  aria-pressed={favorite}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium hover:bg-mist ${favorite ? 'text-red-600' : ''}`}
                >
                  <HeartIcon filled={favorite} /> {favorite ? 'Saved' : 'Save'}
                </button>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Bedrooms', formatBeds(property.beds)],
                  ['Bathrooms', property.baths],
                  ['Living area', `${property.sqft.toLocaleString('en-US')} sq ft`],
                  ['Type', property.type],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-mist p-3">
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="font-display text-lg font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 max-w-prose leading-relaxed">{property.description}</p>

              <h3 className="mt-6 font-display text-base font-semibold">Amenities</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {property.amenities.map((k) => (
                  <li key={k} className="rounded-full bg-pine-soft px-3 py-1 text-sm font-medium text-pine-dark">{amenityLabels[k] || k}</li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <button
                  onClick={() => setRequested(true)}
                  disabled={requested}
                  className="h-11 rounded-lg bg-ink px-5 font-semibold text-white hover:bg-pine-dark disabled:bg-pine"
                >
                  {requested ? 'Tour requested' : 'Request a tour'}
                </button>
                <span className="text-sm text-slate-500" aria-live="polite">
                  {requested ? 'An agent will contact you within one business day.' : daysAgo(property.listedAt)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
