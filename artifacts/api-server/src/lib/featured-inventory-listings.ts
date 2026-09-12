/** Server-side featured listing picker (mirrors FeaturedInventoryStrip sort). */

type FeaturedListingRow = {
  code: string;
  channel: string;
  visibility?: string;
  saleStatus?: string;
  featured?: boolean;
  sortOrder?: number;
  imageUrl: string | null;
  imageUrls: string[];
};

function isDisplayableImageUrl(url: string | null | undefined): boolean {
  const t = (url ?? "").trim();
  if (!t || !/^https?:\/\//i.test(t)) return false;
  return !/drive\.google\.com\/drive\/folders\//i.test(t);
}

export function listingRowHasDisplayableThumbnail(row: FeaturedListingRow): boolean {
  if (isDisplayableImageUrl(row.imageUrl)) return true;
  return row.imageUrls.some((u) => isDisplayableImageUrl(u));
}

function isPublicWebsiteListing(row: FeaturedListingRow): boolean {
  const vis = row.visibility ?? "active";
  const sale = row.saleStatus ?? "available";
  return vis !== "draft" && sale !== "sold" && row.channel === "website";
}

export function pickFeaturedInventoryListings<T extends FeaturedListingRow>(pool: T[], limit: number): T[] {
  return pool
    .filter(isPublicWebsiteListing)
    .sort(
      (a, b) =>
        Number(!!b.featured) - Number(!!a.featured) ||
        Number(listingRowHasDisplayableThumbnail(b)) - Number(listingRowHasDisplayableThumbnail(a)) ||
        a.code.localeCompare(b.code),
    )
    .slice(0, limit);
}
