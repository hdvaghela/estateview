import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadGoogleMaps } from '../lib/loadGoogleMaps.js';
import { formatPrice } from '../lib/format.js';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function pinIcon(g, label, active) {
  const w = label.length * 8 + 22;
  const h = 28;
  const fill = active ? '#12202B' : '#F2C14E';
  const text = active ? '#FFFFFF' : '#12202B';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + 7}">
    <path d="M${w / 2 - 6} ${h - 1} L${w / 2} ${h + 6} L${w / 2 + 6} ${h - 1} Z" fill="${fill}" stroke="#12202B" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="7" fill="${fill}" stroke="#12202B" stroke-width="1.5"/>
    <path d="M${w / 2 - 5} ${h - 2} h10" stroke="${fill}" stroke-width="3"/>
    <text x="${w / 2}" y="${h / 2 + 4.5}" font-family="Arial, sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="${text}">${label}</text>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.maps.Size(w, h + 7),
    anchor: new g.maps.Point(w / 2, h + 7),
  };
}

/* ---------- Google Maps implementation ---------- */
function GoogleMap({ pins, hoveredId, selectedId, onSelect, onFail }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const gRef = useRef(null);
  const markers = useRef(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(API_KEY)
      .then((g) => {
        if (cancelled || !elRef.current) return;
        gRef.current = g;
        mapRef.current = new g.maps.Map(elRef.current, {
          center: { lat: 39.5, lng: -98.35 },
          zoom: 4,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        });
        setReady(true);
      })
      .catch(() => onFail());
    return () => { cancelled = true; };
  }, [onFail]);

  // (Re)plot markers whenever the filtered pins change, then fit the viewport to them.
  useEffect(() => {
    if (!ready) return;
    const g = gRef.current;
    markers.current.forEach((m) => m.setMap(null));
    markers.current.clear();
    if (!pins.length) return;

    const bounds = new g.maps.LatLngBounds();
    pins.forEach((p) => {
      const marker = new g.maps.Marker({
        map: mapRef.current,
        position: { lat: p.lat, lng: p.lng },
        icon: pinIcon(g, formatPrice(p.price, p.listingType, { compact: true }), false),
        title: p.title,
        optimized: false,
      });
      marker.addListener('click', () => onSelect(p.id));
      markers.current.set(p.id, marker);
      bounds.extend(marker.getPosition());
    });
    mapRef.current.fitBounds(bounds, 48);
  }, [pins, ready, onSelect]);

  // Highlight the hovered/selected marker and bring it to the front.
  useEffect(() => {
    if (!ready) return;
    const g = gRef.current;
    const activeId = hoveredId || selectedId;
    pins.forEach((p) => {
      const m = markers.current.get(p.id);
      if (!m) return;
      const active = p.id === activeId;
      m.setIcon(pinIcon(g, formatPrice(p.price, p.listingType, { compact: true }), active));
      m.setZIndex(active ? 1000 : undefined);
    });
  }, [hoveredId, selectedId, pins, ready]);

  return <div ref={elRef} className="h-full w-full" role="application" aria-label="Map of available properties" />;
}

/* ---------- Built-in fallback when no API key is configured ---------- */
function SchematicMap({ pins, hoveredId, selectedId, onSelect, reason }) {
  const box = useMemo(() => {
    if (!pins.length) return null;
    const lats = pins.map((p) => p.lat);
    const lngs = pins.map((p) => p.lng);
    return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
  }, [pins]);

  const pos = (p) => {
    const spanLng = box.maxLng - box.minLng || 1;
    const spanLat = box.maxLat - box.minLat || 1;
    return {
      left: `${6 + ((p.lng - box.minLng) / spanLng) * 88}%`,
      top: `${8 + (1 - (p.lat - box.minLat) / spanLat) * 80}%`,
    };
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#E4EBEE]"
      style={{ backgroundImage: 'linear-gradient(#D3DDE2 1px, transparent 1px), linear-gradient(90deg, #D3DDE2 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
      {box && pins.map((p) => {
        const active = p.id === (hoveredId || selectedId);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            aria-label={`${p.title}, ${formatPrice(p.price, p.listingType)}`}
            style={pos(p)}
            className={`absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border-[1.5px] border-ink px-1.5 py-0.5 text-xs font-bold transition-colors ${active ? 'z-20 bg-ink text-white' : 'z-10 bg-brass text-ink hover:bg-white'}`}
          >
            {formatPrice(p.price, p.listingType, { compact: true })}
          </button>
        );
      })}
      <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 p-3 text-xs text-slate-500 shadow">
        {reason === 'error'
          ? 'Google Maps couldn’t load. Check your API key and that “Maps JavaScript API” is enabled.'
          : <>Showing a schematic map. Add <code className="font-semibold text-ink">VITE_GOOGLE_MAPS_API_KEY</code> to <code className="font-semibold text-ink">client/.env</code> for the live Google map.</>}
      </div>
    </div>
  );
}

export default function MapView(props) {
  const [failed, setFailed] = useState(false);
  const handleFail = useCallback(() => setFailed(true), []);
  const useGoogle = Boolean(API_KEY) && !failed;

  return (
    <div className="relative h-full w-full">
      {useGoogle
        ? <GoogleMap {...props} onFail={handleFail} />
        : <SchematicMap {...props} reason={API_KEY ? 'error' : 'nokey'} />}
      {props.loading && (
        <div className="absolute left-3 top-3 rounded-md bg-white px-3 py-1.5 text-xs font-medium shadow">Updating map…</div>
      )}
    </div>
  );
}
