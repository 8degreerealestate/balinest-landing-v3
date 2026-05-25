/** Public site origin for canonicals and OG URLs. Set in production via VITE_PUBLIC_SITE_URL (no trailing slash). */
export function getPublicSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function normalizeBasePath(): string {
  const raw = import.meta.env.BASE_URL || "/";
  if (raw === "/") return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

/** Absolute URL for the current deployment (includes Vite base path). */
export function canonicalUrl(pathname: string): string {
  const origin =
    getPublicSiteOrigin() || (typeof window !== "undefined" ? window.location.origin : "") || "http://localhost";
  const base = normalizeBasePath();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const joined = `${base}${path}`.replace(/\/{2,}/g, "/") || "/";
  return new URL(joined, `${origin}/`).href;
}

export function organizationJsonLdNode(): Record<string, unknown> {
  return {
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: canonicalUrl("/"),
    areaServed: { "@type": "AdministrativeArea", name: "Bali, Indonesia" },
  };
}

export function jsonLdGraph(nodes: Record<string, unknown>[]): Record<string, unknown> {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function toAbsoluteImageUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const origin = getPublicSiteOrigin() || (typeof window !== "undefined" ? window.location.origin : "");
  const base = normalizeBasePath();
  if (u.startsWith("/")) return `${origin}${base}${u}`.replace(/(?<!:)\/+/g, (m) => (m.length > 1 ? "/" : m));
  return u;
}

export const SITE_NAME = "8 Degree";
export const SITE_TAGLINE = "Luxury Bali real estate, developments, and investment advisory";

export const DEFAULT_TITLE = `${SITE_NAME} · ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  "Boutique Bali property advisory: luxury villas, developments, and listings. Portfolio, investment guidance, and curated opportunities across Seminyak, Canggu, Uluwatu, and beyond.";

export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1613490908578-7804bb61483b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

/** Keep meta descriptions in a typical SERP-friendly length. */
export function truncateForMeta(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).trimEnd();
  const safe = cut.replace(/[,;\s]+$/g, "");
  return `${safe}…`;
}
