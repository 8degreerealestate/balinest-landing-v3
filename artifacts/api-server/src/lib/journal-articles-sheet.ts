import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { logger } from "./logger";
import {
  loadJournalImportRows,
  type JournalImportRow,
  type JournalPostDto,
} from "./journal-import-fallback";
import { resolveJournalImageUrl, rewriteJournalContentHtml } from "./journal-image-url";

/** Shipped CSV when Google Sheet export is unreachable in local dev. */
const DEV_JOURNAL_ARTICLES_FALLBACK_CSV = "dev-journal-articles-fallback.csv";

export const DEFAULT_JOURNAL_ARTICLES_SPREADSHEET_ID =
  "1f8XO2oa7JpYP7XvfXX8iTZqTD_oc5rPXvONQrCNGP6U";
/** "Articles" tab in 8D Website Assets workbook. */
export const DEFAULT_JOURNAL_ARTICLES_SHEET_GID = "3222802";

export type SheetArticleRow = {
  sortOrder: number;
  title: string;
  slug: string;
  sourceUrl: string | null;
  featuredImageUrl: string | null;
  contentDocUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  excerpt: string | null;
  /** Row is live when the publish marker column is empty or contains "v". */
  published: boolean;
};

let metadataCache: { key: string; fetchedAt: number; rows: SheetArticleRow[] } | null = null;
const contentCache = new Map<string, { fetchedAt: number; html: string }>();

const CACHE_TTL_MS = 5 * 60_000;
const CONTENT_CACHE_TTL_MS = 10 * 60_000;

