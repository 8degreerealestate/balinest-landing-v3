import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDatabaseConfigured, getDb } from "@workspace/db";
import { blogCategoriesTable, blogPostsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import { resolveJournalImageUrl, rewriteJournalContentHtml } from "./journal-image-url";

export type JournalImportRow = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string | null;
  author: string;
  categorySlug: string | null;
  categoryName: string | null;
  readingTime: number;
  publishedAt: string;
  sourceUrl: string;
};

export type JournalPostDto = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string | null;
  author: string;
  categoryId: number | null;
  categoryName: string | null;
  readingTime: number;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

let cachedRows: JournalImportRow[] | null = null;
let syncAttempted = false;

function resolveJournalJsonPath(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(process.cwd(), "scripts/data/journal-import.json"),
    path.join(process.cwd(), "../scripts/data/journal-import.json"),
    path.resolve(here, "../../../../scripts/data/journal-import.json"),
    path.resolve(here, "../data/journal-import.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function loadJournalImportRows(): JournalImportRow[] {
  if (cachedRows) return cachedRows;
  const jsonPath = resolveJournalJsonPath();
  if (!jsonPath) {
    logger.warn("journal-import.json not found — journal fallback disabled");
    cachedRows = [];
    return cachedRows;
  }
  const body = JSON.parse(readFileSync(jsonPath, "utf8")) as { posts: JournalImportRow[] };
  cachedRows = [...(body.posts ?? [])].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  return cachedRows;
}

export function journalRowsToDtos(rows: JournalImportRow[]): JournalPostDto[] {
  return rows.map((row, index) => ({
    id: index + 1,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: rewriteJournalContentHtml(row.content),
    featuredImageUrl: resolveJournalImageUrl(row.featuredImageUrl),
    author: row.author,
    categoryId: null,
    categoryName: row.categoryName,
    readingTime: row.readingTime,
    published: true,
    publishedAt: row.publishedAt,
    createdAt: row.publishedAt,
  }));
}

export function listJournalFallback(options: {
  category?: string;
  limit: number;
  offset: number;
}): { posts: JournalPostDto[]; total: number } {
  let rows = loadJournalImportRows();
  if (options.category) {
    rows = rows.filter((r) => r.categoryName === options.category);
  }
  const dtos = journalRowsToDtos(rows).sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    if (tb !== ta) return tb - ta;
    return b.id - a.id;
  });
  const total = dtos.length;
  const slice = dtos.slice(options.offset, options.offset + options.limit);
  return { posts: slice, total };
}

export function getJournalFallbackBySlug(slug: string): JournalPostDto | null {
  const row = loadJournalImportRows().find((p) => p.slug === slug);
  if (!row) return null;
  return journalRowsToDtos([row])[0] ?? null;
}

export function listJournalFallbackCategories(): Array<{ id: number; name: string; slug: string }> {
  const seen = new Map<string, { id: number; name: string; slug: string }>();
  let id = 1;
  for (const row of loadJournalImportRows()) {
    if (!row.categorySlug || !row.categoryName) continue;
    if (!seen.has(row.categorySlug)) {
      seen.set(row.categorySlug, { id: id++, name: row.categoryName, slug: row.categorySlug });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** One-time import from bundled JSON when Postgres has no published posts yet. */
export async function syncJournalImportToDatabaseIfEmpty(): Promise<void> {
  if (syncAttempted) return;
  syncAttempted = true;

  if (!isDatabaseConfigured()) return;

  const rows = loadJournalImportRows();
  if (rows.length === 0) return;

  try {
    const db = getDb();
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPostsTable)
      .where(sql`${blogPostsTable.published} = true`);

    if (Number(count) > 0) return;

    logger.info({ count: rows.length }, "Syncing journal posts from import JSON into Postgres");

    const categoryIdBySlug = new Map<string, number>();
    for (const row of rows) {
      if (!row.categorySlug || !row.categoryName) continue;
      if (categoryIdBySlug.has(row.categorySlug)) continue;
      const [cat] = await db
        .insert(blogCategoriesTable)
        .values({ name: row.categoryName, slug: row.categorySlug })
        .onConflictDoUpdate({
          target: blogCategoriesTable.slug,
          set: { name: row.categoryName },
        })
        .returning({ id: blogCategoriesTable.id });
      if (cat) categoryIdBySlug.set(row.categorySlug, cat.id);
    }

    for (const row of rows) {
      const categoryId = row.categorySlug
        ? categoryIdBySlug.get(row.categorySlug) ?? null
        : null;
      const publishedAt = new Date(row.publishedAt);
      await db
        .insert(blogPostsTable)
        .values({
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          content: row.content,
          featuredImageUrl: row.featuredImageUrl,
          author: row.author,
          categoryId,
          readingTime: row.readingTime,
          published: true,
          publishedAt,
          createdAt: publishedAt,
        })
        .onConflictDoUpdate({
          target: blogPostsTable.slug,
          set: {
            title: row.title,
            excerpt: row.excerpt,
            content: row.content,
            featuredImageUrl: row.featuredImageUrl,
            author: row.author,
            categoryId,
            readingTime: row.readingTime,
            published: true,
            publishedAt,
            updatedAt: new Date(),
          },
        });
    }

    logger.info("Journal import sync complete");
  } catch (err) {
    logger.warn({ err }, "Journal import sync failed — API will use JSON fallback");
  }
}
