import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "csv-parse/sync";
import { logger } from "./logger";

/** Shipped CSV used when `NODE_ENV=development` and Google Sheet export is unreachable (DNS, offline, etc.). */
const DEV_PROPERTY_INVENTORY_FALLBACK_CSV = "dev-property-inventory-fallback.csv";

/** Default workbook + tab (gid) for 8D property list. */
export const DEFAULT_PROPERTY_INVENTORY_SPREADSHEET_ID =
  "1f8XO2oa7JpYP7XvfXX8iTZqTD_oc5rPXvONQrCNGP6U";
export const DEFAULT_PROPERTY_INVENTORY_SHEET_GID = "685479834";

/** @deprecated Use candidate URLs; kept for env override compatibility. */
export const DEFAULT_PROPERTY_INVENTORY_SHEET_EXPORT_URL =
  `https://docs.google.com/spreadsheets/d/${DEFAULT_PROPERTY_INVENTORY_SPREADSHEET_ID}/export?format=csv&gid=${DEFAULT_PROPERTY_INVENTORY_SHEET_GID}`;

export type SheetListingRow = {
  id: string;
  code: string;
  sourceUrl: string | null;
  name: string;
  redirectUrl: string | null;
  title: string;
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
  channel: "silent" | "website";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

let cache: { key: string; fetchedAt: number; rows: SheetListingRow[] } | null = null;
/** In-memory sheet rows (includes resolved Drive folder thumbnails). */
const CACHE_TTL_MS = 10 * 60_000;
const DRIVE_FOLDER_TTL_MS = 10 * 60_000;
const driveFolderCache = new Map<string, { fetchedAt: number; imageUrls: string[] }>();

export function clearPropertyInventorySheetCache(): void {
  cache = null;
  driveFolderCache.clear();
}

function resolvedSpreadsheetIdAndGid(): { spreadsheetId: string; gid: string } {
  const gids = propertyInventorySheetTabGids();
  const full = process.env.PROPERTY_INVENTORY_SHEET_EXPORT_URL?.trim();
  if (full) {
    const m = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\//.exec(full);
    const gidM = /[?&]gid=(\d+)/.exec(full);
    if (m?.[1] && gidM?.[1]) {
      return { spreadsheetId: m[1], gid: gidM[1] };
    }
  }
  const id = process.env.PROPERTY_INVENTORY_SPREADSHEET_ID?.trim() || DEFAULT_PROPERTY_INVENTORY_SPREADSHEET_ID;
  return { spreadsheetId: id, gid: gids[0] ?? DEFAULT_PROPERTY_INVENTORY_SHEET_GID };
}

/** Tab gids to load and merge (website, silent, rentals, etc.). Later tabs override duplicate codes. */
export function propertyInventorySheetTabGids(): string[] {
  const primary = process.env.PROPERTY_INVENTORY_SHEET_GID?.trim() || DEFAULT_PROPERTY_INVENTORY_SHEET_GID;
  const extra = (process.env.PROPERTY_INVENTORY_SHEET_GIDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of [primary, ...extra]) {
    if (!seen.has(g)) {
      seen.add(g);
      out.push(g);
    }
  }
  return out;
}

function csvExportUrlsForSpreadsheetTab(spreadsheetId: string, gid: string): string[] {
  return [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
  ];
}

async function fetchSheetCsvForTab(spreadsheetId: string, gid: string): Promise<{ csv: string; url: string } | null> {
  for (const url of csvExportUrlsForSpreadsheetTab(spreadsheetId, gid)) {
    const csv = await fetchSheetCsv(url);
    if (!csv?.trim()) continue;
    if (!looksLikePropertyInventorySheetCsv(csv)) {
      logger.warn(
        { url, gid, snippet: csv.slice(0, 200).replace(/\s+/g, " ") },
        "property inventory sheet: tab response is not valid CSV",
      );
      continue;
    }
    return { csv, url };
  }
  return null;
}

/** Stable cache / log key for this workbook tab. */
export function propertyInventorySheetCacheKey(): string {
  const full = process.env.PROPERTY_INVENTORY_SHEET_EXPORT_URL?.trim();
  if (full) return full;
  const { spreadsheetId } = resolvedSpreadsheetIdAndGid();
  return `sheet:${spreadsheetId}:${propertyInventorySheetTabGids().join(",")}`;
}

/**
 * URLs to try in order. Google sometimes serves HTML for `/export` when link access is "Commenter";
 * `/gviz/tq?tqx=out:csv` can still return CSV for the same sheet.
 */
export function propertyInventorySheetCandidateCsvUrls(): string[] {
  const full = process.env.PROPERTY_INVENTORY_SHEET_EXPORT_URL?.trim();
  if (full) return [full];

  const { spreadsheetId } = resolvedSpreadsheetIdAndGid();
  const urls: string[] = [];
  for (const gid of propertyInventorySheetTabGids()) {
    urls.push(...csvExportUrlsForSpreadsheetTab(spreadsheetId, gid));
  }
  return urls;
}

/**
 * Extra CSV sources after network URLs: optional env path, or bundled sample when not production.
 * (Many local runs omit NODE_ENV; only production/prod disables the shipped CSV.)
 * Use `PROPERTY_INVENTORY_SHEET_EXPORT_URL=file:///.../export.csv` for a fully offline sheet.
 * Set `PROPERTY_INVENTORY_SHIPPED_FALLBACK=0` to disable the shipped file on non-prod hosts.
 */
function shouldTryShippedInventoryFallbackCsv(): boolean {
  const off = process.env.PROPERTY_INVENTORY_SHIPPED_FALLBACK?.trim().toLowerCase();
  if (off === "0" || off === "false" || off === "no") return false;
  const n = (process.env.NODE_ENV || "").trim().toLowerCase();
  return n !== "production" && n !== "prod";
}

function inventorySheetCsvExtraCandidates(): string[] {
  const explicit = process.env.PROPERTY_INVENTORY_FALLBACK_CSV?.trim();
  if (explicit) {
    const abs = path.isAbsolute(explicit) ? explicit : path.resolve(process.cwd(), explicit);
    return [pathToFileURL(abs).href];
  }
  if (!shouldTryShippedInventoryFallbackCsv()) return [];

  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../../data", DEV_PROPERTY_INVENTORY_FALLBACK_CSV),
    path.resolve(here, "../data", DEV_PROPERTY_INVENTORY_FALLBACK_CSV),
    path.resolve(process.cwd(), "artifacts/api-server/data", DEV_PROPERTY_INVENTORY_FALLBACK_CSV),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return [pathToFileURL(p).href];
  }
  return [];
}

