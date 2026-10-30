// Deterministic mock dataset so the app works with zero setup.
// Swap this module for a real database (Postgres, Mongo, ...) in production.

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261030);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const int = (min, max) => Math.floor(between(min, max + 1));

export const CITIES = [
  { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, factor: 1.0 },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, factor: 1.4 },
  { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, factor: 1.1 },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, factor: 0.9 },
  { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, factor: 1.3 },
  { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784, factor: 1.0 },
];

export const AMENITIES = [
  { key: 'pool', label: 'Pool' },
  { key: 'gym', label: 'Gym' },
  { key: 'parking', label: 'Parking' },
  { key: 'garden', label: 'Garden' },
  { key: 'pets', label: 'Pet friendly' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'fireplace', label: 'Fireplace' },
  { key: 'ac', label: 'Air conditioning' },
  { key: 'laundry', label: 'In-unit laundry' },
  { key: 'concierge', label: 'Concierge' },
];

export const TYPES = ['House', 'Apartment', 'Condo', 'Townhouse', 'Loft'];

const STREETS = ['Maple', 'Cedar', 'Willow', 'Harbor', 'Juniper', 'Elm', 'Lakeview', 'Sunset', 'Granite', 'Orchard', 'Birch', 'Magnolia', 'Summit', 'Foundry', 'Canal', 'Alder', 'Hawthorne', 'Mercer'];
const SUFFIXES = ['St', 'Ave', 'Ln', 'Blvd', 'Way', 'Ct', 'Dr'];
const ADJECTIVES = ['Sunlit', 'Renovated', 'Quiet', 'Airy', 'Modern', 'Classic', 'Bright', 'Open-plan', 'Light-filled', 'Updated', 'Spacious', 'Charming'];

const AMENITY_KEYS = AMENITIES.map((a) => a.key);
const AMENITY_LABEL = Object.fromEntries(AMENITIES.map((a) => [a.key, a.label]));

function sample(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
}

function buildImages(id) {
  // picsum.photos gives stable, seeded photos. Three sizes: blur thumb, card, full.
  return Array.from({ length: 6 }, (_, i) => {
    const seed = `ev-${id}-${i}`;
    return {
      thumb: `https://picsum.photos/seed/${seed}/32/22`,
      card: `https://picsum.photos/seed/${seed}/720/480`,
      full: `https://picsum.photos/seed/${seed}/1400/933`,
    };
  });
}

function makeProperty(id) {
  const city = pick(CITIES);
  const type = pick(TYPES);
  const listingType = rand() < 0.6 ? 'sale' : 'rent';
  const compact = type === 'Apartment' || type === 'Loft' || type === 'Condo';
  const beds = compact ? int(0, 3) : int(2, 5);
  const baths = Math.max(1, Math.min(4, Math.round(beds * 0.7 + rand())));
  const sqft = Math.round((420 + beds * (compact ? 280 : 420) + between(0, 320)) / 10) * 10;
  const street = pick(STREETS);
  const suffix = pick(SUFFIXES);
  const number = int(12, 2480);

  const price =
    listingType === 'sale'
      ? Math.round((sqft * 310 * city.factor * between(0.8, 1.35)) / 5000) * 5000
      : Math.round((sqft * 1.9 * city.factor * between(0.85, 1.2)) / 25) * 25;

  const amenities = sample(AMENITY_KEYS, int(3, 7));
  const adjective = pick(ADJECTIVES);
  const bedText = beds === 0 ? 'studio' : `${beds}-bedroom`;

  return {
    id: String(id),
    title: `${adjective} ${bedText} ${type.toLowerCase()}`,
    description: `A ${adjective.toLowerCase()} ${type.toLowerCase()} on ${street} ${suffix} with ${sqft.toLocaleString('en-US')} sq ft of living space. ${
      amenities.length > 4 ? 'Loaded with extras, including ' : 'Includes '
    }${amenities.slice(0, 3).map((k) => AMENITY_LABEL[k].toLowerCase()).join(', ')}. Walkable to cafes, parks and transit.`,
    listingType,
    type,
    price,
    beds,
    baths,
    sqft,
    address: `${number} ${street} ${suffix}`,
    city: city.name,
    state: city.state,
    lat: +(city.lat + between(-0.07, 0.07)).toFixed(5),
    lng: +(city.lng + between(-0.09, 0.09)).toFixed(5),
    amenities,
    images: buildImages(id),
    listedAt: new Date(Date.now() - int(0, 90) * 86400000).toISOString(),
  };
}

export const PROPERTIES = Array.from({ length: 180 }, (_, i) => makeProperty(i + 1));