const FETCH_HEADERS = {
  Accept: "*/*",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export function clearJournalArticlesSheetCache(): void {
  metadataCache = null;
  contentCache.clear();
}

export function useSheetAsJournalSource(): boolean {
  const v = process.env.JOURNAL_SOURCE?.trim().toLowerCase();
  if (v === "database" || v === "db" || v === "postgres") return false;
  return true;
}

function journalArticlesSheetCacheKey(): string {
  const full = process.env.JOURNAL_ARTICLES_SHEET_EXPORT_URL?.trim();
  if (full) return full;
  const id =
    process.env.JOURNAL_ARTICLES_SPREADSHEET_ID?.trim() || DEFAULT_JOURNAL_ARTICLES_SPREADSHEET_ID;
  const gid = process.env.JOURNAL_ARTICLES_SHEET_GID?.trim() || DEFAULT_JOURNAL_ARTICLES_SHEET_GID;
  return `sheet:${id}:${gid}`;
}

function journalArticlesCsvUrls(): string[] {
  const full = process.env.JOURNAL_ARTICLES_SHEET_EXPORT_URL?.trim();
  if (full) return [full];

  const spreadsheetId =
    process.env.JOURNAL_ARTICLES_SPREADSHEET_ID?.trim() || DEFAULT_JOURNAL_ARTICLES_SPREADSHEET_ID;
  const gid = process.env.JOURNAL_ARTICLES_SHEET_GID?.trim() || DEFAULT_JOURNAL_ARTICLES_SHEET_GID;
  return [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`,
  ];
}

function shippedFallbackCsvPath(): string | null {
  if (process.env.JOURNAL_ARTICLES_SHIPPED_FALLBACK === "0") return null;
  const envPath = process.env.JOURNAL_ARTICLES_FALLBACK_CSV?.trim();
  if (envPath) {
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, `../data/${DEV_JOURNAL_ARTICLES_FALLBACK_CSV}`),
    path.resolve(process.cwd(), `artifacts/api-server/data/${DEV_JOURNAL_ARTICLES_FALLBACK_CSV}`),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function isProductionEnv(): boolean {
  const nodeEnv = (process.env.NODE_ENV ?? "").toLowerCase();
  return nodeEnv === "production" || nodeEnv === "prod";
}

async function fetchSheetCsv(url: string): Promise<string | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, signal: controller.signal });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim() || text.trimStart().startsWith("<!")) return null;
    return text;
  } catch (err) {
    logger.warn({ err, url }, "journal articles sheet: fetch failed");
    return null;
  } finally {
    clearTimeout(t);
  }
}

function looksLikeArticlesSheetCsv(csv: string): boolean {
  const head = csv.slice(0, 800).toLowerCase();
  return head.includes("seo title") && (head.includes("featured image") || head.includes("content"));
}

function driveFileIdFromUrl(url: string): string | null {
  const trimmed = url.trim();
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/i,
    /drive\.google\.com\/open\?[^#]*\bid=([a-zA-Z0-9_-]{10,})/i,
    /drive\.google\.com\/uc\?[^#]*\bid=([a-zA-Z0-9_-]{10,})/i,
    /drive\.google\.com\/thumbnail\?[^#]*\bid=([a-zA-Z0-9_-]{10,})/i,
  ];
  for (const re of patterns) {
    const m = re.exec(trimmed);
    if (m?.[1]) return m[1];
  }
  return null;
}

function googleDocIdFromUrl(url: string): string | null {
  const m = /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]{10,})/i.exec(url);
  return m?.[1] ?? null;
}

function slugFromArticleUrl(url: string): string | null {
  try {
    const pathname = new URL(url.trim()).pathname.replace(/^\/+|\/+$/g, "");
    if (!pathname || pathname === "journal" || pathname === "blog") return null;
    const parts = pathname.split("/").filter(Boolean);
    // Sheet / legacy WP may use /blog/:slug or /journal/:slug; canonical is /:slug.
    if (
      parts.length >= 2 &&
      (parts[0] === "blog" || parts[0] === "journal")
    ) {
      return parts[parts.length - 1]?.trim() || null;
    }
    const last = parts[parts.length - 1];
    return last?.trim() || null;
  } catch {
    return null;
  }
}

function normalizeSheetTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim();
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categorySlugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveDriveFeaturedImage(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const id = driveFileIdFromUrl(url);
  if (id) return `/api/inventory/thumb/${id}`;
  return url.trim();
}

function cell(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key]?.trim();
    if (v) return v;
  }
  return "";
}

function parsePublishMarker(row: Record<string, string>): boolean {
  // Do not read blank-header columns from Google CSV exports — they are padding only.
  const marker = cell(row, "Publish", "Published", "Live", "Status");
  if (!marker) return true;
  const m = marker.toLowerCase();
  if (m === "x" || m === "no" || m === "false" || m === "0" || m === "hide") return false;
  return true;
}

export function parseJournalArticlesSheetCsv(csv: string): SheetArticleRow[] {
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];

  const rows: SheetArticleRow[] = [];
  let sortOrder = 0;

  for (const record of records) {
    const title = normalizeSheetTitle(cell(record, "SEO Title", "Title"));
    if (!title) continue;

    const sourceUrl = cell(record, "Url", "URL") || null;
    const slug = slugFromArticleUrl(sourceUrl ?? "") ?? slugifyTitle(title);
    const categoryName = cell(record, "Category") || null;
    const excerpt =
      cell(record, "META Description", "Meta Description", "Excerpt", "Description") || null;
    const featuredRaw = cell(record, "Featured Image URL", "Featured Image", "Image URL") || null;
    const contentDocUrl = cell(record, "Content", "Content URL", "Google Doc") || null;

    rows.push({
      sortOrder: sortOrder++,
      title,
      slug,
      sourceUrl,
      // Sheet Featured Image URL is authoritative when present (Drive → /api/inventory/thumb/:id).
      featuredImageUrl: resolveDriveFeaturedImage(featuredRaw),
      contentDocUrl: contentDocUrl || null,
      categoryName,
      categorySlug: categoryName ? categorySlugFromName(categoryName) : null,
      excerpt: excerpt || null,
      published: parsePublishMarker(record),
    });
  }

  return rows;
}

function importBySlugMap(): Map<string, JournalImportRow> {
  const map = new Map<string, JournalImportRow>();
  for (const row of loadJournalImportRows()) {
    map.set(row.slug, row);
  }
  return map;
}

function readingTimeMinutes(plainText: string): number {
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToHtml(text: string): string {
  const blocks = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length === 0) return "";
  return blocks.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
}

function extractBodyHtml(docHtml: string): string {
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(docHtml);
  const inner = bodyMatch?.[1]?.trim() ?? docHtml.trim();
  return inner.replace(/<style[\s\S]*?<\/style>/gi, "").trim();
}

async function fetchGoogleDocHtml(docUrl: string): Promise<string | null> {
  const docId = googleDocIdFromUrl(docUrl);
  if (!docId) return null;

  const cached = contentCache.get(docId);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CONTENT_CACHE_TTL_MS) {
    return cached.html;
  }

  const exportUrls = [
    `https://docs.google.com/document/d/${docId}/export?format=html`,
    `https://docs.google.com/document/d/${docId}/export?format=txt`,
  ];

  for (const url of exportUrls) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS });
      if (!res.ok) continue;
      const raw = await res.text();
      if (!raw.trim()) continue;
      const html = url.includes("format=txt")
        ? textToHtml(raw)
        : extractBodyHtml(raw);
      if (!html.trim()) continue;
      contentCache.set(docId, { fetchedAt: now, html });
      return html;
    } catch (err) {
      logger.warn({ err, docId }, "journal articles: Google Doc fetch failed");
    }
  }

  return null;
}

function publishedAtForRow(row: SheetArticleRow, fallback?: JournalImportRow): string {
  if (fallback?.publishedAt) return fallback.publishedAt;
  // Sheet is newest-first; posts without a bundled import date are new entries at the top.
  const now = Date.now();
  return new Date(now - row.sortOrder * 86_400_000).toISOString();
}

function comparePostsByPublishedAtDesc(a: JournalPostDto, b: JournalPostDto): number {
  const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
  const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
  if (tb !== ta) return tb - ta;
  return b.id - a.id;
}

