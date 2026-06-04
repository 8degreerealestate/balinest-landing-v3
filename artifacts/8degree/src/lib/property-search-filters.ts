import type { PropertyInventoryListing } from "@workspace/api-client-react";
import { inferBedroomsBucket, inferListingArea, inventoryListingPriceUsd } from "@/lib/portfolio-listing";

/** Sub-areas in the search UI that roll up to a broader inferred region. */
const SUB_AREA_PARENT: Record<string, string> = {
  Melasti: "Uluwatu",
  Bingin: "Uluwatu",
  Pecatu: "Uluwatu",
  Pandawa: "Uluwatu",
  Ungasan: "Uluwatu",
  "Padang Padang": "Uluwatu",
  Balangan: "Uluwatu",
  Dreamland: "Uluwatu",
  Jimbaran: "Uluwatu",
  Bukit: "Uluwatu",
  Berawa: "Canggu",
  Pererenan: "Canggu",
  "Batu Bolong": "Canggu",
  Padonan: "Canggu",
  Babakan: "Canggu",
  Seseh: "Canggu",
  Cemagi: "Canggu",
  Mengening: "Canggu",
};

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
  const needle = filterArea.toLowerCase();
  if (hay.toLowerCase().includes(needle)) return true;

  const loc = (location ?? "").trim();
  if (loc && loc.toLowerCase() === needle) return true;

  const inferred = inferListingArea(title, description);
  if (inferred === filterArea) return true;

  const parent = SUB_AREA_PARENT[filterArea];
  if (parent && inferred === parent && hay.toLowerCase().includes(needle)) return true;

  if (filterArea === "Others") {
    const known = ["Uluwatu", "Canggu", "Umalas", "Seminyak", "Ubud", "Tabanan", "Sanur", "Nusa Dua"];
    return !known.some((k) => hay.includes(k) || inferred === k);
  }

  return false;
}

export function listingMatchesBedroomsFilter(
  bedrooms: string,
  title: string,
  description: string,
): boolean {
  if (!bedrooms || bedrooms === "all") return true;
  const n = inferBedroomsBucket(title, description);
  if (n === null) return true;
  if (bedrooms === "4") return n >= 4;
  if (bedrooms === "6+") return n >= 6;
  return Number(bedrooms) === n;
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
