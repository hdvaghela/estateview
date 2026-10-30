# EstateView – Real Estate Listing Portal

Mobile-first property browsing built with **React 18, Tailwind CSS, Vite** and a custom **Express REST API**, plus **Google Maps** for plotting listings.

## Features
- **Responsive, mobile-first UI** (Tailwind): list/map toggle on phones, split list + sticky map on desktop
- **Image carousels**: native scroll-snap swipe, arrow buttons, keyboard arrows, dots
- **Lazy loading**: blurred low-res placeholders, only the current and neighbouring slides are fetched
- **Infinite scroll**: `IntersectionObserver` sentinel loads the next page; skeleton cards while loading
- **Multi-parameter filtering** via REST: buy/rent, city, price range, beds, baths, home type, amenities, text search, sorting (debounced, in-flight requests cancelled)
- **Google Maps**: every matching property plotted as a price pin; hover a card to highlight its pin, click a pin to open details. Falls back to a built-in schematic map when no API key is set
- Property detail modal (fetched from `GET /api/properties/:id`), saved/favourite properties (localStorage), empty and error states, reduced-motion support

## Quick start
```bash
npm run install:all     # installs root, server and client dependencies
cp client/.env.example client/.env   # optional: add your Google Maps key
npm run dev             # API on :4000, web app on http://localhost:5173
```
Production: `npm run build && npm start` (the Express server serves `client/dist` on :4000).

### Google Maps key
1. Google Cloud Console → enable **Maps JavaScript API** → create an API key.
2. Put it in `client/.env`: `VITE_GOOGLE_MAPS_API_KEY=your_key`
3. Restrict the key to your domains (e.g. `http://localhost:5173/*`).

## REST API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meta` | Cities, home types and amenities for the filter UI |
| GET | `/api/properties` | Paginated, filtered feed (`page`, `limit`) |
| GET | `/api/properties/pins` | Lightweight `{id, lat, lng, price}` list for the map (same filters) |
| GET | `/api/properties/:id` | Full property details |

Filter params: `q`, `listingType` (`sale`/`rent`), `city`, `type`, `minPrice`, `maxPrice`, `beds`, `baths`, `amenities` (comma list, e.g. `pool,gym`), `sort` (`newest`, `price_asc`, `price_desc`, `beds_desc`).

Example: `/api/properties?listingType=rent&city=Austin&beds=2&amenities=pool,gym&sort=price_asc&page=1&limit=12`

The API serves 180 deterministic generated listings (`server/data.js`). Property photos come from picsum.photos (needs internet). To use a real database, replace `data.js`/`filters.js` with queries; the client doesn't change. Set `LATENCY_MS=400` when starting the server to preview loading states.

## Structure
```
estateview/
├── server/            Express REST API (index.js, data.js, filters.js)
└── client/
    └── src/
        ├── api/        fetch wrapper + query builder
        ├── hooks/      useListings (pagination), usePins, useDebounce, useInView, useFavorites…
        ├── components/ FilterBar, ListingGrid, ListingCard, ImageCarousel, LazyImage, MapView, PropertyModal…
        └── lib/        formatters, Google Maps loader
```
