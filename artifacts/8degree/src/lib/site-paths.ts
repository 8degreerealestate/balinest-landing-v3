/**
 * Public URL paths aligned with the legacy WordPress site (8degree.co).
 * - Listings: /property/{code} (lowercase code in the bar)
 * - Journal articles: /{slug} (index stays at /journal)
 * - About: /about-us
 */

export const ABOUT_PATH = "/about-us";
export const JOURNAL_INDEX_PATH = "/journal";

/** First path segments that are app routes, not journal article slugs. */
export const RESERVED_ROOT_SLUGS = new Set([
  "admin",
  "api",
  "projects",
  "project",
  "property",
  "properties",
  "blog",
  "journal",
  "about",
  "about-us",
  "contact",
  "invest",
  "investment-guide",
  "sell",
  "buyer-agents",
  "buyer-agent",
  "seller-agents",
  "seller-agent",
  "legal-guide",
  "pricing",
  "buy-land",
  "favorite-properties",
  "frequently-asked-questions",
  "company-overview",
  "testimony",
  "legal-services",
  "legal-and-due-diligence",
  "data-driven",
  "bali-property-guide",
  "bali-location-guide",
  "location-guide",
  "long-term-rentals",
  "completed-projects",
  "real-estate-for-sale",
  "wp-content",
  "journal-media",
  "assets",
  "site-media",
  "brand",
  "balinest",
  "8-degree-real-estate-x-balinest-villa",
  "8-degree-real-estate-x-only-stays",
  "partner-landing-assets",
]);

export function normalizePropertyCodeInUrl(code: string): string {
  return code.replace(/\/+$/, "").trim().toLowerCase();
}

/** Canonical listing detail URL (legacy /property/8d25169/). */
export function propertyListingPath(code: string): string {
  return `/property/${encodeURIComponent(normalizePropertyCodeInUrl(code))}`;
}

/** Canonical journal article URL (legacy root slug, no /journal/ prefix). */
export function journalPostPath(slug: string): string {
  const s = slug.replace(/^\/+|\/+$/g, "");
  return `/${encodeURIComponent(s)}`;
}

export function isReservedRootSlug(slug: string): boolean {
  const key = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  return !key || RESERVED_ROOT_SLUGS.has(key);
}
