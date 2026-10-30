import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PROPERTIES, CITIES, AMENITIES, TYPES } from './data.js';
import { parseFilters, applyFilters } from './filters.js';

const app = express();
const PORT = process.env.PORT || 4000;
const LATENCY = Number(process.env.LATENCY_MS || 0); // e.g. LATENCY_MS=400 to test loading states

app.use(cors());
app.use(express.json());
if (LATENCY) app.use((_req, _res, next) => setTimeout(next, LATENCY));

// Metadata used to build the filter UI
app.get('/api/meta', (_req, res) => {
  res.json({
    cities: CITIES.map(({ name, state }) => ({ name, state })),
    amenities: AMENITIES,
    types: TYPES,
  });
});

// Paginated, filterable feed (powers infinite scroll)
// GET /api/properties?listingType=sale&city=Austin&minPrice=300000&maxPrice=900000
//     &beds=2&baths=1&type=House&amenities=pool,gym&q=maple&sort=price_asc&page=1&limit=12
app.get('/api/properties', (req, res) => {
  const filters = parseFilters(req.query);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const matches = applyFilters(PROPERTIES, filters);
  const start = (page - 1) * limit;
  const items = matches.slice(start, start + limit);

  res.json({
    items,
    page,
    limit,
    total: matches.length,
    hasMore: start + items.length < matches.length,
  });
});

// Compact payload for plotting every matching property on the map
app.get('/api/properties/pins', (req, res) => {
  const matches = applyFilters(PROPERTIES, parseFilters(req.query));
  res.json({
    total: matches.length,
    pins: matches.map(({ id, lat, lng, price, listingType, title, city }) => ({
      id, lat, lng, price, listingType, title, city,
    })),
  });
});

app.get('/api/properties/:id', (req, res) => {
  const property = PROPERTIES.find((p) => p.id === req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });
  res.json(property);
});

// Serve the built client in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => console.log(`EstateView API listening on http://localhost:${PORT}`));
