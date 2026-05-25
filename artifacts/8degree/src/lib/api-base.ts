/** Origin only (scheme + host, optional port). Do not include `/api`; paths are appended as `/api/...`. */
const raw = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

if (import.meta.env.PROD && !raw && typeof console !== "undefined") {
  console.warn(
    "[8degree] VITE_API_BASE_URL is not set. The built app will call same-origin /api, which returns HTML on static hosts (e.g. Vercel) and breaks inventory/projects. In Vercel: Project → Settings → Environment Variables, set VITE_API_BASE_URL to your Express API origin (no trailing slash), then redeploy.",
  );
}

/**
 * Absolute origin for the Node API (no trailing slash).
 * Leave unset in local dev so Vite proxies `/api` to the api-server (same-origin).
 * In production (Vercel, WordPress static, etc.), set `VITE_API_BASE_URL` at **build time** to the Express host.
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
