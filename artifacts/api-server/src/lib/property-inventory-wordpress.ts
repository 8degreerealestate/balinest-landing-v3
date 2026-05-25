/**
 * Optional WordPress REST → inventory listing rows (same shape as Google Sheet loader).
 *
 * Requires a CPT registered in REST (`show_in_rest => true`). Default collection segment is
 * `properties` (WP `rest_base`, e.g. 8degree.co → `/wp-json/wp/v2/properties`). Override with
 * `WORDPRESS_PROPERTY_POST_TYPE` for other installs. Houzez often exposes `property_meta` instead
 * of `meta` in the REST payload; both are read for price/location keys.
 */

import { logger } from "./logger";
import type { SheetListingRow } from "./property-inventory-sheet";
import { stableInventoryListingIdFromCode } from "./property-inventory-sheet";

let cache: { fetchedAt: number; rows: SheetListingRow[] } | null = null;
const CACHE_TTL_MS = 60_000;

export function clearPropertyInventoryWordPressCache(): void {
  cache = null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type WpRendered = { rendered: string };

type WpPost = {
  id: number;
  slug: string;
  status: string;
  link: string;
  date_gmt: string;
  modified_gmt: string;
  title: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  featured_media?: number;
  menu_order?: number;
  sticky?: boolean;
  meta?: Record<string, string | number | boolean | null>;
  /** Houzez REST often returns meta here with array-of-string values. */
  property_meta?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
};

function wordpressOrigin(): string | null {
  const o = process.env.WORDPRESS_ORIGIN?.trim().replace(/\/+$/, "");
  return o || null;
}

/** WP `rest_base` for the CPT (8degree.co uses `properties`; override via env for other sites). */
function restBaseSegment(): string {
  return process.env.WORDPRESS_PROPERTY_POST_TYPE?.trim() || "properties";
}

function restCollectionUrl(): string | null {
  const origin = wordpressOrigin();
  if (!origin) return null;
  const pt = restBaseSegment();
  return `${origin}/wp-json/wp/v2/${encodeURIComponent(pt)}`;
}

function basicAuthHeader(): string | null {
  const user = process.env.WORDPRESS_APP_USER?.trim();
  const pass = process.env.WORDPRESS_APP_PASSWORD?.trim();
  if (!user || !pass) return null;
  const token = Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

function inventoryDebugEnabled(): boolean {
  const v = process.env.PROPERTY_INVENTORY_DEBUG?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Unauthenticated WP REST only allows `status=publish`. Requesting draft/pending returns HTTP 400
 * (`rest_forbidden_status`). With Application Passwords, broader status lists are allowed.
 */
function resolvedWordPressPostStatusList(hasAuth: boolean): string {
  const raw = process.env.WORDPRESS_POST_STATUS?.trim();
  if (hasAuth) {
    return raw || "publish,draft,pending";
  }
  if (!raw || raw === "publish") {
    return "publish";
  }
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const nonPublish = parts.filter((s) => s !== "publish");
  if (nonPublish.length > 0) {
    logger.warn(
      { requested: raw },
      "WordPress inventory: without Application Password, WordPress rejects status lists that include draft/pending/private (HTTP 400). Using status=publish only.",
    );
  }
  return "publish";
}

function featuredImageUrl(post: WpPost): string | null {
  const emb = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  if (emb) return emb;
  return null;
}

/** Houzez / themes often expose price/location in meta — keys are site-specific. */
function metaString(meta: Record<string, string | number | boolean | null> | undefined, key: string): string | null {
  if (!meta || !(key in meta)) return null;
  const v = meta[key];
  if (v === null || v === undefined) return null;
  return String(v).trim() || null;
}

function normalizeMetaValue(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v) && v.length > 0) {
    const s = String(v[0]).trim();
    return s || null;
  }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    const s = String(v).trim();
    return s || null;
  }
  return null;
}

function metaFromPost(post: WpPost, key: string): string | null {
  const fromMeta = metaString(post.meta, key);
  if (fromMeta) return fromMeta;
  const pm = post.property_meta;
  if (pm && key in pm) return normalizeMetaValue(pm[key]);
  return null;
}

function buildDescription(post: WpPost): string {
  const parts: string[] = [];
  const img = featuredImageUrl(post);
  if (img) {
    parts.push(`Featured image: ${img}`);
  }
  const priceKey = process.env.WORDPRESS_PRICE_META_KEY?.trim() || "fave_property_price";
  const locKey = process.env.WORDPRESS_LOCATION_META_KEY?.trim() || "fave_property_location";
  const price = metaFromPost(post, priceKey);
  const loc = metaFromPost(post, locKey);
  if (price) parts.push(`Price: ${price}`);
  if (loc) parts.push(`Location: ${loc}`);
  if (post.sticky) parts.push("Featured listing: yes");

  const body = stripHtml(post.excerpt?.rendered || "") || stripHtml(post.content?.rendered || "");
  if (body) parts.push(body);

  const joined = parts.join("\n\n").slice(0, 100_000);
  return joined || stripHtml(post.title.rendered);
}

