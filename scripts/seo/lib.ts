import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEO_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(SEO_DIR, "../..");
export const MIGRATION_DIR = path.join(REPO_ROOT, "migration");
export const JOURNAL_IMPORT_PATH = path.join(
  REPO_ROOT,
  "artifacts/8degree/public/journal-import.json",
);
export const VERCEL_JSON_PATH = path.join(REPO_ROOT, "vercel.json");
export const SEO_DATA_OUT = path.join(
  REPO_ROOT,
  "artifacts/8degree/src/generated/seo-data.ts",
);

export function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export function writeJson(filePath: string, data: unknown): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function normalizePath(urlOrPath: string, origin: string): string {
  try {
    const u = urlOrPath.startsWith("http") ? new URL(urlOrPath) : new URL(urlOrPath, origin);
    let p = u.pathname.replace(/\/+$/, "") || "/";
    return p;
  } catch {
    const p = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
    return p.replace(/\/+$/, "") || "/";
  }
}

export function decodeHtml(text: string): string {
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

export function stripHtml(html: string): string {
  return decodeHtml(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function truncateMeta(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).trimEnd().replace(/[,;\s]+$/g, "");
  return `${cut}…`;
}

export function parseSitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
}

export async function fetchText(url: string, timeoutMs = 25_000): Promise<{ status: number; body: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "8degree-seo-migration/1.0 (+https://8degree.co)",
      },
      redirect: "follow",
    });
    return { status: res.status, body: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

export function metaContent(html: string, attr: "name" | "property", key: string): string | null {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const m = html.match(re);
  if (m?.[1]) return decodeHtml(m[1].trim());
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i",
  );
  return re2?.[1] ? decodeHtml(re2[1].trim()) : null;
}

export function linkHref(html: string, rel: string): string | null {
  const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']`, "i");
  const m = html.match(re);
  if (m?.[1]) return m[1].trim();
  const re2 = new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["']${rel}["']`, "i");
  return re2?.[1]?.trim() ?? null;
}

export function firstTagText(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = html.match(re);
  return m?.[1] ? stripHtml(m[1]) : null;
}

export function allTagText(html: string, tag: string, limit = 12): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < limit) {
    const t = stripHtml(m[1]);
    if (t) out.push(t);
  }
  return out;
}

export function jsonLdBlocks(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim()) as Record<string, unknown>;
      blocks.push(parsed);
    } catch {
      /* skip invalid */
    }
  }
  return blocks;
}

export function internalLinks(html: string, origin: string): string[] {
  const host = new URL(origin).host;
  const links = new Set<string>();
  const re = /<a[^>]+href=["']([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const u = new URL(m[1], origin);
      if (u.host === host) links.add(normalizePath(u.href, origin));
    } catch {
      /* ignore */
    }
  }
  return [...links];
}

export function imageAlts(html: string): Array<{ src: string; alt: string }> {
  const out: Array<{ src: string; alt: string }> = [];
  const re = /<img[^>]+>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    if (src) out.push({ src, alt });
  }
  return out;
}

/** Known WordPress → React route mappings (path without trailing slash). */
export const WP_TO_NEW_PATH: Record<string, string> = {
  "/": "/",
  "/about-us": "/about-us",
  "/about": "/about-us",
  "/contact": "/contact",
  "/contact-us": "/contact",
  "/buyer-agents": "/buyer-agents",
  "/buyer-agent": "/buyer-agents",
  "/seller-agents": "/seller-agents",
  "/seller-agent": "/seller-agents",
  "/investment-guide": "/investment-guide",
  "/invest": "/invest",
  "/sell": "/sell",
  "/pricing": "/pricing",
  "/journal": "/journal",
  "/blog": "/journal",
  "/projects": "/projects",
  "/properties": "/projects",
  "/property": "/projects",
  "/buy-land": "/buy-land",
  "/long-term-rentals": "/long-term-rentals",
  "/legal-guide": "/legal-guide",
  "/legal-services": "/legal-services",
  "/legal-and-due-diligence": "/legal-and-due-diligence",
  "/bali-location-guide": "/bali-location-guide",
  "/bali-property-guide": "/bali-property-guide",
  "/location-guide": "/location-guide",
  "/favorite-properties": "/favorite-properties",
  "/frequently-asked-questions": "/frequently-asked-questions",
  "/company-overview": "/company-overview",
  "/testimony": "/testimony",
  "/data-driven": "/data-driven",
  "/completed-projects": "/projects/completed",
};

export function resolveNewPath(oldPath: string, journalSlugs: Set<string>): string | null {
  const p = oldPath.replace(/\/+$/, "") || "/";
  if (WP_TO_NEW_PATH[p]) return WP_TO_NEW_PATH[p];

  const property = p.match(/^\/(?:property|properties)\/([^/]+)$/i);
  if (property) {
    const code = decodeURIComponent(property[1]).toLowerCase();
    return `/property/${encodeURIComponent(code)}`;
  }

  const rootSlug = p.match(/^\/([^/]+)$/);
  if (rootSlug && journalSlugs.has(rootSlug[1])) {
    return `/${encodeURIComponent(rootSlug[1])}`;
  }

  const wpJournal = p.match(/^\/journal\/([^/]+)$/);
  if (wpJournal && journalSlugs.has(wpJournal[1])) {
    return `/${encodeURIComponent(wpJournal[1])}`;
  }

  const blogSlug = p.match(/^\/blog\/([^/]+)$/);
  if (blogSlug) return `/${encodeURIComponent(blogSlug[1])}`;

  return null;
}

export const INDEXABLE_STATIC_PATHS = [
  "/",
  "/about-us",
  "/contact",
  "/projects",
  "/projects/completed",
  "/journal",
  "/investment-guide",
  "/invest",
  "/sell",
  "/buyer-agents",
  "/buyer-agent",
  "/seller-agents",
  "/seller-agent",
  "/legal-guide",
  "/legal-services",
  "/legal-and-due-diligence",
  "/bali-location-guide",
  "/bali-property-guide",
  "/location-guide",
  "/long-term-rentals",
  "/pricing",
  "/buy-land",
  "/favorite-properties",
  "/frequently-asked-questions",
  "/company-overview",
  "/testimony",
  "/data-driven",
] as const;