function slugSku(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  s = s.replace(/\s+/g, "_");
  s = s.replace(/[^A-Za-z0-9_-]+/g, "_");
  s = s.replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s.slice(0, 64) || "ITEM";
}

function extractCodeFromUrlCell(urlCell: string): string {
  const m = /^\s*([A-Za-z0-9]+)\s*\|/.exec(urlCell ?? "");
  return m?.[1] ?? "";
}

function extractCodeFromAssets(assets: string): string {
  const m = /^\s*([A-Za-z0-9]+)\s*-\s*/.exec(assets ?? "");
  return m?.[1] ?? "";
}

export function stableInventoryListingIdFromCode(code: string): string {
  const h = createHash("sha1").update(`8degree:property_inventory:${code}`).digest();
  const buf = Buffer.alloc(16);
  h.copy(buf, 0, 0, 16);
  buf[6] = (buf[6]! & 0x0f) | 0x50;
  buf[8] = (buf[8]! & 0x3f) | 0x80;
  const hex = buf.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function parseListingUrl(url: string | undefined): string | null {
  const t = (url ?? "").trim();
  if (!t || !/^https?:\/\//i.test(t)) return null;
  try {
    void new URL(t);
    return t;
  } catch {
    return null;
  }
}

function driveFileIdFromUrl(url: string): string | null {
  const m = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/i.exec(url);
  return m?.[1] ?? null;
}

/** Only use Drive links from description — avoids marketing image URLs in copy. */
function imageUrlFromDescription(desc: string): string | null {
  const urls = desc.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? [];
  for (const raw of urls) {
    const u = raw.replace(/[.,;]+$/, "");
    const parsed = parseListingUrl(u);
    if (!parsed) continue;
    if (driveFolderIdFromUrl(parsed) || driveFileIdFromUrl(parsed)) return parsed;
  }
  return null;
}

function listingHasDriveFolderSource(row: Pick<SheetListingRow, "imageUrl" | "imageUrls">): boolean {
  const urls = [row.imageUrl, ...row.imageUrls].filter((u): u is string => Boolean(u?.trim()));
  return urls.some((u) => driveFolderIdFromUrl(u) !== null);
}

function listingFamilyKey(code: string): string {
  const c = code.trim().toUpperCase();
  const letterSuffix = /^(.+\d)([A-Z])$/.exec(c);
  if (letterSuffix && letterSuffix[1].length >= 5) return letterSuffix[1];
  if (/^8D\d/i.test(c) && c.length >= 6) return c.slice(0, 5);
  if (/^8DV\d/i.test(c) && c.length >= 6) return c.slice(0, 5);
  return c;
}

function listingHasDisplayableImages(row: SheetListingRow): boolean {
  return (
    isDisplayableInventoryImageUrl(row.imageUrl) ||
    row.imageUrls.some((u) => isDisplayableInventoryImageUrl(u))
  );
}

/** Copy gallery from a related listing when image_url is empty or a non-URL label. */
function backfillMissingListingImages(rows: SheetListingRow[]): SheetListingRow[] {
  const donorsByFamily = new Map<string, SheetListingRow>();

  for (const row of rows) {
    if (!listingHasDisplayableImages(row)) continue;
    const family = listingFamilyKey(row.code);
    if (!donorsByFamily.has(family)) donorsByFamily.set(family, row);
  }

  let backfilled = 0;
  const out = rows.map((row) => {
    if (listingHasDisplayableImages(row)) return row;
    if (listingHasDriveFolderSource(row)) return row;
    const family = listingFamilyKey(row.code);
    const donor = donorsByFamily.get(family);
    if (!donor || donor.code === row.code || !listingHasDisplayableImages(donor)) return row;
    backfilled += 1;
    return {
      ...row,
      imageUrl: donor.imageUrl,
      imageUrls: [...donor.imageUrls],
    };
  });
  if (backfilled > 0) {
    logger.info({ backfilled }, "property inventory sheet: backfilled missing images from related listings");
  }
  return out;
}

function nullableCell(row: Record<string, string>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = (row[key] ?? "").trim();
    if (v) return v;
  }
  return null;
}

function normalizeHeaderKey(key: string): string {
  return key
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizedRowGet(row: Record<string, string>, ...keys: string[]): string {
  const normalized = new Map<string, string>();
  for (const [k, v] of Object.entries(row)) {
    normalized.set(normalizeHeaderKey(k), v ?? "");
  }
  for (const key of keys) {
    const v = normalized.get(normalizeHeaderKey(key));
    if (v !== undefined) return v;
  }
  return "";
}

function normalizedNullableCell(row: Record<string, string>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = normalizedRowGet(row, key).trim();
    if (v) return v;
  }
  return null;
}

/** Workbook header is often `Code Silent listing / Unlist property` rather than `Code`. */
function codeFromRow(row: Record<string, string>): string {
  const direct = normalizedRowGet(row, "Code", "code").trim();
  if (direct) return direct;
  for (const [k, v] of Object.entries(row)) {
    if (normalizeHeaderKey(k).startsWith("code") && String(v).trim()) {
      return String(v).trim();
    }
  }
  return "";
}

/** Fill gaps when CRM columns are empty but marketing copy includes structured details. */
function enrichListingFieldsFromDescription(row: Omit<SheetListingRow, "id" | "sortOrder" | "createdAt" | "updatedAt">): Omit<
  SheetListingRow,
  "id" | "sortOrder" | "createdAt" | "updatedAt"
> {
  const d = row.description;
  let { landSizeSqm, buildingSizeSqm, br, ba, ownership } = row;

  if (!landSizeSqm) {
    const m = d.match(/Land\s*Size\s*:\s*([\d.,\s–-]+?)\s*m\s*²/i) ?? d.match(/Land\s*Size\s*:\s*([\d.,\s–-]+)/i);
    if (m?.[1]) landSizeSqm = m[1].replace(/\s/g, "").trim();
  }
  if (!buildingSizeSqm) {
    const m =
      d.match(/Building\s*Size\s*:\s*([\d.,\s–-]+?)\s*m\s*²/i) ?? d.match(/Building\s*Size\s*:\s*([\d.,\s–-]+)/i);
    if (m?.[1]) buildingSizeSqm = m[1].replace(/\s/g, "").trim();
  }
  if (!br) {
    const m = d.match(/\b(\d+)\s*[-–]?\s*(?:bedroom|bedrooms|bed|BR)\b/i);
    if (m?.[1]) br = m[1];
    else if (/bedroom\s*\(\s*s\s*\)/i.test(d)) br = "1+";
  }
  if (!ba) {
    const m = d.match(/\b(\d+)\s*[-–]?\s*(?:bathroom|bathrooms|bath|BA)\b/i);
    if (m?.[1]) ba = m[1];
    else if (/\ben[-\s]?suite\s+bathroom/i.test(d)) ba = "1";
  }
  const leaseInDesc = d.match(/Leasehold\s*\(\s*(\d+)\s*Years?\s*\)/i);
  if (leaseInDesc && ownership && /leasehold/i.test(ownership) && !/\d+\s*Years?/i.test(ownership)) {
    ownership = `Leasehold (${leaseInDesc[1]} Years)`;
  }

  return { ...row, landSizeSqm, buildingSizeSqm, br, ba, ownership };
}

function listingTitleFromRow(name: string, assets: string, desc: string, code: string): string {
  const a = assets.trim();
  if (a && a.toLowerCase() !== code.toLowerCase()) return a.slice(0, 500);
  const lines = String(desc)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const headline = lines.find((l) => l.length >= 16 && l.toLowerCase() !== code.toLowerCase());
  if (headline) return headline.slice(0, 500);
  const n = name.trim();
  if (n && n.toLowerCase() !== code.toLowerCase()) return n.slice(0, 500);
  return code.slice(0, 500);
}

export function isDisplayableInventoryImageUrl(url: string | null | undefined): boolean {
  const t = (url ?? "").trim();
  if (!t || !/^https?:\/\//i.test(t)) return false;
  if (/drive\.google\.com\/drive\/folders\//i.test(t)) return false;
  return true;
}

function pickDisplayImageUrl(imageUrl: string | null, imageUrls: string[]): string | null {
  for (const u of imageUrls) {
    if (isDisplayableInventoryImageUrl(u)) return u.trim();
  }
  if (isDisplayableInventoryImageUrl(imageUrl)) return imageUrl!.trim();
  return null;
}

function driveFolderIdFromUrl(url: string | null): string | null {
  if (!url) return null;
  const m = /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]{10,})/.exec(url);
  return m?.[1] ?? null;
}

function rowChannel(row: Record<string, string>): "silent" | "website" {
  const ch = (row["Channel"] ?? row["channel"] ?? "").trim().toLowerCase();
  if (ch === "silent") return "silent";
  return "website";
}

/** Reject HTML / auth walls / empty bodies so we never treat a failed export as an empty inventory. */
export function looksLikePropertyInventorySheetCsv(text: string): boolean {
  const s = text.replace(/^\ufeff/, "").trimStart();
  if (s.length < 20) return false;
  if (/^<\s*!DOCTYPE/i.test(s) || /^<\s*html/i.test(s)) return false;
  const first = s.split(/\r?\n/, 1)[0] ?? "";
  const f = first.toLowerCase();
  const hasName = /\bname\b/.test(f);
  const hasUrl = /\burl\b/.test(f) || /\blink\b/.test(f);
  const hasCode = /\bcode\b/.test(f);
  const hasAssets = /\bassets\b/.test(f);
  // Google often exports NAME / URL; some tabs use Code + Assets without a Url header.
  return (hasName && hasUrl) || (hasCode && hasAssets) || (hasName && hasAssets);
}

export function parsePropertyInventorySheetCsv(csvText: string): SheetListingRow[] {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
    relax_quotes: true,
  }) as Record<string, string>[];

  const now = new Date().toISOString();
  const skuCounts = new Map<string, number>();
  const out: SheetListingRow[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i] ?? {};
    const codeCell = codeFromRow(row);
    const name = normalizedRowGet(row, "Name", "name").trim();
    const urlCell = normalizedRowGet(row, "Url", "url", "Link", "link");
    const redirectUrlCell = normalizedRowGet(row, "redirect Url", "redirect_url", "Redirect Url");
    const assets = normalizedRowGet(row, "Assets", "assets").trim();
    const desc = normalizedRowGet(row, "Description/Broadcast", "Description");
    const rawImageCell = normalizedRowGet(row, "image_url", "Image URL", "imageUrl");
    let imageUrl = parseListingUrl(rawImageCell);
    if (!imageUrl && rawImageCell.trim()) {
      const aliasFolder = parseListingUrl(
        normalizedRowGet(row, "Assets", "assets") || normalizedRowGet(row, "Name", "name"),
      );
      if (aliasFolder && driveFolderIdFromUrl(aliasFolder)) imageUrl = aliasFolder;
    }
    if (!imageUrl) imageUrl = imageUrlFromDescription(desc);
    const ownership = normalizedNullableCell(row, "OWNERSHIP", "ownership");
    const location = normalizedNullableCell(row, "LOCATION", "location");
    const estimatePriceUsd = normalizedNullableCell(
      row,
      "ESTIMATE PRICE IN USD",
      "Estimate Price In USD",
      "Price",
      "price",
    );
    const deliveryEstimate = normalizedNullableCell(
      row,
      "DELIVERY ESTIMATE",
      "Delivery Estimate",
      "Develpment status",
      "Development status",
    );
    const landSizeSqm = normalizedNullableCell(row, "LAND SIZE(Sqm)", "LAND SIZE (Sqm)", "Land Size (Sqm)");
    const buildingSizeSqm = normalizedNullableCell(row, "BUILDING SIZE(Sqm)", "BUILDING SIZE (Sqm)", "Building Size (Sqm)");
    const br = normalizedNullableCell(row, "BR", "br", "Bedrooms", "bedrooms");
    const ba = normalizedNullableCell(row, "BA", "ba", "Bathrooms", "bathrooms");

    if (
      codeCell.toLowerCase().includes("silent listing") &&
      !name &&
      !String(desc).trim() &&
      !String(urlCell).trim() &&
      !String(redirectUrlCell).trim()
    ) {
      continue;
    }
    if (/^website[\s_-]*listing$/i.test(codeCell)) continue;

    let base = codeCell || name;
    if (!base) base = extractCodeFromUrlCell(urlCell) || extractCodeFromAssets(assets);
    if (!base) base = `IMPORT_ROW_${String(i + 1).padStart(4, "0")}`;

    const slug = slugSku(base);
    const n = (skuCounts.get(slug) ?? 0) + 1;
    skuCounts.set(slug, n);
    const code = n === 1 ? slug : `${slug}__${n}`;

    const title = listingTitleFromRow(name, assets, desc, code);
    const sourceUrl = parseListingUrl(urlCell);
    const redirectUrl = parseListingUrl(redirectUrlCell);
    const listingUrl = redirectUrl ?? sourceUrl;
    const channel = rowChannel(row);
    const sortOrder = i * 10;
    const parsed = enrichListingFieldsFromDescription({
      code,
      sourceUrl,
      name: name || code,
      redirectUrl,
      title,
      imageUrl,
      imageUrls: imageUrl ? [imageUrl] : [],
      ownership,
      location,
      estimatePriceUsd,
      deliveryEstimate,
      landSizeSqm,
      buildingSizeSqm,
      br,
      ba,
      listingUrl,
      description: String(desc).slice(0, 100_000),
      channel,
    });
    out.push({
      id: stableInventoryListingIdFromCode(code),
      ...parsed,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  }

  return out;
}

