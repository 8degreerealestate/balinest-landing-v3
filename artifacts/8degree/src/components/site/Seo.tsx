import { useLayoutEffect } from "react";
import { useLocation } from "wouter";
import {
  canonicalUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  toAbsoluteImageUrl,
  truncateForMeta,
} from "@/lib/site-seo";

const LD_ID = "8degree-page-jsonld";

export type SeoProps = {
  title: string;
  description: string;
  /** Path for canonical (e.g. `/projects`). Defaults to current location. */
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null;
  /** Admin, drafts, or error states */
  noindex?: boolean;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const sel = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(sel) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  const sel = `link[rel="${CSS.escape(rel)}"]`;
  let el = document.head.querySelector(sel) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | null | undefined) {
  document.getElementById(LD_ID)?.remove();
  if (data == null) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = LD_ID;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function applyDefaults() {
  document.title = DEFAULT_TITLE;
  upsertMeta("name", "description", DEFAULT_DESCRIPTION);
  upsertMeta("property", "og:title", DEFAULT_TITLE);
  upsertMeta("property", "og:description", DEFAULT_DESCRIPTION);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", DEFAULT_TITLE);
  upsertMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
  upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
  upsertMeta("name", "robots", "index, follow");
  if (typeof window !== "undefined") {
    upsertLink("canonical", canonicalUrl(window.location.pathname || "/"));
  }
  setJsonLd(null);
}

function formatTitle(title: string): string {
  const t = title.trim();
  if (!t) return DEFAULT_TITLE;
  if (t.toLowerCase().includes(SITE_NAME.toLowerCase())) return t;
  return `${t} | ${SITE_NAME}`;
}

/**
 * Updates document head for crawlers and social previews. Resets to site defaults on unmount
 * so client navigations do not leak the previous page’s metadata.
 */
export function Seo({
  title,
  description,
  path: pathProp,
  image,
  type = "website",
  jsonLd,
  noindex,
}: SeoProps) {
  const [location] = useLocation();
  const path = pathProp ?? (location.split("?")[0] || "/");

  useLayoutEffect(() => {
    const pageTitle = formatTitle(title);
    const desc = truncateForMeta(description.trim() || DEFAULT_DESCRIPTION);
    const url = canonicalUrl(path);
    const ogImage = toAbsoluteImageUrl(image) ?? DEFAULT_OG_IMAGE;

    document.title = pageTitle;
    upsertMeta("name", "description", desc);
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", ogImage);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", url);
    setJsonLd(jsonLd ?? null);

    return () => applyDefaults();
  }, [title, description, path, image, type, jsonLd, noindex]);

  return null;
}
