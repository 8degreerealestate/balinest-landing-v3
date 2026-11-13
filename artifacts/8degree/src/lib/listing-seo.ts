import type { PropertyInventoryListing } from "@workspace/api-client-react";
import {
  inferListingArea,
  inferListingStatus,
  listingPriceLine,
  resolveLeaseYearsLabel,
} from "@/lib/portfolio-listing";
import { propertyListingPath } from "@/lib/site-paths";
import { SITE_NAME, canonicalUrl, truncateForMeta } from "@/lib/site-seo";

export type ListingOpenGraphMeta = {
  pageTitle: string;
  title: string;
  description: string;
  canonicalPath: string;
  url: string;
  image: string;
  noindex: boolean;
};

const SOCIAL_CRAWLER_RE =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Googlebot|bingbot|Applebot/i;

export function isSocialCrawler(userAgent: string | null | undefined): boolean {
  return SOCIAL_CRAWLER_RE.test(userAgent ?? "");
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Resolved live by the API (first photo that loads, size-capped for WhatsApp),
 * so previews don't break when Drive files change after a build.
 */
function listingOgImageUrl(code: string, siteOrigin: string): string {
  return `${siteOrigin.replace(/\/$/, "")}/api/inventory/listings/${encodeURIComponent(code.trim().toUpperCase())}/og-image`;
}

function formatLandSize(listing: PropertyInventoryListing): string | null {
  const raw = listing.landSizeSqm?.trim();
  if (!raw) return null;
  const normalized = raw.replace(/,/g, "").trim();
  if (!normalized) return null;
  if (/\bm²\b|m2|sqm/i.test(raw)) return raw;
  return `${raw} m² land`;
}

function formatListingPriceForMeta(listing: PropertyInventoryListing): string {
  const raw = listing.estimatePriceUsd?.trim();
  if (raw) {
    const n = Number(raw.replace(/,/g, ""));
    if (!Number.isNaN(n) && n > 0) {
      return `From USD ${n.toLocaleString("en-US")}`;
    }
  }
  return listingPriceLine(listing.description);
}

/** Build Open Graph / Twitter metadata for a property listing detail page. */
export function buildListingOpenGraph(
  listing: PropertyInventoryListing,
  options?: { siteOrigin?: string },
): ListingOpenGraphMeta {
  const siteOrigin = options?.siteOrigin?.replace(/\/$/, "") || "https://8degree.co";
  const area = listing.location?.trim() || inferListingArea(listing.title, listing.description);
  const ownership =
    listing.ownership?.trim() || inferListingStatus(listing.description) || null;
  const leaseLabel = resolveLeaseYearsLabel(
    listing.leaseYears,
    listing.title,
    listing.description,
    ownership,
    listing.deliveryEstimate,
  );
  const land = formatLandSize(listing);
  const price = formatListingPriceForMeta(listing);

  const detailParts = [area, ownership, leaseLabel, land, price].filter(
    (part): part is string => Boolean(part && part !== "—"),
  );
  const description = truncateForMeta(
    detailParts.length > 0 ? detailParts.join(" · ") : listing.title || listing.code,
  );

  const title = listing.title?.trim() || listing.code;
  const pageTitle = title.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? title
    : `${title} | ${SITE_NAME}`;

  const image = listingOgImageUrl(listing.code, siteOrigin);
  const canonicalPath = propertyListingPath(listing.code);
  const noindex =
    listing.channel === "silent" ||
    listing.visibility === "draft" ||
    listing.saleStatus === "sold";

  return {
    pageTitle,
    title,
    description,
    canonicalPath,
    url: canonicalUrl(canonicalPath, siteOrigin),
    image,
    noindex,
  };
}

function upsertMetaTag(html: string, attr: "name" | "property", key: string, content: string): string {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = `<meta ${attr}="${key}" content="${escapeHtmlAttr(content)}">`;
  const re = new RegExp(`<meta\\s+${attr}=["']${escapedKey}["'][^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertLinkTag(html: string, rel: string, href: string): string {
  const escapedRel = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = `<link rel="${rel}" href="${escapeHtmlAttr(href)}">`;
  const re = new RegExp(`<link\\s+rel=["']${escapedRel}["'][^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

/** Inject listing-specific head tags into the SPA shell HTML (for crawlers + prerender). */
export function injectListingOpenGraphIntoHtml(html: string, meta: ListingOpenGraphMeta): string {
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttr(meta.pageTitle)}</title>`);
  out = upsertMetaTag(out, "name", "description", meta.description);
  out = upsertMetaTag(out, "property", "og:title", meta.title);
  out = upsertMetaTag(out, "property", "og:description", meta.description);
  out = upsertMetaTag(out, "property", "og:url", meta.url);
  out = upsertMetaTag(out, "property", "og:type", "website");
  out = upsertMetaTag(out, "property", "og:image", meta.image);
  out = upsertMetaTag(out, "property", "og:image:secure_url", meta.image);
  out = upsertMetaTag(out, "property", "og:image:alt", meta.title);
  out = upsertMetaTag(out, "property", "og:site_name", SITE_NAME);
  out = upsertMetaTag(out, "name", "twitter:card", "summary_large_image");
  out = upsertMetaTag(out, "name", "twitter:title", meta.title);
  out = upsertMetaTag(out, "name", "twitter:description", meta.description);
  out = upsertMetaTag(out, "name", "twitter:image", meta.image);
  out = upsertMetaTag(out, "name", "robots", meta.noindex ? "noindex, nofollow" : "index, follow");
  out = upsertLinkTag(out, "canonical", meta.url);
  return out;
}