function extractDriveImageFileIdsFromFolderHtml(html: string, folderId: string): string[] {
  const ids = new Set<string>();
  const mimePair =
    /&quot;([a-zA-Z0-9_-]{20,})&quot;[\s\S]{0,220}?&quot;image\/(?:jpeg|jpg|png|webp|gif|heic)&quot;/gim;
  let m: RegExpExecArray | null;
  while ((m = mimePair.exec(html)) !== null) ids.add(m[1]!);

  if (ids.size === 0) {
    const embedded = /"([1][a-zA-Z0-9_-]{20,38})"/g;
    while ((m = embedded.exec(html)) !== null) {
      const id = m[1]!;
      if (id === folderId || id.startsWith("AIza")) continue;
      ids.add(id);
    }
  }

  return [...ids];
}

async function fetchDriveFolderImageUrls(folderId: string): Promise<string[]> {
  const cached = driveFolderCache.get(folderId);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < DRIVE_FOLDER_TTL_MS) return cached.imageUrls;

  const url = `https://drive.google.com/drive/folders/${folderId}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": SHEET_FETCH_HEADERS["User-Agent"],
        Accept: "text/html,*/*;q=0.8",
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const fileIds = extractDriveImageFileIdsFromFolderHtml(html, folderId);
    const imageUrls = fileIds.map((id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1200`);
    driveFolderCache.set(folderId, { fetchedAt: now, imageUrls });
    return imageUrls;
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

