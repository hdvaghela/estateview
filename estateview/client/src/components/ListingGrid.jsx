import { useEffect, useRef } from 'react';
import ListingCard from './ListingCard.jsx';
import { CardSkeleton } from './Skeletons.jsx';

export default function ListingGrid({
  items, total, loading, loadingMore, hasMore, error, onLoadMore, onRetry, onClearFilters,
  amenityLabels, isFavorite, onToggleFavorite, onOpen, hoveredId, onHover,
}) {
  const sentinel = useRef(null);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  // Infinite scroll: fetch the next page when the sentinel nears the viewport.
  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMoreRef.current(), {
      rootMargin: '700px 0px',
    });
    io.observe(node);
    return () => io.disconnect();
  }, [items.length, hasMore]);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div role="alert" className="rounded-xl border border-line bg-white p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Couldn’t load properties</h2>
        <p className="mt-1 text-sm text-slate-500">{error}. Check that the API is running on port 4000.</p>
        <button onClick={onRetry} className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-pine-dark">Try again</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
        <h2 className="font-display text-xl font-semibold">No properties match these filters</h2>
        <p className="mt-1 text-sm text-slate-500">Widen the price range or remove an amenity to see more.</p>
        <button onClick={onClearFilters} className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-pine-dark">Clear filters</button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {items.map((p, i) => (
          <ListingCard
            key={p.id}
            property={p}
            amenityLabels={amenityLabels}
            favorite={isFavorite(p.id)}
            onToggleFavorite={onToggleFavorite}
            onOpen={onOpen}
            onHover={onHover}
            highlighted={hoveredId === p.id}
            priority={i < 2}
          />
        ))}
        {loadingMore && Array.from({ length: 2 }, (_, i) => <CardSkeleton key={`s${i}`} />)}
      </div>

      <div ref={sentinel} className="h-px" aria-hidden="true" />

      <p className="py-8 text-center text-sm text-slate-500" aria-live="polite">
        {error
          ? <>Couldn’t load more. <button onClick={onRetry} className="font-semibold text-pine underline">Retry</button></>
          : hasMore
            ? 'Loading more…'
            : `You’ve seen all ${total} properties`}
      </p>
    </>
  );
}