function mapPost(post: WpPost, index: number): SheetListingRow {
  const code = (post.slug || `wp-${post.id}`).slice(0, 64);
  const title = stripHtml(post.title.rendered).slice(0, 500) || code;
  const listingUrl = post.link?.trim() || null;
  const description = buildDescription(post);
  const channel: "silent" | "website" = post.status === "publish" ? "website" : "silent";
  const sortOrder = typeof post.menu_order === "number" ? post.menu_order : index * 10;
  const toIso = (gmt: string | undefined) => {
    if (!gmt) return new Date().toISOString();
    const s = gmt.includes("T") ? gmt.trim() : gmt.trim().replace(" ", "T");
    if (/Z|[+-]\d{2}:?\d{2}$/.test(s)) return s;
    return `${s}Z`;
  };
  const createdAt = toIso(post.date_gmt);
  const updatedAt = toIso(post.modified_gmt) || createdAt;

  return {
    id: stableInventoryListingIdFromCode(code),
    code,
    sourceUrl: listingUrl,
    name: title,
    redirectUrl: null,
    title,
    imageUrl: featuredImageUrl(post),
    imageUrls: featuredImageUrl(post) ? [featuredImageUrl(post)!] : [],
    ownership: null,
    location: null,
    estimatePriceUsd: null,
    deliveryEstimate: null,
    landSizeSqm: null,
    buildingSizeSqm: null,
    br: null,
    ba: null,
    listingUrl,
    description,
    channel,
    sortOrder,
    createdAt,
    updatedAt,
  };
}

export async function loadListingsFromWordPress(options?: {
  forceRefresh?: boolean;
}): Promise<SheetListingRow[] | null> {
  const base = restCollectionUrl();
  if (!base) {
    logger.warn("WordPress inventory: WORDPRESS_ORIGIN is not set");
    return null;
  }

  const now = Date.now();
  if (!options?.forceRefresh && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rows.length > 0 ? cache.rows : null;
  }

  const perPage = Math.min(
    100,
    Math.max(1, Number(process.env.WORDPRESS_PER_PAGE || "100") || 100),
  );
  const maxPages = Math.min(
    50,
    Math.max(1, Number(process.env.WORDPRESS_MAX_PAGES || "20") || 20),
  );
  const auth = basicAuthHeader();
  const statusList = resolvedWordPressPostStatusList(Boolean(auth));

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "8degree-inventory-sync/1.0",
  };
  if (auth) headers.Authorization = auth;

  const all: WpPost[] = [];

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = new URL(base);
      url.searchParams.set("per_page", String(perPage));
      url.searchParams.set("page", String(page));
      url.searchParams.set("status", statusList);
      url.searchParams.set("_embed", "1");
      if (process.env.WORDPRESS_REST_CONTEXT?.trim()) {
        url.searchParams.set("context", process.env.WORDPRESS_REST_CONTEXT.trim());
      }

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 25_000);
      const res = await fetch(url.toString(), { headers, signal: controller.signal, redirect: "follow" });
      clearTimeout(t);

      if (res.status === 404) {
        logger.warn(
          { url: base, restBase: restBaseSegment() },
          "WordPress inventory: REST collection not found (404). For 8degree.co use rest_base `properties`; override with WORDPRESS_PROPERTY_POST_TYPE if your CPT differs.",
        );
        return null;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const forbiddenStatus =
          body.includes("rest_forbidden_status") || body.includes("Status is forbidden");
        logger.warn(
          {
            status: res.status,
            url: url.toString(),
            snippet: body.slice(0, 400),
            ...(forbiddenStatus
              ? {
                  hint: "Without auth, only status=publish is valid; with auth use WORDPRESS_APP_USER + WORDPRESS_APP_PASSWORD for draft/pending.",
                }
              : {}),
          },
          forbiddenStatus
            ? "WordPress inventory: REST rejected the status parameter (common when requesting draft/pending without Application Password)."
            : "WordPress inventory: REST request failed (401/403 usually means enable Application Passwords or cookie auth)",
        );
        return null;
      }

      const batch = (await res.json()) as unknown;
      if (!Array.isArray(batch)) {
        const snippet =
          typeof batch === "object" && batch !== null
            ? JSON.stringify(batch).slice(0, 400)
            : String(batch).slice(0, 200);
        logger.warn(
          { page, url: url.toString(), snippet },
          "WordPress inventory: expected JSON array of posts from REST; got unexpected shape (often a WP error object).",
        );
        return null;
      }
      if (batch.length === 0) break;

      if (page === 1) {
        const first = batch[0] as unknown;
        const bad =
          typeof first !== "object" ||
          first === null ||
          !("title" in first) ||
          typeof (first as { title?: unknown }).title !== "object" ||
          (first as { title?: { rendered?: unknown } }).title === null ||
          typeof (first as { title?: { rendered?: unknown } }).title?.rendered !== "string";
        if (bad) {
          logger.warn(
            { url: url.toString(), keys: typeof first === "object" && first ? Object.keys(first).slice(0, 20) : [] },
            "WordPress inventory: first item missing title.rendered — response may not be property posts.",
          );
          return null;
        }
        if (inventoryDebugEnabled()) {
          logger.info(
            {
              wpUrl: url.toString(),
              httpStatus: res.status,
              batchSize: batch.length,
              statusParam: statusList,
              hasAuth: Boolean(auth),
            },
            "WordPress inventory: first page OK (PROPERTY_INVENTORY_DEBUG)",
          );
        }
      }

      all.push(...batch);
      if (batch.length < perPage) break;
    }
  } catch (err) {
    logger.warn({ err, base }, "WordPress inventory: fetch error");
    return null;
  }

  if (all.length === 0) {
    logger.warn({ base }, "WordPress inventory: zero posts returned");
    return null;
  }

  const rows = all.map((p, i) => mapPost(p, i));
  cache = { fetchedAt: Date.now(), rows };
  logger.info({ base, count: rows.length }, "WordPress inventory: loaded OK");
  if (inventoryDebugEnabled()) {
    logger.info(
      { base, mappedRowCount: rows.length, statusParam: statusList, hasAuth: Boolean(auth) },
      "WordPress inventory: load complete (PROPERTY_INVENTORY_DEBUG)",
    );
  }
  return rows;
}
