/** Server-side similar-listing scoring (mirrors frontend pickSimilarInventoryListings). */

type SimilarListingRow = {
  code: string;
  title: string;
  description: string;
  location: string | null;
  estimatePriceUsd: string | null;
  br: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  channel: string;
  visibility?: string;
  saleStatus?: string;
  featured?: boolean;
  sortOrder?: number;
};

/** Letter-suffixed unit variants only (8DV106A/B). Do not collapse 8D25138 → 8D251. */
function listingFamilyKey(code: string): string {
  const c = code.trim().toUpperCase();
  const letterSuffix = /^(.+\d)([A-Z])$/.exec(c);
  if (letterSuffix && letterSuffix[1].length >= 5) return letterSuffix[1];
  return c;
}

function isDisplayableImageUrl(url: string | null | undefined): boolean {
  const t = (url ?? "").trim();
  if (!t || !/^https?:\/\//i.test(t)) return false;
  return !/drive\.google\.com\/drive\/folders\//i.test(t);
}

function hasThumbnail(row: SimilarListingRow): boolean {
  if (isDisplayableImageUrl(row.imageUrl)) return true;
  return row.imageUrls.some((u) => isDisplayableImageUrl(u));
}

function inferArea(title: string, description: string): string {
  const hay = `${title} ${description}`.toLowerCase();
  const areas = [
    "pererenan",
    "canggu",
    "seminyak",
    "uluwatu",
    "ubud",
    "jimbaran",
    "sanur",
    "umalas",
    "tabanan",
    "nyanyi",
    "bingin",
    "pecatu",
    "berawa",
  ];
  for (const a of areas) {
    if (hay.includes(a)) return a;
  }
  return "";
}

function parseUsd(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null;
  const n = Number(raw.replace(/,/g, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function scoreSimilar(candidate: SimilarListingRow, current: SimilarListingRow): number {
  if (candidate.code.trim().toUpperCase() === current.code.trim().toUpperCase()) return -1;

  let score = 0;
  const currentArea = (current.location?.trim() || inferArea(current.title, current.description)).toLowerCase();
  const candidateArea = (candidate.location?.trim() || inferArea(candidate.title, candidate.description)).toLowerCase();
  if (currentArea && candidateArea) {
    if (currentArea === candidateArea) score += 50;
    else if (currentArea.includes(candidateArea) || candidateArea.includes(currentArea)) score += 25;
  }

  if (listingFamilyKey(candidate.code) !== listingFamilyKey(current.code)) score += 8;

  const curBr = current.br?.trim() ? Number(current.br) : NaN;
  const candBr = candidate.br?.trim() ? Number(candidate.br) : NaN;
  if (!Number.isNaN(curBr) && !Number.isNaN(candBr)) {
    const diff = Math.abs(curBr - candBr);
    if (diff === 0) score += 22;
    else if (diff === 1) score += 12;
    else if (diff === 2) score += 4;
  }

  const curPrice = parseUsd(current.estimatePriceUsd);
  const candPrice = parseUsd(candidate.estimatePriceUsd);
  if (curPrice != null && candPrice != null && curPrice > 0) {
    const ratio = Math.abs(candPrice - curPrice) / curPrice;
    if (ratio <= 0.2) score += 18;
    else if (ratio <= 0.35) score += 10;
    else if (ratio <= 0.55) score += 4;
  }

  if (candidate.featured) score += 6;
  return score;
}

function isPublicWebsiteListing(row: SimilarListingRow): boolean {
  const vis = row.visibility ?? "active";
  const sale = row.saleStatus ?? "available";
  return vis !== "draft" && sale !== "sold" && row.channel === "website";
}

export function pickSimilarInventoryListings<T extends SimilarListingRow>(
  current: T,
  pool: T[],
  limit = 3,
  options?: { requireThumbnail?: boolean },
): T[] {
  const requireThumbnail = options?.requireThumbnail !== false;
  const eligible = pool.filter(isPublicWebsiteListing);
  return eligible
    .map((row) => ({ row, score: scoreSimilar(row, current) }))
    .filter((entry) => entry.score > 0 && (!requireThumbnail || hasThumbnail(entry.row)))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.row.sortOrder ?? 0) - (b.row.sortOrder ?? 0) ||
        a.row.code.localeCompare(b.row.code),
    )
    .slice(0, limit)
    .map((entry) => entry.row);
}

export function listingRowHasThumbnail(row: SimilarListingRow): boolean {
  return hasThumbnail(row);
}
