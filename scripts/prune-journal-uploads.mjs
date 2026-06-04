#!/usr/bin/env node
/**
 * Keep only wp-content/uploads files referenced in journal-import.json.
 * Run after an accidental JOURNAL_MEDIA_SCOPE=all sync.
 */
import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMPORT = path.join(ROOT, "artifacts/8degree/public/journal-import.json");
const UPLOADS = path.join(ROOT, "artifacts/8degree/public/journal-media");
const UPLOADS_RE = /\/wp-content\/uploads\/(.+?)(?:\?[^"'\\s]*)?$/i;

function addUrl(rels, raw) {
  const m = UPLOADS_RE.exec(raw?.trim() ?? "");
  if (m?.[1]) rels.add(m[1].replace(/^\/+/, ""));
}

function collectJournalRels(posts) {
  const rels = new Set();
  const re = /https?:\/\/[^"'\\s<>]+/gi;
  for (const post of posts) {
    addUrl(rels, post.featuredImageUrl);
    for (const m of (post.content ?? "").matchAll(re)) addUrl(rels, m[0]);
  }
  return rels;
}

async function walk(dir, keep, remove) {
  for (const name of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      await walk(full, keep, remove);
      if ((await readdir(full)).length === 0) await rm(full, { recursive: true });
      continue;
    }
    const rel = path.relative(UPLOADS, full).split(path.sep).join("/");
    if (!keep.has(rel)) {
      remove.push(full);
      await rm(full);
    }
  }
}

const { readFile } = await import("node:fs/promises");
const data = JSON.parse(await readFile(IMPORT, "utf8"));
const keep = collectJournalRels(data.posts ?? []);
const remove = [];
await walk(UPLOADS, keep, remove);
console.log(`Kept ${keep.size} journal paths, removed ${remove.length} files.`);
let bytes = 0;
for (const rel of keep) {
  try {
    const s = await stat(path.join(UPLOADS, rel));
    bytes += s.size;
  } catch {
    /* missing ok */
  }
}
console.log(`Journal uploads on disk: ~${(bytes / 1024 / 1024).toFixed(1)} MB`);
