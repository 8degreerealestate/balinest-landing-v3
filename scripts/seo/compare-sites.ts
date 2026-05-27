#!/usr/bin/env tsx
/**
 * Compare crawled WordPress SEO vs a staging/production deployment.
 *
 * Usage:
 *   pnpm seo:compare -- --staging=https://balinest-landing-v3.vercel.app
 */
import { existsSync } from "node:fs";
import type { SeoAuditEntry, SeoAuditFile } from "../../migration/seo-types.ts";
import {
  MIGRATION_DIR,
  fetchText,
  firstTagText,
  linkHref,
  metaContent,
  normalizePath,
  readJson,
  resolveNewPath,
  writeJson,
} from "./lib.ts";

const staging = (process.argv.find((a) => a.startsWith("--staging="))?.split("=")[1] ??
  process.env.STAGING_ORIGIN ??
  "").replace(/\/$/, "");

async function crawlOrigin(origin: string, paths: string[]): Promise<SeoAuditEntry[]> {
  const entries: SeoAuditEntry[] = [];
  for (const p of paths) {
    const url = `${origin}${p === "/" ? "" : p}`;
    const { status, body } = await fetchText(url);
    entries.push({
      old_url: url,
      path: p,
      seo_title: metaContent(body, "name", "title") ?? firstTagText(body, "title"),
      meta_description: metaContent(body, "name", "description"),
      canonical: linkHref(body, "canonical"),
      h1: firstTagText(body, "h1"),
      h2: [],
      h3: [],
      og_title: metaContent(body, "property", "og:title"),
      og_description: metaContent(body, "property", "og:description"),
      og_image: metaContent(body, "property", "og:image"),
      og_type: null,
      twitter_card: null,
      schema_type: null,
      schema_json: null,
      status_code: status,
      indexable: status === 200,
      internal_links: [],
      image_alts: [],
      new_url: null,
      redirect_required: false,
    });
  }
  return entries;
}

async function main(): Promise<void> {
  const auditPath = `${MIGRATION_DIR}/seo-audit.json`;
  if (!existsSync(auditPath)) {
    console.error("Missing migration/seo-audit.json — run pnpm seo:crawl first.");
    process.exit(1);
  }
  if (!staging) {
    console.error("Set --staging=https://your-deploy.vercel.app or STAGING_ORIGIN");
    process.exit(1);
  }

  const oldAudit = readJson<SeoAuditFile>(auditPath);
  const journalSlugs = new Set(
    oldAudit.entries
      .filter((e) => e.new_url?.startsWith("/journal/"))
      .map((e) => e.new_url!.replace(/^\/journal\//, "")),
  );

  const paths = [
    ...new Set(
      oldAudit.entries
        .map((e) => e.new_url ?? resolveNewPath(e.path, journalSlugs))
        .filter((p): p is string => Boolean(p)),
    ),
  ].sort();

  console.log(`Comparing ${paths.length} paths on ${staging}…`);
  const newEntries = await crawlOrigin(staging, paths);

  type Issue = { severity: "error" | "warn"; path: string; message: string };
  const issues: Issue[] = [];

  const newByPath = new Map(newEntries.map((e) => [e.path, e]));
  const oldByNew = new Map<string, SeoAuditFile["entries"][0]>();
  for (const e of oldAudit.entries) {
    const np = e.new_url ?? resolveNewPath(e.path, journalSlugs);
    if (np) oldByNew.set(np, e);
  }

  for (const p of paths) {
    const neu = newByPath.get(p);
    const old = oldByNew.get(p);
    if (!neu) {
      issues.push({ severity: "error", path: p, message: "Missing on staging" });
      continue;
    }
    if (neu.status_code === 404) {
      issues.push({ severity: "error", path: p, message: "404 on staging" });
    }
    if (neu.status_code >= 300 && neu.status_code < 400) {
      issues.push({ severity: "warn", path: p, message: `Redirect chain (${neu.status_code})` });
    }
    if (old?.seo_title && neu.seo_title && !neu.seo_title.toLowerCase().includes(old.seo_title.slice(0, 20).toLowerCase())) {
      issues.push({ severity: "warn", path: p, message: "Title differs significantly from WordPress" });
    }
    if (!neu.meta_description) {
      issues.push({ severity: "warn", path: p, message: "Missing meta description" });
    }
    if (!neu.h1) {
      issues.push({ severity: "warn", path: p, message: "Missing H1 in HTML (may be client-rendered)" });
    }
  }

  const report = {
    comparedAt: new Date().toISOString(),
    staging,
    pathsChecked: paths.length,
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warn"),
  };

  writeJson(`${MIGRATION_DIR}/compare-report.json`, report);
  console.log(`Errors: ${report.errors.length}, warnings: ${report.warnings.length}`);
  console.log(`Report → migration/compare-report.json`);
  if (report.errors.length > 0) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
