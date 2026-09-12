/**
 * Bali regions and sub-areas for property search, listing inference, and the area map.
 * Single source of truth — extend here when adding new searchable locations.
 */

export type BaliAreaGroup = { area: string; keys: readonly string[] };

export const BALI_AREA_GROUPS: readonly BaliAreaGroup[] = [
  {
    area: "Seminyak",
    keys: ["Oberoi", "Bidadari", "Gang Kahyangan", "Dewi Sri"],
  },
  {
    area: "Canggu",
    keys: [
      "Berawa",
      "Pererenan",
      "Batu Bolong",
      "Padonan",
      "Babakan",
      "Tumbak Bayuh",
      "Kayu Tulang",
      "Buduk",
      "Munggu",
      "Seseh",
      "Cemagi",
      "Mengening",
    ],
  },
  { area: "Umalas", keys: ["Kerobokan", "Petitenget"] },
  {
    area: "Uluwatu",
    keys: [
      "Bingin",
      "Pecatu",
      "Balangan",
      "Ungasan",
      "Melasti",
      "Dreamland",
      "Jimbaran",
      "Bukit",
      "Pandawa",
      "Padang Padang",
    ],
  },
  {
    area: "Ubud",
    keys: ["Tegallalang", "Gianyar", "Kemenuh", "Peliatan", "Mas", "Payangan", "Sidemen"],
  },
  { area: "Sanur", keys: [] },
  { area: "Nusa Dua", keys: ["Tanjung Benoa"] },
  {
    area: "Tabanan",
    keys: ["Tanah Lot", "Nyanyi", "Kedungu", "Kaba-Kaba", "Buwit", "Selemadeg", "Belimbing"],
  },
  { area: "Denpasar", keys: [] },
  { area: "Kuta", keys: ["Legian"] },
  { area: "Lovina", keys: ["Singaraja"] },
  { area: "Amed", keys: ["Tulamben"] },
  { area: "Candidasa", keys: [] },
  { area: "Medewi", keys: [] },
  { area: "Munduk", keys: [] },
  { area: "Pemuteran", keys: [] },
  { area: "Nusa Penida", keys: ["Nusa Lembongan", "Nusa Ceningan"] },
] as const;

/** Curated shortcuts shown under “Popular Locations” when the search box is empty. */
export const BALI_POPULAR_SEARCH_AREAS: readonly string[] = [
  "Uluwatu",
  "Melasti",
  "Bingin",
  "Pecatu",
  "Pandawa",
  "Ungasan",
  "Padang Padang",
  "Canggu",
  "Pererenan",
  "Berawa",
  "Umalas",
  "Seminyak",
  "Ubud",
  "Kedungu",
];

function uniqueSorted(names: Iterable<string>): string[] {
  const seen = new Set<string>();
  for (const raw of names) {
    const t = raw.trim();
    if (t) seen.add(t);
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "en"));
}

/** Every searchable Bali area in the property search dropdown (parents + sub-areas). */
export const BALI_PROPERTY_SEARCH_AREAS: readonly string[] = [
  ...uniqueSorted(
    BALI_AREA_GROUPS.flatMap((g) => [g.area, ...g.keys.map((k) => k.trim())]),
  ),
  "Others",
];

/** Sub-areas that roll up to a parent region for listing filters and map highlights. */
export const BALI_SUB_AREA_PARENT: Readonly<Record<string, string>> = Object.fromEntries(
  BALI_AREA_GROUPS.flatMap((g) =>
    g.keys.map((key) => [key.trim(), g.area] as const),
  ),
);
