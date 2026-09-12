/** Google Tag Manager — GA4 (G-YVHE230FXC) and Meta pixel are configured inside GTM. */
export const GTM_CONTAINER_ID =
  import.meta.env.VITE_GTM_ID?.trim() || "GTM-KW37FZ3F";

/** Documented GA4 measurement ID (configured in GTM, not loaded directly in code). */
export const GA4_MEASUREMENT_ID =
  import.meta.env.VITE_GA4_ID?.trim() || "G-YVHE230FXC";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function isGtmEnabled(): boolean {
  return Boolean(GTM_CONTAINER_ID);
}

/** Push a virtual page view for client-side route changes (SPA). */
export function trackGtmPageView(path: string): void {
  if (!isGtmEnabled() || typeof window === "undefined") return;
  if (path.startsWith("/admin")) return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "page_view",
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
}
