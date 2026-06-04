#!/usr/bin/env node
/**
 * Verify legacy WordPress serves journal uploads and (optionally) production proxy.
 *
 *   LEGACY_WP_ORIGIN=https://legacy.8degree.co pnpm journal:verify-media
 *   pnpm journal:verify-media -- https://legacy.8degree.co
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchLegacyWpAsset } from "./lib/legacy-wp-fetch.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMPORT = path.join(ROOT, "artifacts/8degree/public/journal-import.json");

const legacy =
  process.argv[2]?.trim() ||
  process.env.LEGACY_WP_ORIGIN?.trim() ||
  process.env.JOURNAL_MEDIA_SOURCE_BASE?.trim() ||
  "";

if (!legacy) {
  console.error("Usage: LEGACY_WP_ORIGIN=https://legacy.8degree.co pnpm journal:verify-media");
  process.exit(1);
}

const base = legacy.replace(/\/$/, "");
const posts = JSON.parse(readFileSync(IMPORT, "utf8")).posts ?? [];
const samples = posts
  .map((p) => p.featuredImageUrl)
  .filter(Boolean)
  .slice(0, 5);

console.log(`Legacy origin: ${base}\n`);

async function head(label, url) {
  try {
    const res = await fetchLegacyWpAsset(url, base);
    const type = res.contentType;
    const ok = res.ok && /^image\//i.test(type);
    console.log(`${ok ? "OK" : "FAIL"} ${label}`);
    console.log(`     ${res.status} ${type || "(no type)"} (${res.buffer?.length ?? 0} bytes)`);
    console.log(`     ${url}\n`);
    return ok;
  } catch (err) {
    console.log(`FAIL ${label}`);
    console.log(`     ${err instanceof Error ? err.message : err}\n`);
    return false;
  }
}

let pass = 0;
let total = 0;

total++;
if (await head("wp-login", `${base}/wp-login.php`)) pass++;

for (const raw of samples) {
  const m = raw.match(/\/wp-content\/uploads\/(.+)$/i);
  if (!m) continue;
  const rel = m[1];
  total++;
  if (await head("upload", `${base}/wp-content/uploads/${rel}`)) pass++;

  const prod = `https://8degree.co/wp-content/uploads/${rel}`;
  total++;
  if (await head("8degree.co proxy", prod)) pass++;
}

console.log(`Result: ${pass}/${total} checks passed`);
if (pass < total) {
  console.log("\nNext steps:");
  console.log("  1. Finish DNS + Hostinger subdomain (see migration/LEGACY-WORDPRESS-SUBDOMAIN.md)");
  console.log("  2. Set JOURNAL_MEDIA_SOURCE_BASE on Vercel → redeploy");
  console.log("  3. Or run: JOURNAL_MEDIA_SOURCE_BASE=" + base + " pnpm journal:sync-media");
}
process.exit(pass === total ? 0 : 1);
