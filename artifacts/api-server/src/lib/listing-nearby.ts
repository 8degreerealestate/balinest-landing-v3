import { resolveAreaCoordinates } from "./bali-area-coordinates";
import { logger } from "./logger";

export type NearbyCategory = "shopping" | "cafes" | "landmarks";

export type NearbyPlace = {
  name: string;
  distance: number;
};

export type ListingNearbyResult = Record<NearbyCategory, NearbyPlace[]> & {
  center: { lat: number; lng: number; source: "sheet" | "area" | "default" };
};

const DEFAULT_CENTER = { lat: -8.6476, lng: 115.1385 }; // Canggu belt
const DEFAULT_RADIUS_M = 2_000;
const CACHE_TTL_MS = 24 * 60 * 60_000;

type CacheEntry = { fetchedAt: number; data: ListingNearbyResult };

const nearbyCache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lng: number, radiusM: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)},${radiusM}`;
}

function parseCoord(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const n = Number(String(raw).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Sheet `Map Lat` / `Map Lng` (privacy-offset pin) or area centroid from location label. */
export function resolveListingMapCenter(input: {
  mapLat: string | null | undefined;
  mapLng: string | null | undefined;
  location: string | null | undefined;
  title?: string;
  description?: string;
}): { lat: number; lng: number; source: "sheet" | "area" | "default" } {
  const lat = parseCoord(input.mapLat);
  const lng = parseCoord(input.mapLng);
  if (lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { lat, lng, source: "sheet" };
  }

  const fromLocation = resolveAreaCoordinates(input.location ?? "");
  if (fromLocation) return { ...fromLocation, source: "area" };

  const blob = `${input.title ?? ""} ${input.description ?? ""}`;
  const fromText = resolveAreaCoordinates(blob);
  if (fromText) return { ...fromText, source: "area" };

  return { ...DEFAULT_CENTER, source: "default" };
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function elementCoords(el: OsmElement): { lat: number; lng: number } | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") {
    return { lat: el.lat, lng: el.lon };
  }
  if (el.center && typeof el.center.lat === "number" && typeof el.center.lon === "number") {
    return { lat: el.center.lat, lng: el.center.lon };
  }
  return null;
}

function categorizeElement(tags: Record<string, string>): NearbyCategory | null {
  const amenity = tags.amenity?.toLowerCase() ?? "";
  const shop = tags.shop?.toLowerCase() ?? "";
  const tourism = tags.tourism?.toLowerCase() ?? "";
  const natural = tags.natural?.toLowerCase() ?? "";
  const historic = tags.historic?.toLowerCase() ?? "";
  const leisure = tags.leisure?.toLowerCase() ?? "";

  if (
    amenity === "cafe" ||
    amenity === "coffee_shop" ||
    amenity === "restaurant" ||
    amenity === "fast_food" ||
    shop === "bakery" ||
    shop === "pastry"
  ) {
    return "cafes";
  }

  if (
    shop ||
    amenity === "marketplace" ||
    amenity === "supermarket" ||
    amenity === "convenience" ||
    amenity === "mall" ||
    amenity === "department_store"
  ) {
    return "shopping";
  }

  if (
    tourism ||
    natural === "beach" ||
    historic ||
    leisure === "park" ||
    leisure === "beach_resort" ||
    leisure === "nature_reserve" ||
    tags.man_made === "tower" ||
    tags.building === "temple"
  ) {
    return "landmarks";
  }

  return null;
}

function displayName(tags: Record<string, string>): string | null {
  const name = tags.name?.trim() || tags["name:en"]?.trim();
  if (!name) return null;
  return name.slice(0, 80);
}

const LIMITS: Record<NearbyCategory, number> = {
  shopping: 8,
  cafes: 8,
  landmarks: 6,
};

async function queryOverpass(lat: number, lng: number, radiusM: number): Promise<OsmElement[]> {
  const query = `
[out:json][timeout:25];
(
  node["amenity"~"^(cafe|coffee_shop|restaurant|fast_food|marketplace|supermarket|convenience|mall|department_store)$"](around:${radiusM},${lat},${lng});
  way["amenity"~"^(cafe|coffee_shop|restaurant|fast_food|marketplace|supermarket|convenience|mall|department_store)$"](around:${radiusM},${lat},${lng});
  node["shop"](around:${radiusM},${lat},${lng});
  way["shop"](around:${radiusM},${lat},${lng});
  node["tourism"](around:${radiusM},${lat},${lng});
  way["tourism"](around:${radiusM},${lat},${lng});
  node["natural"="beach"](around:${radiusM},${lat},${lng});
  way["natural"="beach"](around:${radiusM},${lat},${lng});
  node["historic"](around:${radiusM},${lat},${lng});
  way["historic"](around:${radiusM},${lat},${lng});
  node["leisure"~"^(park|beach_resort|nature_reserve)$"](around:${radiusM},${lat},${lng});
  way["leisure"~"^(park|beach_resort|nature_reserve)$"](around:${radiusM},${lat},${lng});
);
out center tags;
`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "8degree.co listing-nearby/1.0 (property pages; contact@8degree.com)",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass HTTP ${res.status}`);
  }

  const json = (await res.json()) as { elements?: OsmElement[] };
  return json.elements ?? [];
}

function buildNearbyFromElements(
  elements: OsmElement[],
  centerLat: number,
  centerLng: number,
  source: "sheet" | "area" | "default",
): ListingNearbyResult {
  const buckets: Record<NearbyCategory, NearbyPlace[]> = {
    shopping: [],
    cafes: [],
    landmarks: [],
  };
  const seen = new Set<string>();

  const scored: Array<{ category: NearbyCategory; place: NearbyPlace }> = [];

  for (const el of elements) {
    const tags = el.tags;
    if (!tags) continue;
    const name = displayName(tags);
    if (!name) continue;

    const coords = elementCoords(el);
    if (!coords) continue;

    const category = categorizeElement(tags);
    if (!category) continue;

    const dedupeKey = `${category}:${name.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const distance = haversineMeters(centerLat, centerLng, coords.lat, coords.lng);
    if (distance > DEFAULT_RADIUS_M + 200) continue;

    scored.push({ category, place: { name, distance } });
  }

  for (const category of Object.keys(buckets) as NearbyCategory[]) {
    buckets[category] = scored
      .filter((s) => s.category === category)
      .sort((a, b) => a.place.distance - b.place.distance)
      .slice(0, LIMITS[category])
      .map((s) => s.place);
  }

  return {
    ...buckets,
    center: { lat: centerLat, lng: centerLng, source },
  };
}

export async function fetchListingNearbyPlaces(input: {
  mapLat: string | null | undefined;
  mapLng: string | null | undefined;
  location: string | null | undefined;
  title?: string;
  description?: string;
  radiusM?: number;
}): Promise<ListingNearbyResult> {
  const radiusM = input.radiusM ?? DEFAULT_RADIUS_M;
  const center = resolveListingMapCenter(input);
  const key = cacheKey(center.lat, center.lng, radiusM);

  const cached = nearbyCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return {
      ...cached.data,
      center,
    };
  }

  try {
    const elements = await queryOverpass(center.lat, center.lng, radiusM);
    const data = buildNearbyFromElements(elements, center.lat, center.lng, center.source);
    nearbyCache.set(key, { fetchedAt: Date.now(), data });
    return data;
  } catch (err) {
    logger.warn({ err, lat: center.lat, lng: center.lng }, "listing nearby: Overpass fetch failed");
    return {
      shopping: [],
      cafes: [],
      landmarks: [],
      center,
    };
  }
}
