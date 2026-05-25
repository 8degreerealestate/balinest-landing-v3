/**
 * Bali island outline: simplified from Indonesia province GeoJSON
 * (BALI / BAKOSURTANAL via ans-4175/peta-indonesia-geojson), decimated for web.
 * Highlights use rough lon/lat boxes clipped to the island shape.
 */

export const BALI_MAP_BRAND = "#01514E";
export const BALI_MAP_BASE_FILL = "#e4e4e4";
export const BALI_MAP_BASE_STROKE = "#bcbcbc";

export const BALI_MAP_VIEW = { w: 200, h: 260 } as const;

/** Padded bounds (2% margin) for mainland + Nusa islands from province outline. */
export const BALI_MAP_BOUNDS = {
  minLon: 114.40250704,
  maxLon: 115.74207696,
  minLat: -8.86319232,
  maxLat: -8.04313568,
} as const;

/** Simplified coastline — same `d` as `public/site-media/bali-island-outline.svg`. */
export const BALI_ISLAND_PATH_D =
  "M 118.31 218.51 L 116.12 226.57 L 124.29 239.83 L 114.66 255.00 L 102.25 251.26 L 102.62 243.76 L 113.27 233.42 L 114.05 213.96 L 110.13 197.75 L 103.79 188.66 L 99.45 173.80 L 78.62 136.67 L 59.58 117.65 L 46.63 111.50 L 33.62 115.61 L 25.88 109.48 L 17.93 92.93 L 6.42 55.75 L 3.85 39.61 L 5.30 16.03 L 12.71 15.99 L 20.07 30.17 L 26.86 23.29 L 43.29 32.11 L 51.06 39.39 L 67.41 48.23 L 88.82 41.42 L 106.32 11.50 L 116.03 5.00 L 139.73 21.56 L 156.82 37.88 L 173.56 60.36 L 183.97 88.46 L 194.01 98.81 L 196.15 112.47 L 190.80 127.00 L 185.37 132.16 L 180.20 146.44 L 170.31 144.72 L 163.72 159.76 L 155.89 166.04 L 142.91 169.51 L 128.64 194.11 L 128.09 209.53 L 118.31 218.51 Z M 182.34 231.55 L 177.03 245.72 L 161.61 229.52 L 155.67 215.29 L 162.20 199.44 L 173.65 199.06 L 182.33 224.11 L 182.34 231.55 Z";

export function projectBaliLonLat(lon: number, lat: number): { x: number; y: number } {
  const { minLon, maxLon, minLat, maxLat } = BALI_MAP_BOUNDS;
  const { w, h } = BALI_MAP_VIEW;
  const x = ((lon - minLon) / (maxLon - minLon)) * w;
  const y = h - ((lat - minLat) / (maxLat - minLat)) * h;
  return { x, y };
}

/** West, south, east, north in decimal degrees (south lat more negative). */
export function baliHighlightRectPath(west: number, south: number, east: number, north: number): string {
  const nw = projectBaliLonLat(west, north);
  const ne = projectBaliLonLat(east, north);
  const se = projectBaliLonLat(east, south);
  const sw = projectBaliLonLat(west, south);
  const fmt = (n: number) => n.toFixed(2);
  return `M ${fmt(nw.x)} ${fmt(nw.y)} L ${fmt(ne.x)} ${fmt(ne.y)} L ${fmt(se.x)} ${fmt(se.y)} L ${fmt(sw.x)} ${fmt(sw.y)} Z`;
}

/** Map region id → rough bounding box on Bali. */
export const BALI_HIGHLIGHT_BOXES: Record<string, [number, number, number, number]> = {
  uluwatu: [115.02, -8.9, 115.52, -8.76],
  umalas: [115.14, -8.68, 115.23, -8.61],
  canggu: [115.08, -8.69, 115.2, -8.62],
  seminyak: [115.15, -8.72, 115.27, -8.65],
  ubud: [115.22, -8.56, 115.38, -8.44],
  tabanan: [114.95, -8.58, 115.2, -8.32],
};

const AREA_MAP_REGIONS: Record<string, string[]> = {
  Uluwatu: ["uluwatu"],
  Melasti: ["uluwatu"],
  Bingin: ["uluwatu"],
  Pecatu: ["uluwatu"],
  Pandawa: ["uluwatu"],
  Ungasan: ["uluwatu"],
  "Padang Padang": ["uluwatu"],
  Umalas: ["umalas"],
  Canggu: ["canggu"],
  Pererenan: ["canggu"],
  Seminyak: ["seminyak"],
  Ubud: ["ubud"],
  Tabanan: ["tabanan"],
};

export function activeBaliMapRegions(selectedArea: string): Set<string> {
  return new Set(AREA_MAP_REGIONS[selectedArea] ?? []);
}
