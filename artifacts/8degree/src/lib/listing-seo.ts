import type { PropertyInventoryListing } from "@workspace/api-client-react";
import {
  borrowInventoryImages,
  inferListingArea,
  inferListingStatus,
  inventoryGalleryUrls,
  listingPriceLine,
  pickInventoryThumbnail,
  resolveLeaseYearsLabel,
} from "@/lib/portfolio-listing";
import { propertyListingPath } from "@/lib/site-paths";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  canonicalUrl,
  toAbsoluteImageUrl,
  truncateForMeta,
} from "@/lib/site-seo";

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

function formatOgImageUrl(raw: string | null | undefined, siteOrigin: string): string {
  const absolute = toAbsoluteImageUrl(raw, siteOrigin) ?? DEFAULT_OG_IMAGE;
  if (/images\.unsplash\.com/i.test(absolute)) {
    const url = new URL(absolute);
    url.searchParams.set("w", "1200");
    url.searchParams.set("h", "630");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", "80");
    return url.toString();
  }
  if (/drive\.google\.com\/thumbnail/i.test(absolute)) {
    const url = new URL(absolute);
    url.searchParams.set("sz", "w1200");
    return url.toString();
  }
  if (absolute.includes("/api/inventory/thumb/")) {
    return absolute.startsWith("http") ? absolute : `${siteOrigin.replace(/\/$/, "")}${absolute}`;
  }
  return absolute;
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
  options?: { siteOrigin?: string; imagePool?: PropertyInventoryListing[] },
): ListingOpenGraphMeta {
  const siteOrigin = options?.siteOrigin?.replace(/\/$/, "") || "https://8degree.co";
  const pool = options?.imagePool ?? [listing];
  const enriched = borrowInventoryImages(listing, pool);
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

  const gallery = inventoryGalleryUrls(enriched);
  const thumb = pickInventoryThumbnail(enriched);
  const imageRaw = gallery[0] ?? thumb;
  const image = formatOgImageUrl(imageRaw, siteOrigin);
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
  out = upsertMetaTag(out, "property", "og:image:width", "1200");
  out = upsertMetaTag(out, "property", "og:image:height", "630");
  out = upsertMetaTag(out, "property", "og:site_name", SITE_NAME);
  out = upsertMetaTag(out, "name", "twitter:card", "summary_large_image");
  out = upsertMetaTag(out, "name", "twitter:title", meta.title);
  out = upsertMetaTag(out, "name", "twitter:description", meta.description);
  out = upsertMetaTag(out, "name", "twitter:image", meta.image);
  out = upsertMetaTag(out, "name", "robots", meta.noindex ? "noindex, nofollow" : "index, follow");
  out = upsertLinkTag(out, "canonical", meta.url);
  return out;
}
