import type { PropertySearchApplyPayload } from "@/components/site/PropertySearchPanel";
import type { PropertySearchFilterState } from "@/lib/property-search-filters";

export const PROJECTS_SEARCH_PATH = "/projects";
/** sessionStorage key for the last /projects URL (incl. filters + page). */
export const LAST_PROJECTS_URL_KEY = "site.lastProjectsUrl";

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

export type ProjectsUrlOptions = {
  /** 0-indexed page; only written to the URL when > 0 (1-indexed `page` query). */
  pageIndex?: number;
};

/** Read 0-indexed listing page from `?page=` (1-indexed in the URL). */
export function pageIndexFromLocationSearch(search: string): number {
  if (!search || search === "?") return 0;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = params.get("page");
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 0;
  return n - 1;
}

export function projectsUrlFromSearchPayload(
  payload: PropertySearchApplyPayload,
  options?: ProjectsUrlOptions,
): string {
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
  // Omit max when it is the open-ended sales ceiling so URLs stay clean.
  if (payload.priceMaxUsd != null && payload.priceMaxUsd < 3_000_000) {
    params.set("maxPrice", String(payload.priceMaxUsd));
  }
  const pageIndex = options?.pageIndex ?? 0;
  if (pageIndex > 0) params.set("page", String(pageIndex + 1));
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

export function replaceProjectsSearchUrl(
  payload: PropertySearchApplyPayload,
  options?: ProjectsUrlOptions,
): void {
  const url = projectsUrlFromSearchPayload(payload, options);
  window.history.replaceState(null, "", url);
  rememberProjectsUrl(url);
}

/** Persist the portfolio URL so listing-detail back can restore filters + page. */
export function rememberProjectsUrl(url?: string): void {
  if (typeof window === "undefined") return;
  const value = url ?? `${window.location.pathname}${window.location.search}`;
  if (!value.startsWith(PROJECTS_SEARCH_PATH)) return;
  try {
    window.sessionStorage.setItem(LAST_PROJECTS_URL_KEY, value);
  } catch {
    // ignore quota / private mode
  }
}

export function readRememberedProjectsUrl(): string {
  if (typeof window === "undefined") return PROJECTS_SEARCH_PATH;
  try {
    const value = window.sessionStorage.getItem(LAST_PROJECTS_URL_KEY);
    if (value && value.startsWith(PROJECTS_SEARCH_PATH)) return value;
  } catch {
    // ignore
  }
  return PROJECTS_SEARCH_PATH;
}
