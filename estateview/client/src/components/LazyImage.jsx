import { useState } from 'react';
import { useInView } from '../hooks/useInView.js';

/**
 * Lazy-loaded image with a blurred low-res placeholder.
 * - Pass `load` to control loading yourself (used by the carousel to preload neighbours).
 * - Otherwise it loads when it scrolls within ~300px of the viewport.
 */
export default function LazyImage({ src, thumb, alt, load, className = '', priority = false }) {
  const [ref, seen] = useInView({ rootMargin: '300px' });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const shouldLoad = priority || (load ?? seen);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-mist ${className}`}>
      {thumb && !loaded && (
        <img src={thumb} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-md" />
      )}
      {shouldLoad && !failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center text-xs text-slate-500">Photo unavailable</div>
      )}
    </div>
  );
}
