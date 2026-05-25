import type { PropertyInventoryListing } from "@workspace/api-client-react";
import {
  borrowInventoryImages,
  inferBedroomsBucket,
  inferListingArea,
  listingFamilyKey,
  listingPriceLine,
  pickInventoryThumbnail,
} from "@/lib/portfolio-listing";
import { parseUsdNumber } from "@/lib/site-currency";

function normalizedArea(row: PropertyInventoryListing): string {
  return (row.location?.trim() || inferListingArea(row.title, row.description)).toLowerCase();
}

function bedroomNumber(row: PropertyInventoryListing): number | null {
  if (row.br?.trim()) {
    const n = Number(row.br.trim());
    if (!Number.isNaN(n)) return n;
  }
  return inferBedroomsBucket(row.title, row.description);
}

function priceUsd(row: PropertyInventoryListing): number | null {
  const fromField = parseUsdNumber(row.estimatePriceUsd ?? "");
  if (fromField != null) return fromField;
  return parseUsdNumber(listingPriceLine(row.description));
}

/** Higher score = more similar to the listing being viewed. */
export function scoreSimilarListing(
  candidate: PropertyInventoryListing,
  current: PropertyInventoryListing,
): number {
  if (candidate.code.trim() === current.code.trim()) return -1;

  let score = 0;
  const currentArea = normalizedArea(current);
  const candidateArea = normalizedArea(candidate);
  if (currentArea && candidateArea) {
    if (currentArea === candidateArea) score += 50;
    else if (currentArea.includes(candidateArea) || candidateArea.includes(currentArea)) score += 25;
  }

  const curFamily = listingFamilyKey(current.code);
  const candFamily = listingFamilyKey(candidate.code);
  if (curFamily !== candFamily) score += 8;

  const curBr = bedroomNumber(current);
  const candBr = bedroomNumber(candidate);
  if (curBr != null && candBr != null) {
    const diff = Math.abs(curBr - candBr);
    if (diff === 0) score += 22;
    else if (diff === 1) score += 12;
    else if (diff === 2) score += 4;
  }

  const curPrice = priceUsd(current);
  const candPrice = priceUsd(candidate);
  if (curPrice != null && candPrice != null && curPrice > 0) {
    const ratio = Math.abs(candPrice - curPrice) / curPrice;
    if (ratio <= 0.2) score += 18;
    else if (ratio <= 0.35) score += 10;
    else if (ratio <= 0.55) score += 4;
  }

  if (candidate.featured) score += 6;

  return score;
}

function isPublicActiveListing(row: PropertyInventoryListing): boolean {
  const vis = row.visibility ?? "active";
  const sale = row.saleStatus ?? "available";
  return vis !== "draft" && sale !== "sold" && row.channel === "website";
}

/**
 * Pick up to `limit` similar listings from spreadsheet/API inventory for the property detail page.
 * Only returns rows with a loadable thumbnail (after sibling image backfill).
 */
export function pickSimilarInventoryListings(
  current: PropertyInventoryListing,
  pool: PropertyInventoryListing[],
  limit = 3,
): PropertyInventoryListing[] {
  const eligible = pool.filter(isPublicActiveListing);
  const withBorrowed = eligible.map((row) => borrowInventoryImages(row, eligible));

  const ranked = withBorrowed
    .map((row) => ({ row, score: scoreSimilarListing(row, current) }))
    .filter((entry) => entry.score > 0 && pickInventoryThumbnail(entry.row))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.row.sortOrder ?? 0) - (b.row.sortOrder ?? 0) ||
        a.row.code.localeCompare(b.row.code),
    );

  return ranked.slice(0, limit).map((entry) => entry.row);
}
