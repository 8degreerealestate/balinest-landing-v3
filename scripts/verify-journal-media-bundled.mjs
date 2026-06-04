#!/usr/bin/env node
/**
 * Ensures every journal image referenced in journal-import.json exists under
 * artifacts/8degree/public/journal-media/ (shipped with Vercel static deploy).
 */
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMPORT = path.join(ROOT, "artifacts/8degree/public/journal-import.json");
const MEDIA_ROOT = path.join(ROOT, "artifacts/8degree/public/journal-media");
const MANIFEST = path.join(MEDIA_ROOT, "manifest.json");
const UPLOADS_RE = /\/wp-content\/uploads\/(.+?)(?:\?[^"'\\s]*)?$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

function collectImageRels(posts) {
  const rels = new Set();
  const re = /https?:\/\/[^"'\\s<>]+/gi;
  for (const post of posts) {
    for (const raw of [post.featuredImageUrl, ...(post.content ?? "").matchAll(re)].flat()) {
      const url = typeof raw === "string" ? raw : raw[0];
      const m = UPLOADS_RE.exec(url?.trim() ?? "");
      if (!m?.[1]) continue;
      const rel = m[1].replace(/^\/+/, "");
      if (IMAGE_EXT.test(rel)) rels.add(rel);
    }
  }
  return rels;
}

const data = JSON.parse(await readFile(IMPORT, "utf8"));
const required = [...collectImageRels(data.posts ?? [])].sort();
const missing = [];

for (const rel of required) {
  try {
    await access(path.join(MEDIA_ROOT, rel));
  } catch {
    missing.push(rel);
  }
}

if (missing.length > 0) {
  console.error(`Missing ${missing.length}/${required.length} bundled journal images in public/journal-media/:\n`);
  for (const rel of missing) console.error(`  - ${rel}`);
  console.error("\nRun: JOURNAL_MEDIA_SOURCE_BASE=… JOURNAL_MEDIA_SNI=8degree.co pnpm journal:sync-media");
  process.exit(1);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  count: required.length,
  paths: required,
};
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`OK: ${required.length} journal images bundled in public/journal-media/`);
console.log(`Manifest: ${path.relative(ROOT, MANIFEST)}`);
