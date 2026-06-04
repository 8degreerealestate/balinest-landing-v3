#!/usr/bin/env node
/**
 * Regenerate src/lib/phone-countries-data.generated.ts from restcountries.com.
 * Usage: node scripts/generate-phone-countries.mjs
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "src/lib/phone-countries-data.generated.ts");

function flag(iso2) {
  const code = iso2.toUpperCase();
  if (code.length !== 2) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const res = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name,idd");
if (!res.ok) throw new Error(`restcountries HTTP ${res.status}`);
const data = await res.json();

const byId = new Map();
for (const c of data) {
  const id = c.cca2?.toLowerCase();
  if (!id || id.length !== 2) continue;
  const name = c.name?.common;
  const root = c.idd?.root;
  const suffixes = c.idd?.suffixes;
  if (!root || !suffixes?.length || !name) continue;
  const dial = `${root}${suffixes[0]}`;
  byId.set(id, { id, dial, name });
}

let list = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
const idRow = list.find((x) => x.id === "id");
if (idRow) {
  list = list.filter((x) => x.id !== "id");
  list.unshift(idRow);
}

const lines = list.map((r) => {
  const label = `${r.name} (${r.dial})`;
  return `  { id: "${r.id}", dial: "${esc(r.dial)}", flag: "${flag(r.id)}", countryName: "${esc(r.name)}", label: "${esc(label)}" },`;
});

const body = `/** Generated — all ISO countries with E.164 codes (restcountries.com). Do not edit by hand; re-run scripts/generate-phone-countries.mjs */
export const PHONE_COUNTRIES_DATA = [
${lines.join("\n")}
] as const;

export type PhoneCountry = (typeof PHONE_COUNTRIES_DATA)[number];
`;

writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${list.length} countries to ${outPath}`);
