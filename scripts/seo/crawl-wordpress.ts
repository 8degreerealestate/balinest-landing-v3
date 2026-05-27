#!/usr/bin/env tsx
/**
 * Crawl the live WordPress site and export SEO metadata for migration.
 *
 * Usage:
 *   pnpm seo:crawl
 *   WP_ORIGIN=https://8degree.co pnpm seo:crawl
 *   pnpm seo:crawl -- --max=50
 */
import { existsSync } from "node:fs";
import type { SeoAuditEntry, SeoAuditFile } from "../../migration/seo-types.ts";
import {
  MIGRATION_DIR,
  JOURNAL_IMPORT_PATH,
  fetchText,
  firstTagText,
  allTagText,
  imageAlts,
  internalLinks,
  jsonLdBlocks,
  linkHref,
  metaContent,
  normalizePath,
  parseSitemapLocs,
  readJson,
  resolveNewPath,
  writeJson,
} from "./lib.ts";

const ORIGIN = (process.env.WP_ORIGIN ?? "https://8degree.co").replace(/\/$/, "");
const maxArg = process.argv.find((a) => a.startsWith("--max="));
const MAX_URLS = maxArg ? Number(maxArg.split("=")[1]) : 0;

type JournalImport = { posts: Array<{ slug: string }> };

async function discoverUrls(): Promise<string[]> {
  const indexXml = (await fetchText(`${ORIGIN}/sitemap_index.xml`)).body;
  const childSitemaps = parseSitemapLocs(indexXml).filter((u) =>
    /(post|page|property)-sitemap\.xml$/i.test(u),
  );

  const urls = new Set<string>();
  for (const sm of childSitemaps) {
    const { body } = await fetchText(sm);
    for (const loc of parseSitemapLocs(body)) urls.add(loc);
  }

  if (urls.size === 0) {
    urls.add(`${ORIGIN}/`);
  }

  const list = [...urls];
  return MAX_URLS > 0 ? list.slice(0, MAX_URLS) : list;
}

function schemaSummary(blocks: Record<string, unknown>[]): { type: string | null; json: Record<string, unknown> | null } {
  for (const block of blocks) {
    const graph = block["@graph"];
    if (Array.isArray(graph) && graph[0] && typeof graph[0] === "object") {
      const node = graph[0] as Record<string, unknown>;
      return { type: String(node["@type"] ?? "Graph"), json: block };
    }
    if (block["@type"]) {
      return { type: String(block["@type"]), json: block };
    }
  }
  return { type: null, json: blocks[0] ?? null };
}

async function crawlUrl(url: string, journalSlugs: Set<string>): Promise<SeoAuditEntry> {
  const path = normalizePath(url, ORIGIN);
  const { status, body } = await fetchText(url);
  const blocks = jsonLdBlocks(body);
  const schema = schemaSummary(blocks);
  const newPath = resolveNewPath(path, journalSlugs);
  const redirectRequired = Boolean(newPath && newPath !== path);

  return {
    old_url: url,
    path,
    seo_title: metaContent(body, "name", "title") ?? firstTagText(body, "title"),
    meta_description: metaContent(body, "name", "description"),
    canonical: linkHref(body, "canonical"),
    h1: firstTagText(body, "h1"),
    h2: allTagText(body, "h2"),
    h3: allTagText(body, "h3"),
    og_title: metaContent(body, "property", "og:title"),
    og_description: metaContent(body, "property", "og:description"),
    og_image: metaContent(body, "property", "og:image"),
    og_type: metaContent(body, "property", "og:type"),
    twitter_card: metaContent(body, "name", "twitter:card"),
    schema_type: schema.type,
    schema_json: schema.json,
    status_code: status,
    indexable: status === 200 && !/noindex/i.test(body),
    internal_links: internalLinks(body, ORIGIN),
    image_alts: imageAlts(body),
    new_url: newPath,
    redirect_required: redirectRequired,
  };
}

async function main(): Promise<void> {
  const journal = existsSync(JOURNAL_IMPORT_PATH)
    ? readJson<JournalImport>(JOURNAL_IMPORT_PATH)
    : { posts: [] };
  const journalSlugs = new Set(journal.posts.map((p) => p.slug));

  const urls = await discoverUrls();
  console.log(`Crawling ${urls.length} URLs from ${ORIGIN}…`);

  const entries: SeoAuditEntry[] = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`  [${i + 1}/${urls.length}] ${url}\n`);
    try {
      entries.push(await crawlUrl(url, journalSlugs));
    } catch (err) {
      console.warn(`  skip ${url}:`, err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  const audit: SeoAuditFile = {
    crawledAt: new Date().toISOString(),
    sourceSite: ORIGIN,
    entries,
  };

  const outPath = `${MIGRATION_DIR}/seo-audit.json`;
  writeJson(outPath, audit);
  console.log(`Wrote ${entries.length} entries → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
