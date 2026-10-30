import { memo } from 'react';
import ImageCarousel from './ImageCarousel.jsx';
import { HeartIcon } from './Icons.jsx';
import { formatPrice, formatBeds } from '../lib/format.js';

function ListingCard({ property: p, amenityLabels, favorite, onToggleFavorite, onOpen, onHover, highlighted, priority }) {
  return (
    <article
      id={`listing-${p.id}`}
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}
      className={`overflow-hidden rounded-xl border bg-white shadow-card transition-shadow ${highlighted ? 'border-ink ring-2 ring-ink' : 'border-line'}`}
    >
      <div className="relative">
        <ImageCarousel images={p.images} alt={p.title} onClick={() => onOpen(p.id)} priorityFirst={priority} />
        <span className="absolute left-3 top-3 rounded-md bg-brass px-2.5 py-1 font-display text-base font-bold text-ink shadow-sm">
          {formatPrice(p.price, p.listingType)}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite(p.id)}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${p.title} from saved` : `Save ${p.title}`}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white ${favorite ? 'text-red-600' : 'text-ink'}`}
        >
          <HeartIcon filled={favorite} />
        </button>
      </div>

      <button type="button" onClick={() => onOpen(p.id)} className="block w-full p-4 text-left">
        <h3 className="font-display text-lg font-semibold leading-snug first-letter:uppercase">{p.title}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{p.address}, {p.city}, {p.state}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
          <span>{formatBeds(p.beds)}</span>
          <span>{p.baths} ba</span>
          <span>{p.sqft.toLocaleString('en-US')} sq ft</span>
          <span className="text-slate-500">{p.type}</span>
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {p.amenities.slice(0, 3).map((k) => (
            <li key={k} className="rounded-full bg-pine-soft px-2.5 py-0.5 text-xs font-medium text-pine-dark">
              {amenityLabels[k] || k}
            </li>
          ))}
          {p.amenities.length > 3 && (
            <li className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-medium text-slate-500">+{p.amenities.length - 3}</li>
          )}
        </ul>
      </button>
    </article>
  );
}

export default memo(ListingCard);
