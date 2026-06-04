/**
 * Property inventory API — Google Sheet (default) + optional Postgres overrides.
 * Does not read from WordPress; listing images come from sheet cells / Drive folder URLs.
 */
import { Router, type Request, type Response } from "express";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  isDatabaseConfigured,
  getPool,
  projectsTable,
  unitsTable,
  propertyInventoryTable,
  inventoryListingMetaTable,
} from "@workspace/db";
import {
  clearPropertyInventorySheetCache,
  enrichListingRowWithDriveImages,
  loadListingsFromGoogleSheet,
  useSheetAsInventorySource,
} from "../lib/property-inventory-sheet";
import type { SheetListingRow } from "../lib/property-inventory-sheet";
import { logger } from "../lib/logger";

const router = Router();

function inventoryListingsDebugEnabled(): boolean {
  const v = process.env.PROPERTY_INVENTORY_DEBUG?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function setInventoryListingsSourceHeader(res: Response, source: string): void {
  if (!inventoryListingsDebugEnabled()) return;
  res.setHeader("X-8degree-Inventory-Source", source);
}

function setInventoryResponseCacheHeaders(res: Response, forceExternalRefresh: boolean): void {
  if (forceExternalRefresh) {
    res.setHeader("Cache-Control", "no-store");
    return;
  }
  // Cache at the edge to reduce serverless cold starts and sheet round-trips.
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.setHeader("CDN-Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
}

function getPgOrSystemErrorCode(error: unknown): string | undefined {
  let cur: unknown = error;
  for (let i = 0; i < 10 && cur; i++) {
    if (typeof cur === "object" && cur !== null && "code" in cur) {
      const c = (cur as { code: unknown }).code;
      if (typeof c === "string" && c.length > 0) return c;
    }
    cur =
      typeof cur === "object" && cur !== null && "cause" in cur
        ? (cur as { cause: unknown }).cause
        : undefined;
  }
  return undefined;
}

function isUndefinedTableError(error: unknown): boolean {
  return getPgOrSystemErrorCode(error) === "42P01";
}

function isDbUnreachableError(error: unknown): boolean {
  const c = getPgOrSystemErrorCode(error);
  return (
    c === "ECONNREFUSED" ||
    c === "ETIMEDOUT" ||
    c === "ENOTFOUND" ||
    c === "EAI_AGAIN" ||
    c === "ECONNRESET"
  );
}

/** Postgres / pool errors where falling back to sheet-only or empty list is better than HTTP 500. */
function isPostgresAvailabilityOrAuthError(error: unknown): boolean {
  const c = getPgOrSystemErrorCode(error);
  if (!c) return false;
  return new Set([
    "28P01", // invalid_password
    "28000", // invalid_authorization_specification
    "3D000", // invalid_catalog_name
    "57P01", // admin_shutdown
    "57P03", // cannot_connect_now
    "53300", // too_many_connections
    "08006", // connection_failure
    "08001", // sqlclient_unable_to_establish_sqlconnection
    "08004", // sqlserver_rejected_establishment_of_sqlconnection
  ]).has(c);
}

let inventoryListingMetaReady = false;

/**
 * Confirms Postgres is reachable and `inventory_listing_meta` exists (creates it when missing).
 * Returns false when the DB is down or meta cannot be used — callers must skip Drizzle meta queries.
 */
async function ensureInventoryListingMetaReady(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  if (inventoryListingMetaReady) return true;
  try {
    await getPool().query("select 1 from inventory_listing_meta limit 1");
    inventoryListingMetaReady = true;
    return true;
  } catch (first: unknown) {
    if (isDbUnreachableError(first)) {
      logger.warn({ err: first }, "inventory_listing_meta: postgres unreachable");
      return false;
    }
    if (!isUndefinedTableError(first)) {
      logger.warn({ err: first }, "inventory_listing_meta: unexpected probe error");
      return false;
    }
  }

  try {
    await getPool().query(`
      CREATE TABLE IF NOT EXISTS inventory_listing_meta (
        code TEXT PRIMARY KEY,
        featured BOOLEAN NOT NULL DEFAULT false,
        visibility TEXT NOT NULL DEFAULT 'active',
        sale_status TEXT NOT NULL DEFAULT 'available',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await getPool().query(`
      CREATE INDEX IF NOT EXISTS inventory_listing_meta_featured_idx
        ON inventory_listing_meta (featured)
        WHERE featured = true;
    `);
    await getPool().query("select 1 from inventory_listing_meta limit 1");
    inventoryListingMetaReady = true;
    return true;
  } catch (error: unknown) {
    logger.warn({ err: error }, "inventory_listing_meta: CREATE TABLE IF NOT EXISTS failed");
    return false;
  }
}

const listInventoryQuerySchema = z.object({
  channel: z.enum(["silent", "website"]).optional(),
  limit: z.coerce.number().int().min(1).max(2000).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  refreshSheet: z.string().optional(),
});

function orderedExternalRows(
  rows: SheetListingRow[],
  channel: "silent" | "website" | undefined,
): SheetListingRow[] {
  let filtered = rows;
  if (channel) {
    filtered = rows.filter((r) => r.channel === channel);
  }
  return [...filtered].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code),
  );
}

function jsonFromExternalRows(
  rows: SheetListingRow[],
  channel: "silent" | "website" | undefined,
  limit: number,
  offset: number,
): { listings: Array<ReturnType<typeof mapExternalRow>>; total: number } {
  const filtered = orderedExternalRows(rows, channel);
  const total = filtered.length;
  const slice = filtered.slice(offset, offset + limit).map(mapExternalRow);
  return { listings: slice, total };
}

type ListingRowJson = ReturnType<typeof mapExternalRow>;

function compactListingForListResponse(listing: ListingRowJson): ListingRowJson {
  const imageUrls = Array.isArray(listing.imageUrls) ? listing.imageUrls.slice(0, 8) : [];
  return {
    ...listing,
    imageUrls,
    imageUrl: listing.imageUrl ?? imageUrls[0] ?? null,
    description: (listing.description ?? "").slice(0, 420),
  };
}

function mapExternalRow(r: SheetListingRow) {
  return {
    id: r.id,
    code: r.code,
    sourceUrl: r.sourceUrl,
    name: r.name,
    redirectUrl: r.redirectUrl,
    title: r.title,
    imageUrl: r.imageUrl,
    imageUrls: r.imageUrls,
    ownership: r.ownership,
    location: r.location,
    estimatePriceUsd: r.estimatePriceUsd,
    deliveryEstimate: r.deliveryEstimate,
    landSizeSqm: r.landSizeSqm,
    buildingSizeSqm: r.buildingSizeSqm,
    br: r.br,
    ba: r.ba,
    level: r.level,
    zoning: r.zoning,
    livingRoom: r.livingRoom,
    listingUrl: r.listingUrl,
    description: r.description,
    channel: r.channel,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    featured: false,
    visibility: "active" as "active" | "draft",
    saleStatus: "available" as "available" | "sold",
    postedAt: r.updatedAt,
  };
}

type MetaRow = {
  featured: boolean;
  visibility: string;
  saleStatus: string;
  updatedAt: Date | null;
};

async function fetchInventoryMetaByCodes(codes: string[]): Promise<Map<string, MetaRow>> {
  const map = new Map<string, MetaRow>();
  if (codes.length === 0) return map;
  const ok = await ensureInventoryListingMetaReady();
  if (!ok) return map;
  try {
    const rows = await db
      .select()
      .from(inventoryListingMetaTable)
      .where(inArray(inventoryListingMetaTable.code, codes));
    for (const r of rows) {
      map.set(r.code, {
        featured: r.featured,
        visibility: r.visibility,
        saleStatus: r.saleStatus,
        updatedAt: r.updatedAt,
      });
    }
  } catch (error: unknown) {
    if (isUndefinedTableError(error) || isDbUnreachableError(error) || isPostgresAvailabilityOrAuthError(error)) {
      inventoryListingMetaReady = false;
      return map;
    }
    logger.warn({ err: error }, "inventory_listing_meta: select failed; returning listings without admin overrides");
    inventoryListingMetaReady = false;
    return map;
  }
  return map;
}

function mergeListingMeta(listing: ListingRowJson, meta: Map<string, MetaRow>): ListingRowJson {
  const m = meta.get(listing.code);
  if (!m) return listing;
  return {
    ...listing,
    featured: m.featured,
    visibility: m.visibility === "draft" ? "draft" : "active",
    saleStatus: m.saleStatus === "sold" ? "sold" : "available",
    postedAt: m.updatedAt?.toISOString() ?? listing.postedAt,
  };
}

async function mergeMetaIntoListings(listings: ListingRowJson[]): Promise<ListingRowJson[]> {
  try {
    const meta = await fetchInventoryMetaByCodes(listings.map((l) => l.code));
    return listings.map((l) => mergeListingMeta(l, meta));
  } catch (error: unknown) {
    logger.warn({ err: error }, "inventory listings: merge meta skipped (listings returned without admin overrides)");
    inventoryListingMetaReady = false;
    return listings;
  }
}

const inventoryDbRowSelect = {
  id: propertyInventoryTable.id,
  code: propertyInventoryTable.code,
  title: propertyInventoryTable.title,
  sourceUrl: sql<string | null>`null`,
  name: propertyInventoryTable.title,
  redirectUrl: sql<string | null>`null`,
  imageUrl: sql<string | null>`null`,
  imageUrls: sql<string[]>`ARRAY[]::text[]`,
  ownership: sql<string | null>`null`,
  location: sql<string | null>`null`,
  estimatePriceUsd: sql<string | null>`null`,
  deliveryEstimate: sql<string | null>`null`,
  landSizeSqm: sql<string | null>`null`,
  buildingSizeSqm: sql<string | null>`null`,
  br: sql<string | null>`null`,
  ba: sql<string | null>`null`,
  listingUrl: propertyInventoryTable.listingUrl,
  description: propertyInventoryTable.description,
  channel: propertyInventoryTable.channel,
  sortOrder: propertyInventoryTable.sortOrder,
  createdAt: propertyInventoryTable.createdAt,
  updatedAt: propertyInventoryTable.updatedAt,
};

function listingJsonFromDbRow(r: {
  id: string;
  code: string;
  title: string;
  sourceUrl: string | null;
  name: string;
  redirectUrl: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  ownership: string | null;
  location: string | null;
  estimatePriceUsd: string | null;
  deliveryEstimate: string | null;
  landSizeSqm: string | null;
  buildingSizeSqm: string | null;
  br: string | null;
  ba: string | null;
  listingUrl: string | null;
  description: string;
  channel: string;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}): ListingRowJson {
  return {
    id: r.id,
    code: r.code,
    sourceUrl: r.sourceUrl,
    name: r.name,
    redirectUrl: r.redirectUrl,
    title: r.title,
    imageUrl: r.imageUrl,
    imageUrls: r.imageUrls,
    ownership: r.ownership,
    location: r.location,
    estimatePriceUsd: r.estimatePriceUsd,
    deliveryEstimate: r.deliveryEstimate,
    landSizeSqm: r.landSizeSqm,
    buildingSizeSqm: r.buildingSizeSqm,
    br: r.br,
    ba: r.ba,
    level: null,
    zoning: null,
    livingRoom: null,
    listingUrl: r.listingUrl,
    description: r.description,
    channel: r.channel as "silent" | "website",
    sortOrder: r.sortOrder,
    createdAt: r.createdAt?.toISOString() ?? "",
    updatedAt: r.updatedAt?.toISOString() ?? "",
    featured: false,
    visibility: "active" as "active" | "draft",
    saleStatus: "available" as "available" | "sold",
    postedAt: r.updatedAt?.toISOString() ?? "",
  };
}

/** CRM codes are alphanumeric; URLs often use lowercase (legacy WordPress links). */
function inventoryListingCodeKey(code: string): string {
  return code.trim().toUpperCase();
}

async function findListingByCode(code: string): Promise<ListingRowJson | null> {
  const normalized = code.trim();
  const codeKey = inventoryListingCodeKey(normalized);
  const rawSource = (process.env.PROPERTY_INVENTORY_SOURCE || "").trim().toLowerCase();
  const databaseOnly =
    rawSource === "database" || rawSource === "db" || rawSource === "postgres";

  if (!databaseOnly && useSheetAsInventorySource()) {
    const fromSheet = await loadListingsFromGoogleSheet({
      forceRefresh: false,
      resolveDriveImages: false,
    });
    if (fromSheet && fromSheet.length > 0) {
      const hit = fromSheet.find((r) => inventoryListingCodeKey(r.code) === codeKey);
      if (hit) {
        let row: SheetListingRow = hit;
        try {
          row = await enrichListingRowWithDriveImages(hit);
        } catch (err) {
          logger.warn({ err, code: normalized }, "inventory listing detail: drive enrich failed");
        }
        const merged = await mergeMetaIntoListings([mapExternalRow(row)]);
        return merged[0] ?? null;
      }
    }
  }

  try {
    const [r] = await db
      .select(inventoryDbRowSelect)
      .from(propertyInventoryTable)
      .where(sql`upper(${propertyInventoryTable.code}) = ${codeKey}`)
      .limit(1);
    if (!r) return null;
    const merged = await mergeMetaIntoListings([listingJsonFromDbRow(r)]);
    return merged[0] ?? null;
  } catch (error: unknown) {
    if (isUndefinedTableError(error)) return null;
    throw error;
  }
}

const DRIVE_THUMB_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Proxy Google Drive thumbnails for browser `<img>` (avoids hotlink / referrer issues). */
router.get("/inventory/thumb/:fileId", async (req, res): Promise<void> => {
  const raw = req.params.fileId;
  const fileId = (Array.isArray(raw) ? raw[0] : raw ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{10,64}$/.test(fileId)) {
    res.status(400).json({ error: "Invalid file id" });
    return;
  }
  const target = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  try {
    const upstream = await fetch(target, {
      redirect: "follow",
      headers: { "User-Agent": DRIVE_THUMB_USER_AGENT, Accept: "image/*,*/*;q=0.8" },
    });
    if (!upstream.ok) {
      res.status(404).end();
      return;
    }
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    if (!/^image\//i.test(contentType)) {
      res.status(404).end();
      return;
    }
    const body = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.send(body);
  } catch (err) {
    logger.warn({ err, fileId }, "inventory thumb proxy failed");
    res.status(502).end();
  }
});

router.post("/inventory/listings/revalidate-sheet", (_req, res): void => {
  clearPropertyInventorySheetCache();
  res.json({ ok: true });
});

const patchListingMetaBodySchema = z
  .object({
    featured: z.boolean().optional(),
    visibility: z.enum(["active", "draft"]).optional(),
    saleStatus: z.enum(["available", "sold"]).optional(),
  })
  .refine((b) => b.featured !== undefined || b.visibility !== undefined || b.saleStatus !== undefined, {
    message: "At least one of featured, visibility, or saleStatus is required",
  });

async function upsertListingMetaHandler(req: Request, res: Response): Promise<void> {
  const rawCode = req.params.code;
  const code = (Array.isArray(rawCode) ? rawCode[0] : rawCode ?? "").trim();
  if (!code || !/^[A-Za-z0-9_-]+$/.test(code)) {
    res.status(400).json({ error: "Invalid listing code" });
    return;
  }
  const parsed = patchListingMetaBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const metaOk = await ensureInventoryListingMetaReady();
    if (!metaOk) {
      res.status(503).json({
        error:
          "Postgres is not reachable from the API, or inventory_listing_meta could not be created. Check DATABASE_URL, ensure the database is running, then retry. Featured / draft / sold require Postgres.",
      });
      return;
    }
    const [existing] = await db
      .select()
      .from(inventoryListingMetaTable)
      .where(eq(inventoryListingMetaTable.code, code))
      .limit(1);

    const merged = {
      code,
      featured: parsed.data.featured ?? existing?.featured ?? false,
      visibility: parsed.data.visibility ?? existing?.visibility ?? "active",
      saleStatus: parsed.data.saleStatus ?? existing?.saleStatus ?? "available",
    };

    await db
      .insert(inventoryListingMetaTable)
      .values(merged)
      .onConflictDoUpdate({
        target: inventoryListingMetaTable.code,
        set: {
          featured: merged.featured,
          visibility: merged.visibility,
          saleStatus: merged.saleStatus,
          updatedAt: new Date(),
        },
      });

    res.json({ success: true, ...merged });
  } catch (error: unknown) {
    if (isUndefinedTableError(error)) {
      res.status(503).json({
        error:
          "inventory_listing_meta is missing and could not be created automatically. Run scripts/sql/inventory_listing_meta.sql on Postgres, or grant the API database user permission to CREATE TABLE.",
      });
      return;
    }
    throw error;
  }
}

/** POST duplicate: some static hosts / `vite preview` only forward GET; proxies may block PATCH. */
router.post("/inventory/listings/:code/meta", upsertListingMetaHandler);
router.patch("/inventory/listings/:code/meta", upsertListingMetaHandler);

router.get("/inventory/listings/:code", async (req, res): Promise<void> => {
  const rawCode = req.params.code;
  const code = (Array.isArray(rawCode) ? rawCode[0] : rawCode ?? "").trim();
  if (!code || !/^[A-Za-z0-9_-]+$/.test(code)) {
    res.status(400).json({ error: "Invalid listing code" });
    return;
  }
  try {
    const listing = await findListingByCode(code);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json({
      listing: {
        ...listing,
        createdAt: listing.createdAt || null,
        updatedAt: listing.updatedAt || null,
      },
    });
  } catch (error: unknown) {
    if (isUndefinedTableError(error)) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    throw error;
  }
});

router.get("/inventory/listings", async (req, res): Promise<void> => {
  const parsed = listInventoryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { channel, limit, offset, refreshSheet } = parsed.data;
  const forceExternalRefresh = refreshSheet === "1" || refreshSheet === "true";

  const rawSource = (process.env.PROPERTY_INVENTORY_SOURCE || "").trim().toLowerCase();
  const databaseOnly =
    rawSource === "database" || rawSource === "db" || rawSource === "postgres";

  if (inventoryListingsDebugEnabled()) {
    logger.info(
      {
        PROPERTY_INVENTORY_SOURCE: rawSource || "(unset)",
        databaseOnly,
        sheetConfigured: useSheetAsInventorySource(),
        channel,
        forceExternalRefresh,
      },
      "inventory listings: PROPERTY_INVENTORY_DEBUG request context",
    );
  }

  if (!databaseOnly && useSheetAsInventorySource()) {
    try {
      const fromSheet = await loadListingsFromGoogleSheet({
        forceRefresh: forceExternalRefresh,
        resolveDriveImages: true,
      });
      if (fromSheet && fromSheet.length > 0) {
        const { listings, total } = jsonFromExternalRows(fromSheet, channel, limit, offset);
        if (total > 0) {
          const merged = await mergeMetaIntoListings(listings);
          if (inventoryListingsDebugEnabled()) {
            logger.info(
              { outcome: "google_sheet", sheetRowCount: fromSheet.length, total, listingCount: listings.length, channel },
              "inventory listings: PROPERTY_INVENTORY_DEBUG response",
            );
          }
          setInventoryResponseCacheHeaders(res, forceExternalRefresh);
          setInventoryListingsSourceHeader(res, "google_sheet");
          res.json({ listings: merged.map(compactListingForListResponse), total });
          return;
        }
        logger.warn(
          { sheetRowCount: fromSheet.length, channel },
          "inventory listings: sheet loaded but no rows match channel filter; falling back to database",
        );
      }
      if (inventoryListingsDebugEnabled()) {
        logger.info(
          {
            outcome: "sheet_failed",
            sheetResult: fromSheet === null ? "null" : `length_${fromSheet.length}`,
          },
          "inventory listings: PROPERTY_INVENTORY_DEBUG falling back to database",
        );
      }
      logger.warn(
        { channel, forceExternalRefresh },
        "inventory listings: sheet source enabled but sheet unavailable or invalid; falling back to database",
      );
    } catch (sheetPathErr: unknown) {
      logger.error({ err: sheetPathErr }, "inventory listings: google sheet path threw; falling back to database");
    }
  }

  try {
    const totalQuery = db
      .select({ total: sql<number>`count(*)::int` })
      .from(propertyInventoryTable);
    const [totalRow] = channel
      ? await totalQuery.where(eq(propertyInventoryTable.channel, channel))
      : await totalQuery;

    const rows = channel
      ? await db
          .select(inventoryDbRowSelect)
          .from(propertyInventoryTable)
          .where(eq(propertyInventoryTable.channel, channel))
          .orderBy(asc(propertyInventoryTable.sortOrder), asc(propertyInventoryTable.code))
          .limit(limit)
          .offset(offset)
      : await db
          .select(inventoryDbRowSelect)
          .from(propertyInventoryTable)
          .orderBy(asc(propertyInventoryTable.sortOrder), asc(propertyInventoryTable.code))
          .limit(limit)
          .offset(offset);

    const totalDb = Number(totalRow?.total ?? 0);
    if (inventoryListingsDebugEnabled()) {
      logger.info(
        { outcome: "postgres", total: totalDb, rowCount: rows.length, channel },
        "inventory listings: PROPERTY_INVENTORY_DEBUG response",
      );
    }

    const listingsDb: ListingRowJson[] = rows.map((r) => listingJsonFromDbRow(r));
    const mergedDb = await mergeMetaIntoListings(listingsDb);

    setInventoryResponseCacheHeaders(res, forceExternalRefresh);
    setInventoryListingsSourceHeader(res, "postgres");
    res.json({
      listings: mergedDb.map((r) => ({
        ...r,
        ...compactListingForListResponse(r),
        createdAt: r.createdAt || null,
        updatedAt: r.updatedAt || null,
      })),
      total: totalDb,
    });
  } catch (error: unknown) {
    if (isUndefinedTableError(error)) {
      res.json({ listings: [], total: 0 });
      return;
    }
    if (isDbUnreachableError(error) || isPostgresAvailabilityOrAuthError(error)) {
      res.json({ listings: [], total: 0 });
      return;
    }
    if (!databaseOnly && useSheetAsInventorySource()) {
      logger.error(
        { err: error },
        "inventory listings: postgres fallback failed after sheet miss; returning empty list instead of 500",
      );
      res.json({ listings: [], total: 0 });
      return;
    }
    logger.error({ err: error }, "inventory listings: postgres branch failed");
    res.status(500).json({
      error: "Inventory database query failed.",
      detail: process.env.NODE_ENV === "development" ? String((error as Error)?.message ?? error) : undefined,
    });
  }
});

const inventoryListingUpsertRowSchema = z.object({
  code: z.string().min(1).max(64),
  title: z.string().max(500).default(""),
  listingUrl: z
    .string()
    .max(2048)
    .nullable()
    .optional()
    .transform((s) => {
      if (s === undefined || s === null) return null;
      const t = s.trim();
      if (!t) return null;
      try {
        void new URL(t);
        return t;
      } catch {
        return null;
      }
    }),
  description: z.string().max(100_000).default(""),
  channel: z.enum(["silent", "website"]),
  sortOrder: z.number().int().min(0).max(1_000_000).optional().default(0),
});

const inventoryListingsUpsertBodySchema = z.object({
  listings: z.array(inventoryListingUpsertRowSchema).min(1).max(2000),
});

router.post("/inventory/listings/upsert", async (req, res): Promise<void> => {
  const parsed = inventoryListingsUpsertBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = parsed.data.listings.map((r) => ({
    code: r.code.trim(),
    title: r.title.trim(),
    listingUrl: r.listingUrl ?? null,
    description: r.description,
    channel: r.channel,
    sortOrder: r.sortOrder,
  }));

  try {
    const result = await db
      .insert(propertyInventoryTable)
      .values(rows)
      .onConflictDoUpdate({
        target: propertyInventoryTable.code,
        set: {
          title: sql`excluded.title`,
          listingUrl: sql`excluded.listing_url`,
          description: sql`excluded.description`,
          channel: sql`excluded.channel`,
          sortOrder: sql`excluded.sort_order`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ code: propertyInventoryTable.code });

    res.status(200).json({ success: true, upserted: result.length });
  } catch (error: unknown) {
    if (isUndefinedTableError(error)) {
      res.status(503).json({ error: "property_inventory table is not available" });
      return;
    }
    throw error;
  }
});

const inventoryImportSchema = z.object({
  project: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    status: z.enum(["ongoing", "completed", "upcoming"]).default("ongoing"),
    area: z.string().min(1),
    propertyType: z.string().min(1),
    bedroomsMin: z.number().int().positive(),
    bedroomsMax: z.number().int().positive(),
    priceFrom: z.number().int().nonnegative(),
    currency: z.string().min(1).default("USD"),
    completionDate: z.string().nullable().optional(),
    shortDescription: z.string().min(1),
    fullDescription: z.string().default(""),
    amenities: z.array(z.string()).default([]),
    investmentHighlights: z.array(z.string()).default([]),
    brochureUrl: z.string().url().nullable().optional(),
    heroImageUrl: z.string().url().nullable().optional(),
    featured: z.boolean().default(false),
    unitsLeft: z.number().int().nullable().optional(),
  }),
  units: z.array(
    z.object({
      unitName: z.string().min(1),
      bedrooms: z.number().int().positive(),
      bathrooms: z.number().int().positive(),
      buildSize: z.number().int().nullable().optional(),
      landSize: z.number().int().nullable().optional(),
      price: z.number().int().nonnegative(),
      currency: z.string().min(1).default("USD"),
      status: z.enum(["available", "reserved", "sold"]).default("available"),
      floorplanUrl: z.string().url().nullable().optional(),
    }),
  ).default([]),
});

router.post("/inventory/import", async (req, res): Promise<void> => {
  const parsed = inventoryImportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await db.transaction(async (tx) => {
    const [project] = await tx.insert(projectsTable).values({
      title: parsed.data.project.title,
      slug: parsed.data.project.slug,
      status: parsed.data.project.status,
      area: parsed.data.project.area,
      propertyType: parsed.data.project.propertyType,
      bedroomsMin: parsed.data.project.bedroomsMin,
      bedroomsMax: parsed.data.project.bedroomsMax,
      priceFrom: parsed.data.project.priceFrom,
      currency: parsed.data.project.currency,
      completionDate: parsed.data.project.completionDate ?? null,
      shortDescription: parsed.data.project.shortDescription,
      fullDescription: parsed.data.project.fullDescription,
      amenities: parsed.data.project.amenities,
      investmentHighlights: parsed.data.project.investmentHighlights,
      brochureUrl: parsed.data.project.brochureUrl ?? null,
      heroImageUrl: parsed.data.project.heroImageUrl ?? null,
      featured: parsed.data.project.featured,
      unitsLeft: parsed.data.project.unitsLeft ?? null,
    }).returning();

    if (parsed.data.units.length > 0) {
      await tx.insert(unitsTable).values(
        parsed.data.units.map((u) => ({
          projectId: project.id,
          unitName: u.unitName,
          bedrooms: u.bedrooms,
          bathrooms: u.bathrooms,
          buildSize: u.buildSize ?? null,
          landSize: u.landSize ?? null,
          price: u.price,
          currency: u.currency,
          status: u.status,
          floorplanUrl: u.floorplanUrl ?? null,
        })),
      );
    }

    return { projectId: project.id, unitsImported: parsed.data.units.length };
  });

  res.status(201).json({ success: true, ...result });
});

export default router;
