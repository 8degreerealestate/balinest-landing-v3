#!/usr/bin/env tsx
/**
 * Build migration redirects, page metadata, generated seo-data.ts, and vercel.json redirects.
 *
 * Usage: pnpm seo:build
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import type {
  JournalSeoRecord,
  MigrationBundle,
  PageSeoRecord,
  SeoAuditFile,
  SeoRedirect,
} from "../../migration/seo-types.ts";
import { LEGACY_PATH_REDIRECTS } from "../../artifacts/8degree/src/lib/legacy-path-redirects.ts";
import {
  INDEXABLE_STATIC_PATHS,
  JOURNAL_IMPORT_PATH,
  MIGRATION_DIR,
  SEO_DATA_OUT,
  VERCEL_JSON_PATH,
  normalizePath,
  readJson,
  resolveNewPath,
  truncateMeta,
  writeJson,
} from "./lib.ts";

type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  featuredImageUrl?: string | null;
  publishedAt?: string | null;
  sourceUrl?: string | null;
};

type JournalImport = { posts: JournalPost[] };

function auditPath(): string {
  return `${MIGRATION_DIR}/seo-audit.json`;
}

function entryToPageSeo(
  path: string,
  e: {
    seo_title: string | null;
    meta_description: string | null;
    canonical: string | null;
    h1: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
  },
): PageSeoRecord {
  const title = e.seo_title ?? e.h1 ?? "8 Degree";
  const desc = e.meta_description ?? "";
  const canonical = normalizePath(e.canonical ?? path, "https://8degree.co");
  return {
    seoTitle: title.replace(/\s*\|\s*8 Degree.*$/i, "").trim() || title,
    metaDescription: truncateMeta(desc || title),
    canonical,
    h1: e.h1 ?? undefined,
    ogTitle: e.og_title ?? undefined,
    ogDescription: e.og_description ? truncateMeta(e.og_description) : undefined,
    ogImage: e.og_image ?? undefined,
  };
}

function buildRedirects(journalSlugs: Set<string>, audit?: SeoAuditFile): SeoRedirect[] {
  const map = new Map<string, string>();

  const add = (source: string, destination: string) => {
    const src = source.replace(/\/+$/, "") || "/";
    const dst = destination.replace(/\/+$/, "") || "/";
    if (src === dst) return;
    if (!map.has(src)) map.set(src, dst);
  };

  add("/blog", "/journal");
  add("/about", "/about-us");
  add("/property", "/projects");

  if (audit) {
    for (const e of audit.entries) {
      if (!e.redirect_required || !e.new_url) continue;
      const path = e.path.replace(/\/+$/, "") || "/";
      const target = e.new_url.replace(/\/+$/, "") || "/";
      if (journalSlugs.has(path.replace(/^\//, "")) && target.startsWith("/journal/")) {
        add(path, target.replace(/^\/journal\//, "/"));
        continue;
      }
      if (target.startsWith("/properties/")) {
        const code = target.slice("/properties/".length);
        add(path, `/property/${encodeURIComponent(code.toLowerCase())}`);
        continue;
      }
      add(e.path, e.new_url);
    }
  }

  for (const slug of journalSlugs) {
    add(`/journal/${slug}`, `/${slug}`);
  }

  for (const [oldPath, newPath] of Object.entries({
    ...LEGACY_PATH_REDIRECTS,
    "/houzez_agent": "/about-us",
  })) {
    add(oldPath, newPath);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([source, destination]) => ({ source, destination, permanent: true }));
}

function buildPageMetadata(audit?: SeoAuditFile): Record<string, PageSeoRecord> {
  const out: Record<string, PageSeoRecord> = {};

  if (audit) {
    for (const e of audit.entries) {
      const target = e.new_url ?? e.path;
      if (!target || e.status_code !== 200) continue;
      if (target.startsWith("/property/")) continue;
      if (target.startsWith("/admin")) continue;
      out[target] = entryToPageSeo(target, e);
    }
  }

  const defaults: Record<string, PageSeoRecord> = {
    "/": {
      seoTitle: "Luxury Bali Real Estate & Strategic Developments",
      metaDescription:
        "Boutique Bali property advisory: luxury villas, developments, and curated listings. Portfolio, investment guidance, and opportunities across Bali.",
      canonical: "/",
      h1: "Luxury Bali Real Estate",
    },
    "/projects": {
      seoTitle: "Bali Properties for Sale",
      metaDescription:
        "Explore curated villas, developments, and land across Bali. Refine your search and view available listings.",
      canonical: "/projects",
    },
    "/journal": {
      seoTitle: "Journal · Bali Property Insights",
      metaDescription:
        "Market updates, investment guides, and Bali real estate insights from 8 Degree.",
      canonical: "/journal",
    },
    "/investment-guide": {
      seoTitle: "Bali Property Investment Guide",
      metaDescription:
        "Everything international investors need to know before buying property in Bali — ownership, ROI, and due diligence.",
      canonical: "/investment-guide",
    },
    "/contact": {
      seoTitle: "Contact 8 Degree",
      metaDescription: "Speak with our Bali property advisory team about acquisitions, listings, and investments.",
      canonical: "/contact",
    },
    "/about-us": {
      seoTitle: "About 8 Degree Real Estate",
      metaDescription: "Boutique Bali real estate advisory focused on quality, clarity, and investor outcomes.",
      canonical: "/about-us",
    },
  };

  for (const [path, meta] of Object.entries(defaults)) {
    if (!out[path]) out[path] = meta;
  }

  return out;
}

function buildJournalSeo(journal: JournalImport, audit?: SeoAuditFile): Record<string, JournalSeoRecord> {
  const auditByPath = new Map<string, SeoAuditFile["entries"][0]>();
  if (audit) {
    for (const e of audit.entries) {
      auditByPath.set(e.path, e);
      const slugMatch = e.path.match(/^\/([^/]+)$/);
      if (slugMatch) auditByPath.set(slugMatch[1], e);
    }
  }

  const out: Record<string, JournalSeoRecord> = {};
  for (const post of journal.posts) {
    const oldPath = normalizePath(post.sourceUrl ?? `/${post.slug}`, "https://8degree.co");
    const auditEntry =
      auditByPath.get(oldPath) ?? auditByPath.get(`/${post.slug}`) ?? auditByPath.get(post.slug);
    const articlePath = `/${post.slug}`;
    const base = auditEntry
      ? entryToPageSeo(articlePath, auditEntry)
      : {
          seoTitle: post.title,
          metaDescription: truncateMeta(post.excerpt || post.title),
          canonical: articlePath,
          ogImage: post.featuredImageUrl ?? undefined,
        };
    out[post.slug] = {
      ...base,
      slug: post.slug,
      oldPath,
      publishedAt: post.publishedAt ?? undefined,
    };
  }
  return out;
}

function buildSitemapPaths(journal: JournalImport): string[] {
  const paths = new Set<string>(INDEXABLE_STATIC_PATHS);
  for (const post of journal.posts) {
    paths.add(`/${post.slug}`);
  }
  return [...paths].sort();
}

function writeSeoDataTs(bundle: MigrationBundle): void {
  mkdirSync(path.dirname(SEO_DATA_OUT), { recursive: true });
  const body = `/* eslint-disable */