function mergeRowWithImport(
  row: SheetArticleRow,
  importRow: JournalImportRow | undefined,
  content: string,
): JournalPostDto {
  const excerpt =
    row.excerpt?.trim() ||
    importRow?.excerpt?.trim() ||
    stripHtml(content).slice(0, 500) ||
    row.title;
  // Prefer sheet Drive image; only fall back to archived WP media when the sheet cell is empty.
  const featuredImageUrl = resolveJournalImageUrl(
    row.featuredImageUrl || importRow?.featuredImageUrl || null,
  );
  const plain = stripHtml(content);

  return {
    id: row.sortOrder + 1,
    title: row.title,
    slug: row.slug,
    excerpt,
    content: rewriteJournalContentHtml(content),
    featuredImageUrl,
    author: importRow?.author ?? "8 Degree Team",
    categoryId: null,
    categoryName: row.categoryName ?? importRow?.categoryName ?? null,
    readingTime: readingTimeMinutes(plain || excerpt),
    published: row.published,
    publishedAt: publishedAtForRow(row, importRow),
    createdAt: publishedAtForRow(row, importRow),
  };
}

export async function loadArticlesFromGoogleSheet(options?: {
  forceRefresh?: boolean;
}): Promise<SheetArticleRow[] | null> {
  const cacheKey = journalArticlesSheetCacheKey();
  const now = Date.now();
  if (
    !options?.forceRefresh &&
    metadataCache &&
    metadataCache.key === cacheKey &&
    now - metadataCache.fetchedAt < CACHE_TTL_MS
  ) {
    return metadataCache.rows.length > 0 ? metadataCache.rows : null;
  }

  for (const url of journalArticlesCsvUrls()) {
    const csv = await fetchSheetCsv(url);
    if (!csv?.trim() || !looksLikeArticlesSheetCsv(csv)) continue;
    try {
      const rows = parseJournalArticlesSheetCsv(csv).filter((r) => r.published);
      if (rows.length === 0) continue;
      metadataCache = { key: cacheKey, fetchedAt: Date.now(), rows };
      logger.info({ rowCount: rows.length, url }, "journal articles sheet: loaded OK");
      return rows;
    } catch (err) {
      logger.warn({ err, url }, "journal articles sheet: CSV parse failed");
    }
  }

  if (!isProductionEnv()) {
    const fallbackPath = shippedFallbackCsvPath();
    if (fallbackPath) {
      try {
        const csv = readFileSync(fallbackPath, "utf8");
        if (looksLikeArticlesSheetCsv(csv)) {
          const rows = parseJournalArticlesSheetCsv(csv).filter((r) => r.published);
          if (rows.length > 0) {
            metadataCache = { key: `file:${fallbackPath}`, fetchedAt: Date.now(), rows };
            logger.info({ rowCount: rows.length, fallbackPath }, "journal articles sheet: loaded from fallback CSV");
            return rows;
          }
        }
      } catch (err) {
        logger.warn({ err, fallbackPath }, "journal articles sheet: fallback CSV read failed");
      }
    }
  }

  logger.warn(
    { cacheKey },
    "journal articles sheet: all URLs failed — share workbook with Anyone with link → Viewer",
  );
  return metadataCache?.rows.length ? metadataCache.rows : null;
}

export async function listJournalFromSheet(options: {
  category?: string;
  limit: number;
  offset: number;
  forceRefresh?: boolean;
}): Promise<{ posts: JournalPostDto[]; total: number } | null> {
  const rows = await loadArticlesFromGoogleSheet({ forceRefresh: options.forceRefresh });
  if (!rows?.length) return null;

  const imports = importBySlugMap();
  let filtered = rows;
  if (options.category) {
    filtered = rows.filter((r) => r.categoryName === options.category);
  }

  const posts = filtered
    .map((row) => {
      const importRow = imports.get(row.slug);
      const content = importRow?.content ?? "";
      return mergeRowWithImport(row, importRow, content);
    })
    .sort(comparePostsByPublishedAtDesc);

  const total = posts.length;
  const slice = posts.slice(options.offset, options.offset + options.limit);

  return { posts: slice, total };
}

export async function getJournalFromSheetBySlug(
  slug: string,
  options?: { forceRefresh?: boolean },
): Promise<JournalPostDto | null> {
  const rows = await loadArticlesFromGoogleSheet({ forceRefresh: options?.forceRefresh });
  if (!rows?.length) return null;

  const normalized = slug
    .replace(/^\/+|\/+$/g, "")
    .replace(/^(?:blog|journal)\//i, "")
    .trim();
  const row = rows.find((r) => r.slug === normalized || r.slug === slug);
  if (!row || !row.published) return null;

  const importRow = importBySlugMap().get(row.slug);
  let content = importRow?.content ?? "";

  if (row.contentDocUrl) {
    const fromDoc = await fetchGoogleDocHtml(row.contentDocUrl);
    if (fromDoc) content = fromDoc;
  }

  if (!content.trim()) return null;
  return mergeRowWithImport(row, importRow, content);
}

export function listJournalSheetCategories(): Array<{ id: number; name: string; slug: string }> {
  const rows = metadataCache?.rows ?? [];
  const seen = new Map<string, { id: number; name: string; slug: string }>();
  let id = 1;
  for (const row of rows) {
    if (!row.categoryName || !row.categorySlug) continue;
    if (!seen.has(row.categorySlug)) {
      seen.set(row.categorySlug, { id: id++, name: row.categoryName, slug: row.categorySlug });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
