import type { PropertyInventoryListing } from "@workspace/api-client-react";
import { BALI_SUB_AREA_PARENT } from "@/lib/bali-search-areas";
import { inferBedroomsBucket, inferListingArea, inventoryListingPriceUsd } from "@/lib/portfolio-listing";

export type PropertySearchFilterState = {
  area: string;
  propertyType: string;
  bedrooms: string;
  listingQuery: string;
  ownership: string;
  devStatus: string;
  priceMinUsd: number | null;
  priceMaxUsd: number | null;
};

export function listingMatchesAreaFilter(
  filterArea: string,
  title: string,
  description: string,
  location?: string | null,
): boolean {
  if (!filterArea || filterArea === "all" || filterArea === "Area") return true;

  const hay = `${title}\n${description}\n${location ?? ""}`;
  const hayLower = hay.toLowerCase();
  const needle = filterArea.toLowerCase();
  if (hayLower.includes(needle)) return true;

  const loc = (location ?? "").trim();
  if (loc && loc.toLowerCase() === needle) return true;

  // Include sheet LOCATION so Melasti/etc. roll up to parent regions correctly.
  const inferred = inferListingArea(title, description, location);
  if (inferred === filterArea) return true;

  const parent = BALI_SUB_AREA_PARENT[filterArea];
  if (parent && (inferred === parent || hayLower.includes(parent.toLowerCase()))) {
    return hayLower.includes(needle);
  }

  // Parent region selected (e.g. Uluwatu) → include known sub-areas even when
  // copy only mentions Melasti / Pecatu and not the parent name.
  const childKeys = Object.entries(BALI_SUB_AREA_PARENT)
    .filter(([, p]) => p === filterArea)
    .map(([child]) => child.toLowerCase());
  if (childKeys.length > 0) {
    if (childKeys.some((child) => hayLower.includes(child))) return true;
    if (inferred !== "Bali" && BALI_SUB_AREA_PARENT[inferred] === filterArea) return true;
  }

  if (filterArea === "Others") {
    const known = [
      "Uluwatu",
      "Canggu",
      "Umalas",
      "Seminyak",
      "Ubud",
      "Tabanan",
      "Sanur",
      "Nusa Dua",
      "Denpasar",
      "Kuta",
      "Lovina",
      "Amed",
      "Candidasa",
      "Medewi",
      "Munduk",
      "Pemuteran",
      "Nusa Penida",
    ];
    return !known.some((k) => hay.includes(k) || inferred === k);
  }

  return false;
}

export const BEDROOM_FILTER_OPTIONS = [
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3 Bedrooms" },
  { value: "4", label: "4 Bedrooms" },
  { value: "5", label: "5 Bedrooms" },
  { value: "6+", label: "6+ Bedrooms" },
] as const;