/** Generated by pnpm seo:build — do not edit manually. */
import type { MigrationBundle } from "../../../../migration/seo-types";

export const SEO_MIGRATION: MigrationBundle = ${JSON.stringify(bundle, null, 2)} as MigrationBundle;
`;
  writeFileSync(SEO_DATA_OUT, body, "utf8");
}

function syncVercelRedirects(redirects: SeoRedirect[]): void {
  const vercel = JSON.parse(readFileSync(VERCEL_JSON_PATH, "utf8")) as Record<string, unknown>;
  const existing = Array.isArray(vercel.redirects) ? (vercel.redirects as SeoRedirect[]) : [];
  const paramRedirects: SeoRedirect[] = [
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.8degree.co" }],
      destination: "https://8degree.co/:path*",
      permanent: true,
    },
    { source: "/properties/:code", destination: "/property/:code", permanent: true },
    { source: "/journal/:slug", destination: "/:slug", permanent: true },
    { source: "/blog/:slug", destination: "/:slug", permanent: true },
    { source: "/blog", destination: "/journal", permanent: true },
    { source: "/about", destination: "/about-us", permanent: true },
    { source: "/property", destination: "/projects", permanent: true },
    { source: "/invest/:path+", destination: "/invest", permanent: true },
    { source: "/invest/index.html", destination: "/invest", permanent: true },
  ];
  const manual = [
    ...paramRedirects,
    ...existing.filter(
      (r) =>
        (r.source?.includes(":") || r.has?.some((h) => h.type === "host")) &&
        !paramRedirects.some((p) => p.source === r.source && JSON.stringify(p.has) === JSON.stringify(r.has)),
    ),
  ];
  const merged = [...manual];
  const seen = new Set(manual.map((r) => r.source));
  for (const r of redirects) {
    if (seen.has(r.source)) continue;
    seen.add(r.source);
    merged.push({ source: r.source, destination: r.destination, permanent: r.permanent ?? true });
  }
  vercel.redirects = merged.slice(0, 1024);
  writeFileSync(VERCEL_JSON_PATH, `${JSON.stringify(vercel, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const journal = existsSync(JOURNAL_IMPORT_PATH)
    ? readJson<JournalImport>(JOURNAL_IMPORT_PATH)
    : { posts: [] };
  const journalSlugs = new Set(journal.posts.map((p) => p.slug));

  const audit = existsSync(auditPath()) ? readJson<SeoAuditFile>(auditPath()) : undefined;
  if (!audit) {
    console.warn("No migration/seo-audit.json — run pnpm seo:crawl for full metadata. Using journal import + defaults.");
  }

  const redirects = buildRedirects(journalSlugs, audit);
  const pageMetadata = buildPageMetadata(audit);
  const journalSeo = buildJournalSeo(journal, audit);
  const sitemapPaths = buildSitemapPaths(journal);

  const bundle: MigrationBundle = {
    generatedAt: new Date().toISOString(),
    redirects,
    pageMetadata,
    journalSeo,
    sitemapPaths,
  };

  writeJson(`${MIGRATION_DIR}/redirects.json`, { version: 1, redirects });
  writeJson(`${MIGRATION_DIR}/page-metadata.json`, pageMetadata);
  writeJson(`${MIGRATION_DIR}/journal-seo.json`, journalSeo);
  writeJson(`${MIGRATION_DIR}/sitemap-paths.json`, sitemapPaths);
  writeSeoDataTs(bundle);
  syncVercelRedirects(redirects);

  console.log(`Redirects: ${redirects.length}`);
  console.log(`Page metadata: ${Object.keys(pageMetadata).length}`);
  console.log(`Journal SEO: ${Object.keys(journalSeo).length}`);
  console.log(`Sitemap paths: ${sitemapPaths.length}`);
  console.log(`Generated ${SEO_DATA_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