/** Resolve Google Drive folder links into thumbnail URLs (slow — use for single listing detail only). */
export async function enrichListingRowWithDriveImages(row: SheetListingRow): Promise<SheetListingRow> {
  const folderId = driveFolderIdFromUrl(row.imageUrl);
  if (!folderId) return row;
  const [enriched] = await enrichRowsWithDriveImages([row]);
  return enriched ?? row;
}

async function enrichRowsWithDriveImages(rows: SheetListingRow[]): Promise<SheetListingRow[]> {
  const folderIds = new Set<string>();
  const maxFoldersToResolve = Math.max(
    1,
    Number(process.env.PROPERTY_INVENTORY_DRIVE_RESOLVE_LIMIT || "250") || 250,
  );
  for (const row of rows) {
    const folderId = driveFolderIdFromUrl(row.imageUrl);
    if (folderId) folderIds.add(folderId);
  }
  if (folderIds.size === 0) return rows;

  const byFolder = new Map<string, string[]>();
  const ids = [...folderIds].slice(0, maxFoldersToResolve);
  const concurrency = Math.max(1, Math.min(8, Number(process.env.PROPERTY_INVENTORY_DRIVE_CONCURRENCY || "6") || 6));
  for (let i = 0; i < ids.length; i += concurrency) {
    const chunk = ids.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (folderId) => {
        const urls = await fetchDriveFolderImageUrls(folderId);
        byFolder.set(folderId, urls);
      }),
    );
  }

  const out = rows.map((row) => {
    const folderId = driveFolderIdFromUrl(row.imageUrl);
    if (!folderId) return row;
    const resolved = byFolder.get(folderId) ?? [];
    if (resolved.length === 0) {
      return { ...row, imageUrl: null, imageUrls: [] };
    }
    return {
      ...row,
      imageUrl: resolved[0] ?? null,
      imageUrls: resolved,
    };
  });
  logger.info(
    {
      folderCountResolved: byFolder.size,
      foldersWithImages: [...byFolder.values()].filter((v) => v.length > 0).length,
      maxFoldersToResolve,
    },
    "property inventory sheet: drive folder image resolution",
  );
  return out;
}

