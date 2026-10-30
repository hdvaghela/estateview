import { useCallback, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import FilterBar, { DEFAULT_FILTERS } from './components/FilterBar.jsx';
import ListingGrid from './components/ListingGrid.jsx';
import MapView from './components/MapView.jsx';
import PropertyModal from './components/PropertyModal.jsx';
import { MapIcon, ListIcon } from './components/Icons.jsx';
import { useDebounce } from './hooks/useDebounce.js';
import { useListings } from './hooks/useListings.js';
import { usePins } from './hooks/usePins.js';
import { useMeta } from './hooks/useMeta.js';
import { useFavorites } from './hooks/useFavorites.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('list'); // mobile only: 'list' | 'map'
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const meta = useMeta();
  const { favorites, isFavorite, toggle } = useFavorites();

  // Debounce so typing / price edits don't fire a request per keystroke
  const debounced = useDebounce(filters, 350);
  const listings = useListings(debounced);
  const pinFilters = useMemo(() => ({ ...debounced, sort: '' }), [debounced]);
  const { pins, loading: pinsLoading } = usePins(pinFilters);

  const amenityLabels = useMemo(
    () => Object.fromEntries(meta.amenities.map((a) => [a.key, a.label])),
    [meta.amenities]
  );

  const activeCount =
    (filters.q.trim() ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.minPrice !== '' ? 1 : 0) +
    (filters.maxPrice !== '' ? 1 : 0) +
    (filters.beds ? 1 : 0) +
    (filters.baths ? 1 : 0) +
    (filters.type ? 1 : 0) +
    filters.amenities.length;

  const reset = useCallback(() => setFilters((f) => ({ ...DEFAULT_FILTERS, listingType: f.listingType })), []);
  const open = useCallback((id) => setSelectedId(id), []);
  const close = useCallback(() => setSelectedId(null), []);
  const hover = useCallback((id) => setHoveredId(id), []);

  const showMap = isDesktop || view === 'map';
  const showList = isDesktop || view === 'list';

  return (
    <div className="min-h-screen">
      <Header savedCount={favorites.length} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        meta={meta}
        total={listings.loading ? null : listings.total}
        activeCount={activeCount}
        onReset={reset}
      />

      <main className="mx-auto grid max-w-[1600px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {showList && (
          <section aria-label="Property listings" className="px-4 py-5 sm:px-6">
            <ListingGrid
              {...listings}
              onLoadMore={listings.loadMore}
              onRetry={listings.retry}
              onClearFilters={reset}
              amenityLabels={amenityLabels}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
              onOpen={open}
              hoveredId={hoveredId}
              onHover={hover}
            />
          </section>
        )}

        {showMap && (
          <section
            aria-label="Map"
            className="h-[calc(100vh-14rem)] min-h-[360px] border-line lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:border-l"
          >
            <MapView pins={pins} loading={pinsLoading} hoveredId={hoveredId} selectedId={selectedId} onSelect={open} />
          </section>
        )}
      </main>

      {/* Mobile list/map switch */}
      <button
        type="button"
        onClick={() => setView((v) => (v === 'list' ? 'map' : 'list'))}
        className="safe-bottom fixed bottom-4 left-1/2 z-30 flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white shadow-lg lg:hidden"
      >
        {view === 'list' ? <><MapIcon /> Map</> : <><ListIcon /> List</>}
      </button>

      {selectedId && (
        <PropertyModal
          id={selectedId}
          onClose={close}
          amenityLabels={amenityLabels}
          favorite={isFavorite(selectedId)}
          onToggleFavorite={toggle}
        />
      )}
    </div>
  );
}
