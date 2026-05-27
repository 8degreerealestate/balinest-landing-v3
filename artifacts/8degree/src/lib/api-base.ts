/** Origin only (scheme + host, optional port). Do not include `/api`; paths are appended as `/api/...`. */
const raw = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

if (import.meta.env.PROD && !raw && typeof console !== "undefined") {
  console.warn(
    "[8degree] VITE_API_BASE_URL is not set. The app will call same-origin /api. That is correct on Vercel when 8degree.co DNS points here; it fails if the domain still serves WordPress. Optional: set VITE_API_BASE_URL to a dedicated API host, then redeploy.",
  );
}

/**
 * Absolute origin for the Node API (no trailing slash).
 * Leave unset in local dev so Vite proxies `/api` to the api-server (same-origin).
 * On Vercel (same deployment as the API), leave unset. On a separate static host, set at **build time**.
 */
export function getApiBaseUrl(): string {
  return raw;
}

/** Same-origin `/api/...` in dev; `https://your-api-host/api/...` when `VITE_API_BASE_URL` is set. */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}
