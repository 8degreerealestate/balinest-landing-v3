/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Express API origin only, e.g. `https://api.example.com` (no path, no trailing slash). */
  readonly VITE_API_BASE_URL?: string;
  /** Public site origin for canonicals, Open Graph, and build-time sitemap (no trailing slash). */
  readonly VITE_PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
