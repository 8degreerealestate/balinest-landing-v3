/**
 * Approximate map centres for Bali search areas (used when a listing has no Map Lat/Lng).
 * Coordinates are area-level — not exact villa pins (privacy-safe default).
 */
export const BALI_AREA_COORDINATES: Readonly<Record<string, { lat: number; lng: number }>> = {
  Pererenan: { lat: -8.6483, lng: 115.1378 },
  "Batu Bolong": { lat: -8.652, lng: 115.1385 },
  Canggu: { lat: -8.6476, lng: 115.1385 },
  Berawa: { lat: -8.661, lng: 115.144 },
  Munggu: { lat: -8.635, lng: 115.125 },
  Seseh: { lat: -8.628, lng: 115.118 },
  Cemagi: { lat: -8.618, lng: 115.108 },
  Mengening: { lat: -8.612, lng: 115.102 },
  Seminyak: { lat: -8.6905, lng: 115.168 },
  Oberoi: { lat: -8.688, lng: 115.162 },
  Umalas: { lat: -8.671, lng: 115.158 },
  Kerobokan: { lat: -8.665, lng: 115.163 },
  Petitenget: { lat: -8.678, lng: 115.155 },
  Uluwatu: { lat: -8.829, lng: 115.085 },
  Bingin: { lat: -8.808, lng: 115.108 },
  Pecatu: { lat: -8.815, lng: 115.102 },
  Balangan: { lat: -8.792, lng: 115.125 },
  Ungasan: { lat: -8.805, lng: 115.158 },
  Melasti: { lat: -8.838, lng: 115.168 },
  Dreamland: { lat: -8.798, lng: 115.118 },
  Jimbaran: { lat: -8.783, lng: 115.178 },
  Pandawa: { lat: -8.848, lng: 115.198 },
  "Padang Padang": { lat: -8.812, lng: 115.105 },
  Ubud: { lat: -8.5069, lng: 115.2625 },
  Tegallalang: { lat: -8.431, lng: 115.279 },
  Gianyar: { lat: -8.544, lng: 115.325 },
  Sanur: { lat: -8.708, lng: 115.262 },
  "Nusa Dua": { lat: -8.8, lng: 115.228 },
  "Tanjung Benoa": { lat: -8.768, lng: 115.248 },
  Tabanan: { lat: -8.539, lng: 115.125 },
  Nyanyi: { lat: -8.605, lng: 115.083 },
  Kedungu: { lat: -8.598, lng: 115.078 },
  "Tanah Lot": { lat: -8.621, lng: 115.087 },
  "Kaba-Kaba": { lat: -8.575, lng: 115.145 },
  Buwit: { lat: -8.565, lng: 115.155 },
  Denpasar: { lat: -8.6705, lng: 115.2126 },
  Kuta: { lat: -8.722, lng: 115.172 },
  Legian: { lat: -8.71, lng: 115.168 },
  Lovina: { lat: -8.158, lng: 115.025 },
  Amed: { lat: -8.345, lng: 115.672 },
  Candidasa: { lat: -8.512, lng: 115.572 },
  Medewi: { lat: -8.468, lng: 114.942 },
  Munduk: { lat: -8.265, lng: 115.065 },
  Pemuteran: { lat: -8.155, lng: 114.652 },
  "Nusa Penida": { lat: -8.727, lng: 115.544 },
};

const NORMALIZED_AREA_COORDS = new Map(
  Object.entries(BALI_AREA_COORDINATES).map(([k, v]) => [k.toLowerCase(), v]),
);

/** Longest label match against a free-text location (e.g. "Pererenan, Canggu"). */
export function resolveAreaCoordinates(location: string): { lat: number; lng: number } | null {
  const hay = location.trim().toLowerCase();
  if (!hay) return null;

  let best: { lat: number; lng: number } | null = null;
  let bestLen = 0;
  for (const [name, coords] of NORMALIZED_AREA_COORDS) {
    if (hay.includes(name) && name.length > bestLen) {
      best = coords;
      bestLen = name.length;
    }
  }
  return best;
}
