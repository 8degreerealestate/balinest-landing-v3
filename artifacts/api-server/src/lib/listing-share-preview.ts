/**
 * Link-preview (Open Graph) support for property listings.
 *
 * WhatsApp and similar apps fetch `og:image` once, with a short timeout, and
 * silently drop images that 404 or are much over ~300KB — they then show only
 * the site icon. Drive folder scans can also list non-image files (videos,
 * PDFs) first, so the "first photo" must be verified before use.
 */
import { logger } from "./logger";

const DRIVE_FETCH_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Stay under WhatsApp's practical preview-image limit. */
export const SHARE_IMAGE_MAX_BYTES = 290 * 1024;
const DRIVE_SHARE_SIZES = ["w800", "w640", "w480"] as const;
const MAX_CANDIDATES = 8;
const FETCH_TIMEOUT_MS = 8_000;

export const DEFAULT_SHARE_IMAGE =
  "https://images.unsplash.com/photo-1613490908578-7804bb61483b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80";

export type ShareImage = { body: Buffer; contentType: string };

export type ShareableListing = {
  code: string;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  ownership?: string | null;
  leaseYears?: string | null;
  landSizeSqm?: string | null;
  estimatePriceUsd?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  channel?: string | null;
  visibility?: string | null;
  saleStatus?: string | null;
};

/** Drive file ids are 25+ chars; shorter tokens from folder scrapes are not files. */
function driveFileIdFromUrl(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/thumbnail\?[^#]*\bid=([a-zA-Z0-9_-]{25,})/i,
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{25,})/i,
    /drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([a-zA-Z0-9_-]{25,})/i,
    /\/api\/inventory\/thumb\/([a-zA-Z0-9_-]{25,})/i,
  ];
  for (const re of patterns) {
    const m = re.exec(url);
    if (m?.[1]) return m[1];
  }
  return null;
}

type ImageCandidate = { kind: "drive"; fileId: string } | { kind: "url"; url: string };

export function listingShareImageCandidates(listing: ShareableListing): ImageCandidate[] {
  const raw = [listing.imageUrl, ...(Array.isArray(listing.imageUrls) ? listing.imageUrls : [])]
    .map((u) => (u ?? "").trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: ImageCandidate[] = [];
  for (const url of raw) {
    if (/drive\.google\.com\/drive\/folders\//i.test(url)) continue;
    const fileId = driveFileIdFromUrl(url);
    const key = fileId ?? url;
    if (seen.has(key)) continue;
    seen.add(key);
    if (fileId) out.push({ kind: "drive", fileId });
    else if (/^https?:\/\//i.test(url) && !/drive\.google\.com/i.test(url)) out.push({ kind: "url", url });
    if (out.length >= MAX_CANDIDATES) break;
  }
  return out;
}

async function fetchImage(url: string): Promise<ShareImage | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": DRIVE_FETCH_USER_AGENT, Accept: "image/*,*/*;q=0.8" },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!/^image\//i.test(contentType)) return null;
    return { body: Buffer.from(await res.arrayBuffer()), contentType };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Smallest-acceptable Drive thumbnail: try 800px, shrink until under the size cap. */
async function fetchDriveShareImage(fileId: string): Promise<ShareImage | null> {
  let smallest: ShareImage | null = null;
  for (const sz of DRIVE_SHARE_SIZES) {
    const img = await fetchImage(`https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}`);
    // Not an image (video / PDF / removed file) — no point trying smaller sizes.
    if (!img) return smallest;
    if (img.body.length <= SHARE_IMAGE_MAX_BYTES) return img;
    smallest = img;
  }
  return smallest;
}

/** First listing photo that actually loads as an image, sized for link previews. */
export async function resolveListingShareImage(listing: ShareableListing): Promise<ShareImage | null> {
  let oversizedFallback: ShareImage | null = null;
  for (const candidate of listingShareImageCandidates(listing)) {
    const img =
      candidate.kind === "drive"
        ? await fetchDriveShareImage(candidate.fileId)
        : await fetchImage(candidate.url);
    if (!img) continue;
    if (img.body.length <= SHARE_IMAGE_MAX_BYTES) return img;
    oversizedFallback ??= img;
  }
  if (!oversizedFallback) {
    logger.warn({ code: listing.code }, "listing share image: no loadable photo");
  }
  return oversizedFallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatLand(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/m²|m2|sqm/i.test(t)) return t;
  return `${t} m² land`;
}

function formatPrice(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  const n = Number(t.replace(/,/g, ""));
  if (Number.isFinite(n) && n > 0) return `From USD ${n.toLocaleString("en-US")}`;
  return t;
}

/** e.g. "Pererenan · Freehold · 274 m² land · From USD 778,000" */
export function listingShareDescription(listing: ShareableListing): string {
  const ownership = listing.ownership?.trim() || null;
  const lease = ownership && /leasehold/i.test(ownership) ? listing.leaseYears?.trim() || null : null;
  const parts = [
    listing.location?.trim() || null,
    ownership,
    lease,
    formatLand(listing.landSizeSqm),
    formatPrice(listing.estimatePriceUsd),
  ].filter((p): p is string => Boolean(p));
  const text = parts.length > 0 ? parts.join(" · ") : listing.title?.trim() || listing.code;
  return text.length > 200 ? `${text.slice(0, 197)}…` : text;
}

export function listingShareImageUrl(siteOrigin: string, code: string): string {
  return `${siteOrigin.replace(/\/$/, "")}/api/inventory/listings/${encodeURIComponent(code.trim().toUpperCase())}/og-image`;
}

/** Minimal HTML for link-preview crawlers when no prerendered page exists. */
export function renderListingShareHtml(listing: ShareableListing, siteOrigin: string): string {
  const origin = siteOrigin.replace(/\/$/, "");
  const title = listing.title?.trim() || listing.code;
  const pageTitle = /8 degree/i.test(title) ? title : `${title} | 8 Degree`;
  const description = listingShareDescription(listing);
  const url = `${origin}/property/${listing.code.trim().toLowerCase()}`;
  const image = listingShareImageUrl(origin, listing.code);
  const noindex =
    listing.channel === "silent" || listing.visibility === "draft" || listing.saleStatus === "sold";
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${d}">
<meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow"}">
<link rel="canonical" href="${escapeHtml(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="8 Degree">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:secure_url" content="${escapeHtml(image)}">
<meta property="og:image:alt" content="${t}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body><a href="${escapeHtml(url)}">${t}</a></body>
</html>`;
}
