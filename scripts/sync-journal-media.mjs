#!/usr/bin/env node
/**
 * Mirror WordPress journal uploads into artifacts/8degree/public/journal-media/.
 *
 * Usage:
 *   JOURNAL_MEDIA_SOURCE_BASE=https://your-old-wp.hostingersite.com pnpm journal:sync-media
 *   WP_SYNC_ORIGIN=https://... pnpm journal:sync-media
 *   JOURNAL_MEDIA_SOURCE_BASE=file:///path/to/site-root pnpm journal:sync-media
 *     (expects .../wp-content/uploads/ on disk)
 */
import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchLegacyWpAsset } from "./lib/legacy-wp-fetch.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const JSON_PATHS = [
  path.join(ROOT, "scripts/data/journal-import.json"),
  path.join(ROOT, "artifacts/8degree/public/journal-import.json"),
];
const JOURNAL_SEO = path.join(ROOT, "migration/journal-seo.json");
const SEO_AUDIT = path.join(ROOT, "migration/seo-audit.json");
const OUT_ROOT = path.join(ROOT, "artifacts/8degree/public/journal-media");

const UPLOADS_RE = /\/wp-content\/uploads\/(.+?)(?:\?[^"'\\s]*)?$/i;

const originRaw = (process.env.JOURNAL_MEDIA_SOURCE_BASE ?? process.env.WP_SYNC_ORIGIN ?? "").trim();

function relFromUrl(url) {
  const m = UPLOADS_RE.exec(url.trim());
  return m?.[1]?.replace(/^\/+/, "") ?? null;
}

function addUrl(urls, raw) {
  if (!raw?.trim()) return;
  const rel = relFromUrl(raw);
  if (rel) urls.add(rel);
}

async function collectRelativePaths() {
  const rels = new Set();
  const scope = (process.env.JOURNAL_MEDIA_SCOPE ?? "journal").toLowerCase();

  let dataPath = JSON_PATHS[0];
  for (const p of JSON_PATHS) {
    try {
      await access(p);
      dataPath = p;
      break;
    } catch {
      /* next */
    }
  }

  const data = JSON.parse(await readFile(dataPath, "utf8"));
  const re = /https?:\/\/[^"'\\s<>]+/gi;
  for (const post of data.posts ?? []) {
    addUrl(rels, post.featuredImageUrl);
    for (const m of (post.content ?? "").matchAll(re)) addUrl(rels, m[0]);
  }

  if (scope === "all" || scope === "site") {
    try {
      const seo = JSON.parse(await readFile(JOURNAL_SEO, "utf8"));
      for (const row of Object.values(seo)) {
        if (row && typeof row === "object" && "ogImage" in row) addUrl(rels, row.ogImage);
      }
    } catch {
      /* optional */
    }

    try {
      const audit = JSON.parse(await readFile(SEO_AUDIT, "utf8"));
      for (const entry of audit.entries ?? []) {
        addUrl(rels, entry.og_image);
        for (const img of entry.image_alts ?? []) addUrl(rels, img.src);
      }
    } catch {
      /* optional */
    }
  }

  return { rels: [...rels], dataPath, scope };
}

function candidateUrls(origin, rel) {
  const out = [];
  if (origin.startsWith("file://")) {
    out.push({ type: "file", path: path.join(fileURLToPath(origin), "wp-content/uploads", rel) });
    return out;
  }
  const base = origin.replace(/\/$/, "");
  out.push(`${base}/wp-content/uploads/${rel}`);
  const alt = rel.replace(/-scaled\.(jpe?g|png|webp)$/i, ".$1");
  if (alt !== rel) out.push(`${base}/wp-content/uploads/${alt}`);
  const sized = rel.replace(/\.(jpe?g|png|webp)$/i, "-1024x683.$1");
  if (sized !== rel) out.push(`${base}/wp-content/uploads/${sized}`);
  return out;
}

async function downloadRel(origin, rel) {
  const dest = path.join(OUT_ROOT, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  try {
    await access(dest);
    return { rel, status: "skip" };
  } catch {
    /* new */
  }

  for (const candidate of candidateUrls(origin, rel)) {
    if (typeof candidate === "object" && candidate.type === "file") {
      try {
        await access(candidate.path);
        await copyFile(candidate.path, dest);
        return { rel, status: "ok", from: candidate.path };
      } catch {
        continue;
      }
    }
    try {
      const res = await fetchLegacyWpAsset(candidate, origin);
      const type = res.contentType;
      if (!res.ok || !/^image\//i.test(type)) continue;
      if (res.buffer.length < 200) continue;
      await writeFile(dest, res.buffer);
      return { rel, status: "ok", bytes: res.buffer.length, url: candidate };
    } catch {
      /* next */
    }
  }
  return { rel, status: "fail" };
}

async function main() {
  if (!originRaw) {
    console.error(
      "Set JOURNAL_MEDIA_SOURCE_BASE or WP_SYNC_ORIGIN.\n" +
        "  HTTPS: Hostinger temporary URL that still serves wp-content/uploads\n" +
        "  file://: local folder containing wp-content/uploads (from Hostinger backup)",
    );
    process.exit(1);
  }

  const { rels, dataPath, scope } = await collectRelativePaths();
  console.log(`Source: ${originRaw}`);
  console.log(`Scope: ${scope} (${rels.length} paths)`);
  console.log(`Import: ${dataPath}`);
  console.log(`Output: ${OUT_ROOT}`);
  console.log(`Files: ${rels.length} unique uploads\n`);

  let ok = 0;
  let skip = 0;
  let fail = 0;
  for (const rel of rels) {
    const result = await downloadRel(originRaw, rel);
    if (result.status === "ok") {
      ok++;
      console.log(`  ok   ${rel}`);
    } else if (result.status === "skip") {
      skip++;
    } else {
      fail++;
      console.log(`  FAIL ${rel}`);
    }
  }

  console.log(`\nDone: ${ok} saved, ${skip} already present, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
