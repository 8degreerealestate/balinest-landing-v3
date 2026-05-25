/**
 * Fail the build if any source file uses fetch("/api/...") or fetch(`/api/...`)
 * without going through apiUrl(); that breaks production when the SPA is on WordPress.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "..", "src");

const rawFetchApi = /fetch\s*\(\s*[`'"]\/api\//;
const rawFetchApiTemplate = /fetch\s*\(\s*`\/api\//;

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === "node_modules") continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|jsx|js)$/.test(name.name)) files.push(full);
  }
  return files;
}

let failed = false;
for (const file of walk(srcRoot)) {
  const text = fs.readFileSync(file, "utf8");
  if (rawFetchApi.test(text) || rawFetchApiTemplate.test(text)) {
    console.error(`[check-no-raw-api-fetch] Use apiUrl() instead of same-origin fetch for /api: ${path.relative(srcRoot, file)}`);
    failed = true;
  }
}

if (failed) {
  console.error("[check-no-raw-api-fetch] Fix the above files (import apiUrl from @/lib/api-base).");
  process.exit(1);
}

console.log("[check-no-raw-api-fetch] OK: no raw fetch(/api/...) in src/");
