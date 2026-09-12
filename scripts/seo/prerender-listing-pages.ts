#!/usr/bin/env tsx
/**
 * Prerender `/property/{code}/index.html` shells with listing-specific Open Graph tags.
 * WhatsApp / social crawlers read HTML before JS runs — this makes previews work.
 *
 * Usage: tsx scripts/seo/prerender-listing-pages.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PropertyInventoryListing } from "../../lib/api-client-react/src/generated/api.schemas.ts";
import {
  buildListingOpenGraph,
  injectListingOpenGraphIntoHtml,
} from "../../artifacts/8degree/src/lib/listing-seo.ts";
import { REPO_ROOT } from "./lib.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST_INDEX = path.join(REPO_ROOT, "artifacts/8degree/dist/public/index.html");
const SITE_ORIGIN = (process.env.VITE_PUBLIC_SITE_URL || "https://8degree.co").replace(/\/$/, "");

type ExternalListingRow = Record<string, unknown>;

function mapSheetRow(row: ExternalListingRow): PropertyInventoryListing {
  return row as PropertyInventoryListing;
}

async function loadListingsFromSheet(): Promise<PropertyInventoryListing[]> {
  const mod = await import("../../artifacts/api-server/src/lib/property-inventory-sheet.ts");
  const rows = await mod.loadListingsFromGoogleSheet({ resolveDriveImages: true });
  return (rows ?? []).map(mapSheetRow);
}

async function loadListingsFromLiveApi(): Promise<PropertyInventoryListing[]> {
  const url = `${SITE_ORIGIN}/api/inventory/listings?limit=500&channel=website`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Live API ${res.status} for ${url}`);
  const data = (await res.json()) as { listings?: PropertyInventoryListing[] };
  return data.listings ?? [];
}

async function loadListings(): Promise<PropertyInventoryListing[]> {
  try {
    const fromSheet = await loadListingsFromSheet();
    if (fromSheet.length > 0) {
      console.log(`Loaded ${fromSheet.length} listings from Google Sheet for OG prerender.`);
      return fromSheet;
    }
  } catch (err) {
    console.warn("Sheet load failed for OG prerender:", err instanceof Error ? err.message : err);
  }

  try {
    const fromApi = await loadListingsFromLiveApi();
    console.log(`Loaded ${fromApi.length} listings from live API for OG prerender.`);
    return fromApi;
  } catch (err) {
    console.warn("Live API fallback failed for OG prerender:", err instanceof Error ? err.message : err);
    return [];
  }
}

function shouldPrerender(listing: PropertyInventoryListing): boolean {
  if (!listing.code?.trim()) return false;
  if (listing.visibility === "draft") return false;
  if (listing.saleStatus === "sold") return false;
  return true;
}

async function main(): Promise<void> {
  if (!existsSync(DIST_INDEX)) {
    console.warn(`Skip OG prerender — missing ${DIST_INDEX} (run vite build first).`);
    return;
  }

  const shellHtml = readFileSync(DIST_INDEX, "utf8");
  const listings = await loadListings();
  if (listings.length === 0) {
    console.warn("No listings loaded — OG prerender skipped.");
    return;
  }

  let written = 0;
  for (const listing of listings) {
    if (!shouldPrerender(listing)) continue;
    const meta = buildListingOpenGraph(listing, { siteOrigin: SITE_ORIGIN, imagePool: listings });
    const html = injectListingOpenGraphIntoHtml(shellHtml, meta);
    const code = listing.code.trim().toLowerCase();
    const outDir = path.join(REPO_ROOT, "artifacts/8degree/dist/public/property", code);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, "index.html"), html, "utf8");
    written += 1;
  }

  console.log(`Prerendered ${written} property OG pages under dist/public/property/*/index.html`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
