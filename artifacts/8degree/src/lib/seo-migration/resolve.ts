import type { JournalSeoRecord, PageSeoRecord } from "../../../../../migration/seo-types";
import { SEO_MIGRATION } from "@/generated/seo-data";
import { journalPostPath } from "@/lib/journal-paths";

export type ResolvedSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string | null;
  h1?: string;
};

function normalize(path: string): string {
  const p = path.split("?")[0] || "/";
  return p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p || "/";
}

export function resolvePageSeo(path: string, fallback: ResolvedSeo): ResolvedSeo {
  const p = normalize(path);
  const meta: PageSeoRecord | undefined = SEO_MIGRATION.pageMetadata[p];
  if (!meta) return fallback;

  return {
    title: meta.seoTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    canonicalPath: meta.canonical || p,
    image: meta.ogImage ?? fallback.image,
    h1: meta.h1 ?? fallback.h1,
  };
}

export function resolveJournalSeo(slug: string, fallback: ResolvedSeo): ResolvedSeo {
  const meta: JournalSeoRecord | undefined = SEO_MIGRATION.journalSeo[slug];
  if (!meta) return { ...fallback, canonicalPath: journalPostPath(slug) };

  return {
    title: meta.seoTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    canonicalPath: meta.canonical || journalPostPath(slug),
    image: meta.ogImage ?? fallback.image,
    h1: meta.h1 ?? fallback.h1,
  };
}

export function getSitemapPaths(): readonly string[] {
  return SEO_MIGRATION.sitemapPaths;
}

export function getMigrationRedirects(): readonly { source: string; destination: string }[] {
  return SEO_MIGRATION.redirects;
}
