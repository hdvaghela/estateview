import { useCallback, useEffect, useRef, useState } from 'react';
import LazyImage from './LazyImage.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';
import { useInView } from '../hooks/useInView.js';

/**
 * Scroll-snap carousel: native swipe on touch, arrow buttons + keyboard on desktop.
 * Only the current slide and its neighbours are fetched.
 */
export default function ImageCarousel({ images, alt, size = 'card', aspect = 'aspect-[3/2]', onClick, priorityFirst = false }) {
  const trackRef = useRef(null);
  const [wrapRef, visible] = useInView({ rootMargin: '300px' });
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive((cur) => (cur === idx ? cur : idx));
  }, []);

  const go = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: (active + dir) * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    // Reset when the images change (e.g. modal switches property)
    if (trackRef.current) trackRef.current.scrollLeft = 0;
    setActive(0);
  }, [images]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };

  return (
    <div ref={wrapRef} className={`group relative ${aspect} w-full bg-mist`}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {images.map((img, i) => (
          <div
            key={img[size] ?? i}
            role="group"
            aria-roledescription="slide"
            aria-label={`Photo ${i + 1} of ${images.length}`}
            onClick={onClick}
            className={`h-full w-full shrink-0 snap-center ${onClick ? 'cursor-pointer' : ''}`}
          >
            <LazyImage
              src={img[size]}
              thumb={img.thumb}
              alt={i === 0 ? alt : ''}
              load={visible && Math.abs(i - active) <= 1}
              priority={priorityFirst && i === 0}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            disabled={active === 0}
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white disabled:opacity-0 md:grid md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            disabled={active === images.length - 1}
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white disabled:opacity-0 md:grid md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronRight />
          </button>
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink/40 px-2 py-1">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full bg-white transition-all ${i === active ? 'w-4' : 'w-1.5 opacity-60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
