/**
 * Import all journal posts from https://8degree.co/journal/ via the WordPress REST API.
 * Posts are stored oldest → newest (by original publish date).
 *
 * Usage:
 *   DATABASE_URL=postgres://… pnpm --filter @workspace/scripts run import-journal
 *   pnpm --filter @workspace/scripts run import-journal -- --dry-run
 *   pnpm --filter @workspace/scripts run import-journal -- --export-only
 *   DATABASE_URL=… pnpm --filter @workspace/scripts run import-journal -- --from-json
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const WP_BASE = process.env.WP_JOURNAL_BASE_URL?.trim() || "https://8degree.co";
const WP_API = `${WP_BASE.replace(/\/$/, "")}/wp-json/wp/v2`;
const FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent": "8degree-site-import/1.0 (+https://8degree.co)",
};

type WpPost = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
  };
};

type WpCategory = { id: number; name: string; slug: string };

function usage(): never {
  console.error(
    "Usage: DATABASE_URL=postgres://… pnpm --filter @workspace/scripts run import-journal [--dry-run]",
  );
  process.exit(1);
}

function decodeHtml(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—");
}

function stripHtml(html: string): string {
  return decodeHtml(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

/** Drop Elementor chrome; keep article HTML from text-editor widgets when possible. */
function normalizePostContent(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "<p></p>";

  const widgetChunks = [
    ...trimmed.matchAll(
      /data-widget_type="text-editor\.default"[\s\S]*?<div class="elementor-widget-container">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/gi,
    ),
  ].map((m) => m[1]?.trim()).filter(Boolean);

  if (widgetChunks.length > 0) {
    return widgetChunks.join("\n");
  }

  return trimmed
    .replace(/<div[^>]*data-elementor-type="wp-post"[^>]*>/gi, "")
    .replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/i, "")
    .trim();
}

function readingTimeMinutes(plainText: string): number {
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200));
}

async function wpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${WP_API}${path}`, { headers: FETCH_HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WP API ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function fetchAllPosts(): Promise<WpPost[]> {
  const posts: WpPost[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const batch = await wpFetch<WpPost[]>(
      `/posts?per_page=${perPage}&page=${page}&orderby=date&order=asc&status=publish&_embed=1`,
    );
    posts.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return posts;
}

async function fetchCategories(): Promise<Map<number, WpCategory>> {
  const cats = await wpFetch<WpCategory[]>("/categories?per_page=100");
  return new Map(cats.map((c) => [c.id, c]));
}

function pickCategory(
  post: WpPost,
  wpCategories: Map<number, WpCategory>,
): WpCategory | null {
  const embedded = post._embedded?.["wp:term"]?.flat() ?? [];
  const fromEmbed = embedded.find((t) => t.taxonomy === "category" && t.slug !== "uncategorized");
  if (fromEmbed) return { id: fromEmbed.id, name: fromEmbed.name, slug: fromEmbed.slug };

  for (const id of post.categories) {
    const cat = wpCategories.get(id);
    if (cat && cat.slug !== "uncategorized") return cat;
  }
  return null;
}

function featuredImageUrl(post: WpPost): string | null {
  const embedded = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  return embedded?.trim() || null;
}

type ExportRow = {
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

async function buildExportRows(
  posts: WpPost[],
  wpCategories: Map<number, WpCategory>,
): Promise<ExportRow[]> {
  return posts.map((post) => {
    const title = stripHtml(post.title.rendered);
    const excerpt = stripHtml(post.excerpt.rendered).slice(0, 500) || title;
    const plain = stripHtml(post.content.rendered);
    const content = normalizePostContent(post.content.rendered);
    const cat = pickCategory(post, wpCategories);
    return {
      slug: post.slug,
      title,
      excerpt,
      content,
      featuredImageUrl: featuredImageUrl(post),
      author: "8 Degree Team",
      categorySlug: cat?.slug ?? null,
      categoryName: cat ? decodeHtml(cat.name) : null,
      readingTime: readingTimeMinutes(plain),
      publishedAt: post.date,
      sourceUrl: post.link,
    };
  });
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const exportOnly = process.argv.includes("--export-only");
  const fromJson = process.argv.includes("--from-json");

  let rows: ExportRow[];

  if (fromJson) {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const jsonPath = path.join(here, "../data/journal-import.json");
    const body = JSON.parse(readFileSync(jsonPath, "utf8")) as { posts: ExportRow[] };
    rows = body.posts;
    console.log(`Loaded ${rows.length} posts from ${jsonPath}`);
  } else {
    console.log(`Fetching posts from ${WP_API} …`);
    const [posts, wpCategories] = await Promise.all([fetchAllPosts(), fetchCategories()]);
    console.log(`Found ${posts.length} published posts (oldest: ${posts[0]?.date}, newest: ${posts.at(-1)?.date})`);
    rows = await buildExportRows(posts, wpCategories);
  }

  if (exportOnly) {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const outDir = path.join(here, "../data");
    mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "journal-import.json");
    const payload = JSON.stringify({ importedAt: new Date().toISOString(), posts: rows }, null, 2);
    writeFileSync(outPath, payload);
    const apiDataPath = path.resolve(here, "../../artifacts/api-server/data/journal-import.json");
    mkdirSync(path.dirname(apiDataPath), { recursive: true });
    writeFileSync(apiDataPath, payload);
    console.log(`Wrote ${rows.length} posts to ${outPath}`);
    console.log(`Wrote ${rows.length} posts to ${apiDataPath}`);
    return;
  }

  if (dryRun) {
    for (const r of rows) {
      console.log(`  ${r.publishedAt.slice(0, 10)}  ${r.slug}  [${r.categoryName ?? "—"}]`);
    }
    console.log("Dry run complete — no database writes.");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) usage();

  const pool = new Pool({ connectionString: databaseUrl });
  const categoryIdBySlug = new Map<string, number>();

  async function ensureCategory(cat: WpCategory | null): Promise<number | null> {
    if (!cat || cat.slug === "uncategorized") return null;
    const existing = categoryIdBySlug.get(cat.slug);
    if (existing) return existing;
    const res = await pool.query<{ id: number }>(
      `INSERT INTO blog_categories (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [decodeHtml(cat.name), cat.slug],
    );
    categoryIdBySlug.set(cat.slug, res.rows[0].id);
    return res.rows[0].id;
  }

  try {
    for (const cat of wpCategories.values()) {
      await ensureCategory(cat);
    }

    let imported = 0;
    for (const row of rows) {
      const cat =
        row.categorySlug && row.categoryName
          ? { id: 0, slug: row.categorySlug, name: row.categoryName }
          : null;
      const categoryId = await ensureCategory(cat);

      await pool.query(
        `INSERT INTO blog_posts (
          title, slug, excerpt, content, featured_image_url, author,
          category_id, reading_time, published, published_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $9, now())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          featured_image_url = EXCLUDED.featured_image_url,
          author = EXCLUDED.author,
          category_id = EXCLUDED.category_id,
          reading_time = EXCLUDED.reading_time,
          published = true,
          published_at = EXCLUDED.published_at,
          updated_at = now()`,
        [
          row.title,
          row.slug,
          row.excerpt,
          row.content,
          row.featuredImageUrl,
          row.author,
          categoryId,
          row.readingTime,
          new Date(row.publishedAt),
        ],
      );
      imported += 1;
    }

    const count = await pool.query<{ n: string }>("SELECT count(*)::text AS n FROM blog_posts WHERE published = true");
    console.log(`Imported/updated ${imported} posts. Published total in DB: ${count.rows[0].n}`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