export function parseBedroomFilterValues(bedrooms: string): string[] {
  if (!bedrooms || bedrooms === "all") return [];
  return bedrooms
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeBedroomFilterValues(values: readonly string[]): string {
  const unique = [...new Set(values.map((v) => v.trim()).filter(Boolean))];
  return unique.length === 0 ? "all" : unique.join(",");
}

function listingMatchesSingleBedroomOption(option: string, bedroomCount: number): boolean {
  if (option === "4") return bedroomCount >= 4;
  if (option === "6+") return bedroomCount >= 6;
  const n = Number(option);
  return Number.isFinite(n) && n === bedroomCount;
}

export function listingMatchesBedroomsFilter(
  bedrooms: string,
  title: string,
  description: string,
): boolean {
  const selected = parseBedroomFilterValues(bedrooms);
  if (selected.length === 0) return true;
  const n = inferBedroomsBucket(title, description);
  if (n === null) return true;
  return selected.some((opt) => listingMatchesSingleBedroomOption(opt, n));
}

/** Off-plan / development projects expose a min–max bedroom range. */
export function projectMatchesBedroomsFilter(
  bedrooms: string,
  bedroomsMin: number,
  bedroomsMax: number,
): boolean {
  const selected = parseBedroomFilterValues(bedrooms);
  if (selected.length === 0) return true;
  return selected.some((opt) => {
    if (opt === "4") return bedroomsMax >= 4;
    if (opt === "6+") return bedroomsMax >= 6;
    const n = Number(opt);
    if (!Number.isFinite(n)) return false;
    return bedroomsMin <= n && bedroomsMax >= n;
  });
}

export function listingMatchesPropertyTypeFilter(
  propertyType: string,
  title: string,
  description: string,
): boolean {
  if (!propertyType || propertyType === "all") return true;
  const blob = `${title} ${description}`.toLowerCase();
  if (propertyType === "Villa") return /\bvilla\b|\bvillas\b/i.test(blob);
  if (propertyType === "Apartment") return /\b(apartment|apt|penthouse|condo)\b/i.test(blob);
  if (propertyType === "Land") return /\b(land|plot|tanah)\b/i.test(blob);
  return true;
}

export function listingMatchesOwnershipFilter(
  ownership: string,
  rowOwnership: string | null | undefined,
  description: string,
): boolean {
  if (!ownership || ownership === "all") return true;
  const o = `${rowOwnership ?? ""} ${description}`.toLowerCase();
  if (ownership === "Freehold") return /\bfreehold\b/i.test(o);
  if (ownership === "Leasehold") return /\bleasehold\b/i.test(o);
  return true;
}

export function listingMatchesPriceFilter(
  priceMinUsd: number | null,
  priceMaxUsd: number | null,
  estimatePriceUsd: string | null | undefined,
  description: string,
): boolean {
  if (priceMinUsd === null && priceMaxUsd === null) return true;
  const price = inventoryListingPriceUsd(estimatePriceUsd, description);
  if (price === null) return true;
  if (priceMinUsd !== null && price < priceMinUsd) return false;
  if (priceMaxUsd !== null && price > priceMaxUsd) return false;
  return true;
}

function inferDevStatus(
  deliveryEstimate: string | null | undefined,
  description: string,
): "ready" | "off-plan" | null {
  const blob = `${deliveryEstimate ?? ""} ${description}`.slice(0, 4000).toLowerCase();
  if (/off[-\s]?plan|under construction|pre[-\s]?launch|groundbreaking|completion expected/i.test(blob)) {
    return "off-plan";
  }
  if (/\bready\b|turnkey|completed|move[-\s]?in/i.test(blob)) return "ready";
  if (deliveryEstimate?.trim()) return "ready";
  return null;
}

export function listingMatchesDevStatusFilter(
  devStatus: string,
  deliveryEstimate: string | null | undefined,
  description: string,
): boolean {
  if (!devStatus || devStatus === "all") return true;
  const inferred = inferDevStatus(deliveryEstimate, description);
  if (inferred === null) return true;
  return inferred === devStatus;
}

export function listingMatchesTextQuery(
  query: string,
  title: string,
  description: string,
  code: string,
  location?: string | null,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const ar = inferListingArea(title, description);
  return `${code} ${title} ${ar} ${location ?? ""}`.toLowerCase().includes(q);
}

export function inventoryListingMatchesSearch(
  row: Pick<
    PropertyInventoryListing,
    "title" | "description" | "code" | "location" | "ownership" | "estimatePriceUsd" | "deliveryEstimate"
  >,
  filters: PropertySearchFilterState,
): boolean {
  if (!listingMatchesAreaFilter(filters.area, row.title, row.description, row.location)) return false;
  if (!listingMatchesBedroomsFilter(filters.bedrooms, row.title, row.description)) return false;
  if (!listingMatchesPropertyTypeFilter(filters.propertyType, row.title, row.description)) return false;
  if (!listingMatchesOwnershipFilter(filters.ownership, row.ownership, row.description)) return false;
  if (
    !listingMatchesPriceFilter(
      filters.priceMinUsd,
      filters.priceMaxUsd,
      row.estimatePriceUsd,
      row.description,
    )
  ) {
    return false;
  }
  if (!listingMatchesDevStatusFilter(filters.devStatus, row.deliveryEstimate, row.description)) return false;
  if (!listingMatchesTextQuery(filters.listingQuery, row.title, row.description, row.code, row.location)) {
    return false;
  }
  return true;
}

export function searchFiltersAreActive(filters: PropertySearchFilterState): boolean {
  return (
    filters.area !== "all" ||
    filters.propertyType !== "all" ||
    filters.bedrooms !== "all" ||
    filters.ownership !== "all" ||
    filters.devStatus !== "all" ||
    filters.priceMinUsd !== null ||
    filters.priceMaxUsd !== null ||
    Boolean(filters.listingQuery.trim())
  );
}
