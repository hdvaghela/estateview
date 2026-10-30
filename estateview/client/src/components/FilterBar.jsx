import { useState } from 'react';
import { SearchIcon, SlidersIcon } from './Icons.jsx';

export const DEFAULT_FILTERS = {
  q: '',
  listingType: 'sale',
  city: '',
  minPrice: '',
  maxPrice: '',
  beds: 0,
  baths: 0,
  type: '',
  amenities: [],
  sort: 'newest',
};

const field =
  'h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-500/70 focus:border-pine';

function Label({ children }) {
  return <span className="mb-1 block text-xs font-medium text-slate-500">{children}</span>;
}

function Segmented({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex overflow-hidden rounded-lg border border-line bg-white">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-10 flex-1 px-3 text-sm font-medium transition ${value === o.value ? 'bg-ink text-white' : 'text-ink hover:bg-mist'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function FilterBar({ filters, onChange, meta, total, activeCount, onReset }) {
  const [open, setOpen] = useState(false);
  const set = (patch) => onChange({ ...filters, ...patch });
  const toggleAmenity = (key) =>
    set({ amenities: filters.amenities.includes(key) ? filters.amenities.filter((a) => a !== key) : [...filters.amenities, key] });

  const rent = filters.listingType === 'rent';

  return (
    <section aria-label="Search filters" className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Search by street, city or property type"
              aria-label="Search properties"
              className={`${field} pl-10`}
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="filter-panel"
            className="relative flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium hover:bg-mist lg:hidden"
          >
            <SlidersIcon /> Filters
            {activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-pine px-1 text-xs text-white">{activeCount}</span>
            )}
          </button>
        </div>

        <div id="filter-panel" className={`${open ? 'block' : 'hidden'} mt-3 lg:block`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-[1.1fr_1fr_1fr_1fr_.9fr_.9fr_1fr_1.1fr]">
            <div className="col-span-2 sm:col-span-1">
              <Label>Looking to</Label>
              <Segmented
                label="Buy or rent"
                value={filters.listingType}
                onChange={(v) => set({ listingType: v, minPrice: '', maxPrice: '' })}
                options={[{ value: 'sale', label: 'Buy' }, { value: 'rent', label: 'Rent' }]}
              />
            </div>
            <div>
              <Label>City</Label>
              <select value={filters.city} onChange={(e) => set({ city: e.target.value })} className={field}>
                <option value="">Any city</option>
                {meta.cities.map((c) => <option key={c.name} value={c.name}>{c.name}, {c.state}</option>)}
              </select>
            </div>
            <div>
              <Label>{rent ? 'Min rent' : 'Min price'}</Label>
              <input
                type="number" inputMode="numeric" min="0" step={rent ? 100 : 25000}
                value={filters.minPrice} onChange={(e) => set({ minPrice: e.target.value })}
                placeholder={rent ? '$0' : '$0'} className={field}
              />
            </div>
            <div>
              <Label>{rent ? 'Max rent' : 'Max price'}</Label>
              <input
                type="number" inputMode="numeric" min="0" step={rent ? 100 : 25000}
                value={filters.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })}
                placeholder="No max" className={field}
              />
            </div>
            <div>
              <Label>Beds</Label>
              <select value={filters.beds} onChange={(e) => set({ beds: Number(e.target.value) })} className={field}>
                <option value={0}>Any</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <Label>Baths</Label>
              <select value={filters.baths} onChange={(e) => set({ baths: Number(e.target.value) })} className={field}>
                <option value={0}>Any</option>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <Label>Home type</Label>
              <select value={filters.type} onChange={(e) => set({ type: e.target.value })} className={field}>
                <option value="">All types</option>
                {meta.types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Sort by</Label>
              <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} className={field}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="beds_desc">Most bedrooms</option>
              </select>
            </div>
          </div>

          <fieldset className="mt-3">
            <legend className="mb-1.5 text-xs font-medium text-slate-500">Must have</legend>
            <div className="flex flex-wrap gap-2">
              {meta.amenities.map((a) => {
                const on = filters.amenities.includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleAmenity(a.key)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition ${on ? 'border-pine bg-pine text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p aria-live="polite" className="font-medium">
            {total === null ? 'Searching…' : `${total.toLocaleString('en-US')} ${total === 1 ? 'property' : 'properties'}`}
          </p>
          {activeCount > 0 && (
            <button onClick={onReset} className="font-semibold text-pine underline-offset-2 hover:underline">
              Clear {activeCount} {activeCount === 1 ? 'filter' : 'filters'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