const SHEET_FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/csv,text/plain,*/*;q=0.8",
};

async function fetchSheetCsv(url: string): Promise<string | null> {
  if (/^file:\/\//i.test(url.trim())) {
    try {
      const { readFile } = await import("node:fs/promises");
      const filePath = fileURLToPath(url.trim());
      return await readFile(filePath, "utf8");
    } catch (err) {
      logger.warn({ err, url }, "property inventory sheet: file URL read failed");
      return null;
    }
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: SHEET_FETCH_HEADERS,
    });
    if (!res.ok) {
      logger.warn({ url, status: res.status }, "property inventory sheet: HTTP error from export URL");
      return null;
    }
    return await res.text();
  } catch (err) {
    logger.warn({ err, url }, "property inventory sheet: fetch failed");
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** @deprecated Use propertyInventorySheetCandidateCsvUrls */
export function sheetExportUrlFromEnv(): string {
  return propertyInventorySheetCandidateCsvUrls()[0] ?? DEFAULT_PROPERTY_INVENTORY_SHEET_EXPORT_URL;
}

/** When `true`, list/get inventory from Google Sheets before falling back to Postgres. Never WordPress. */
export function useSheetAsInventorySource(): boolean {
  const v = process.env.PROPERTY_INVENTORY_SOURCE?.trim().toLowerCase();
  if (v === "database" || v === "db" || v === "postgres") return false;
  return true;
}

