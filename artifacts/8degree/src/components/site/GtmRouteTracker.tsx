import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackGtmPageView } from "@/lib/gtm";

/** Fires GTM page_view on wouter navigations (initial load is handled by GTM container). */
export function GtmRouteTracker() {
  const [location] = useLocation();

  useEffect(() => {
    const path = location || "/";
    trackGtmPageView(path.startsWith("/") ? path : `/${path}`);
  }, [location]);

  return null;
}
