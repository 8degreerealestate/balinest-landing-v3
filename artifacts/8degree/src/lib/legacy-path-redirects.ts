/**
 * WordPress URLs that should redirect to the current React routes.
 * Used by the client router and `pnpm seo:build` (via scripts/seo).
 */
export const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  "/investment-consulting": "/invest",
  "/real-estate-for-sale": "/projects",
  "/completed-projects": "/projects/completed",
  "/our-story": "/about-us",
  "/our-story-2": "/about-us",
  "/land-for-sale": "/buy-land",
  "/ready-units": "/projects",
  "/buy": "/projects",
  "/off-plan-projects": "/projects",
};

/** Legacy nested invest URLs (e.g. /invest/freehold). */
export const INVEST_SUBPATH_REDIRECT = "/invest";