export async function loadListingsFromGoogleSheet(options?: {
  forceRefresh?: boolean;
  /** When false, skip scraping Drive folders (faster but list cards lose photos). Default true. */
  resolveDriveImages?: boolean;
}): Promise<SheetListingRow[] | null> {
  const resolveDrive = options?.resolveDriveImages !== false;
  const cacheKey = `${propertyInventorySheetCacheKey()}:drive=${resolveDrive ? "1" : "0"}`;
  const now = Date.now();
  if (!options?.forceRefresh && cache && cache.key === cacheKey && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rows.length > 0 ? cache.rows : null;
  }

  const fallbackUrls = inventorySheetCsvExtraCandidates();
  const byCode = new Map<string, SheetListingRow>();
  const loadedTabs: { gid: string; url: string; rowCount: number }[] = [];

  const fullExport = process.env.PROPERTY_INVENTORY_SHEET_EXPORT_URL?.trim();
  if (fullExport) {
    const csv = await fetchSheetCsv(fullExport);
    if (csv?.trim() && looksLikePropertyInventorySheetCsv(csv)) {
      try {
        for (const row of parsePropertyInventorySheetCsv(csv)) byCode.set(row.code, row);
      } catch (err) {
        logger.warn({ err, url: fullExport }, "property inventory sheet: CSV parse failed");
      }
    }
  } else {
    const { spreadsheetId } = resolvedSpreadsheetIdAndGid();
    for (const gid of propertyInventorySheetTabGids()) {
      const fetched = await fetchSheetCsvForTab(spreadsheetId, gid);
      if (!fetched) continue;
      try {
        const parsedRows = parsePropertyInventorySheetCsv(fetched.csv);
        for (const row of parsedRows) byCode.set(row.code, row);
        loadedTabs.push({ gid, url: fetched.url, rowCount: parsedRows.length });
      } catch (err) {
        logger.warn({ err, gid, url: fetched.url }, "property inventory sheet: tab CSV parse failed");
      }
    }
  }

  if (byCode.size === 0) {
    for (const url of fallbackUrls) {
      const csv = await fetchSheetCsv(url);
      if (!csv?.trim() || !looksLikePropertyInventorySheetCsv(csv)) continue;
      try {
        for (const row of parsePropertyInventorySheetCsv(csv)) byCode.set(row.code, row);
        logger.info({ url, rowCount: byCode.size }, "property inventory sheet: loaded from fallback CSV");
        break;
      } catch (err) {
        logger.warn({ err, url }, "property inventory sheet: fallback CSV parse failed");
      }
    }
  }

  if (byCode.size === 0) {
    logger.warn(
      { tabs: propertyInventorySheetTabGids(), cacheKey },
      "property inventory sheet: all tabs/URLs failed — set link sharing to Viewer (not Commenter) or use File → Share → Publish to web",
    );
    return null;
  }

  let rows = [...byCode.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  if (resolveDrive) {
    try {
      rows = backfillMissingListingImages(await enrichRowsWithDriveImages(rows));
    } catch (enrichErr) {
      logger.warn({ err: enrichErr }, "property inventory sheet: drive folder image enrich failed; using parsed rows");
      rows = backfillMissingListingImages(rows);
    }
  } else {
    rows = backfillMissingListingImages(rows);
  }

  cache = { key: cacheKey, fetchedAt: Date.now(), rows };
  logger.info(
    { rowCount: rows.length, loadedTabs, tabGids: propertyInventorySheetTabGids() },
    "property inventory sheet: loaded OK",
  );
  return rows;
}
