import type { PropertySearchApplyPayload } from "@/components/site/PropertySearchPanel";
import type { PropertySearchFilterState } from "@/lib/property-search-filters";

export const PROJECTS_SEARCH_PATH = "/projects";

export function filtersFromSearchPayload(payload: PropertySearchApplyPayload): PropertySearchFilterState {
  return {
    area: payload.area,
    propertyType: payload.propertyType,
    bedrooms: payload.bedrooms,
    listingQuery: payload.listingQuery,
    ownership: payload.ownership ?? "all",
    devStatus: payload.devStatus ?? "all",
    priceMinUsd: payload.priceMinUsd ?? null,
    priceMaxUsd: payload.priceMaxUsd ?? null,
  };
}

export function filtersToSearchPayload(filters: PropertySearchFilterState): PropertySearchApplyPayload {
  return {
    area: filters.area,
    propertyType: filters.propertyType,
    bedrooms: filters.bedrooms,
    listingQuery: filters.listingQuery,
    ownership: filters.ownership,
    devStatus: filters.devStatus,
    priceMinUsd: filters.priceMinUsd,
    priceMaxUsd: filters.priceMaxUsd,
  };
}

export function projectsUrlFromSearchPayload(payload: PropertySearchApplyPayload): string {
  const params = new URLSearchParams();
  if (payload.area && payload.area !== "all") params.set("area", payload.area);
  if (payload.propertyType && payload.propertyType !== "all") params.set("type", payload.propertyType);
  if (payload.bedrooms && payload.bedrooms !== "all") params.set("bedrooms", payload.bedrooms);
  if (payload.ownership && payload.ownership !== "all") params.set("ownership", payload.ownership);
  if (payload.devStatus && payload.devStatus !== "all") params.set("status", payload.devStatus);
  if (payload.listingQuery.trim()) params.set("q", payload.listingQuery.trim());
  if (payload.priceMinUsd != null && payload.priceMinUsd > 0) {
    params.set("minPrice", String(payload.priceMinUsd));
  }
  if (payload.priceMaxUsd != null) params.set("maxPrice", String(payload.priceMaxUsd));
  const qs = params.toString();
  return qs ? `${PROJECTS_SEARCH_PATH}?${qs}` : PROJECTS_SEARCH_PATH;
}

export function searchPayloadFromLocationSearch(search: string): PropertySearchApplyPayload | null {
  if (!search || search === "?") return null;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if ([...params.keys()].length === 0) return null;

  const minRaw = params.get("minPrice");
  const maxRaw = params.get("maxPrice");

  return {
    area: params.get("area") ?? "all",
    propertyType: params.get("type") ?? "all",
    bedrooms: params.get("bedrooms") ?? "all",
    listingQuery: params.get("q") ?? "",
    ownership: params.get("ownership") ?? "all",
    devStatus: params.get("status") ?? "all",
    priceMinUsd: minRaw ? Number(minRaw) : null,
    priceMaxUsd: maxRaw ? Number(maxRaw) : null,
  };
}

export function replaceProjectsSearchUrl(payload: PropertySearchApplyPayload): void {
  const url = projectsUrlFromSearchPayload(payload);
  window.history.replaceState(null, "", url);
}
