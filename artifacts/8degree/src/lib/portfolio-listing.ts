export const LISTING_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1613490908578-7804bb61483b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";

/** Group variants (e.g. 8DV106A / 8DV106B) for sharing gallery images. */
export function listingFamilyKey(code: string): string {
  const c = code.trim().toUpperCase();
  const letterSuffix = /^(.+\d)([A-Z])$/.exec(c);
  if (letterSuffix && letterSuffix[1].length >= 5) return letterSuffix[1];
  if (/^8D\d/i.test(c) && c.length >= 6) return c.slice(0, 5);
  if (/^8DV\d/i.test(c) && c.length >= 6) return c.slice(0, 5);
  return c;
}

/** True when URL can be used in `<img src>` (not a Drive folder link). */
export function isDisplayableInventoryImageUrl(url: string | null | undefined): boolean {
  const t = (url ?? "").trim();
  if (!t || !/^https?:\/\//i.test(t)) return false;
  if (/drive\.google\.com\/drive\/folders\//i.test(t)) return false;
  return true;
}

/** Same-origin proxy so Google Drive thumbnails load reliably in `<img>` tags. */
export function proxyInventoryImageUrl(url: string | null | undefined): string | null {
  const t = (url ?? "").trim();
  if (!t) return null;
  const thumb = /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/i.exec(t);
  if (thumb?.[1]) return `/api/inventory/thumb/${encodeURIComponent(thumb[1])}`;
  const file = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i.exec(t);
  if (file?.[1]) return `/api/inventory/thumb/${encodeURIComponent(file[1])}`;
  return t;
}

export function pickInventoryThumbnail(listing: {
  imageUrl?: string | null;
  imageUrls?: string[] | null;
}): string | null {
  const fromArr = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
  for (const u of fromArr) {
    if (isDisplayableInventoryImageUrl(u)) return proxyInventoryImageUrl(u.trim());
  }
  if (isDisplayableInventoryImageUrl(listing.imageUrl)) {
    return proxyInventoryImageUrl(listing.imageUrl!.trim());
  }
  return null;
}

export function inventoryGalleryUrls(listing: {
  imageUrl?: string | null;
  imageUrls?: string[] | null;
}): string[] {
  const fromArr = Array.isArray(listing.imageUrls)
    ? listing.imageUrls.filter((u): u is string => isDisplayableInventoryImageUrl(u))
    : [];
  if (fromArr.length > 0) return fromArr.map((u) => proxyInventoryImageUrl(u) ?? u);
  const single = pickInventoryThumbnail(listing);
  return single ? [single] : [];
}

/** Use a sibling row’s gallery when this listing has no resolved thumbnail yet. */
export function borrowInventoryImages<T extends { code: string; location?: string | null; imageUrl?: string | null; imageUrls?: string[] | null }>(
  row: T,
  pool: T[],
): T {
  if (pickInventoryThumbnail(row)) return row;
  const family = listingFamilyKey(row.code);
  const donor =
    pool.find(
      (r) => r.code !== row.code && listingFamilyKey(r.code) === family && pickInventoryThumbnail(r),
    ) ??
    (() => {
      const loc = row.location?.trim().toLowerCase();
      if (!loc) return undefined;
      return pool.find(
        (r) => r.code !== row.code && r.location?.trim().toLowerCase() === loc && pickInventoryThumbnail(r),
      );
    })();
  if (!donor) return row;
  return {
    ...row,
    imageUrl: donor.imageUrl ?? null,
    imageUrls: Array.isArray(donor.imageUrls) ? [...donor.imageUrls] : [],
  };
}

const AREA_KEYWORDS: { area: string; keys: string[] }[] = [
  { area: "Seminyak", keys: ["Seminyak", "Oberoi", "Bidadari", "Gang Kahyangan", "Dewi Sri"] },
  { area: "Canggu", keys: ["Canggu", "Berawa", "Pererenan", "Batu Bolong", "Padonan", "Babakan", "Tumbak Bayuh", "Kayu Tulang", "Buduk", "Munggu", "Seseh", "Cemagi", "Mengening"] },
  { area: "Uluwatu", keys: ["Uluwatu", "Bingin", "Pecatu", "Balangan", "Ungasan", "Melasti", "Dreamland", "Jimbaran", "Bukit"] },
  { area: "Ubud", keys: ["Ubud", "Tegallalang", "Gianyar", "Kemenuh", "Peliatan", "Mas "] },
  { area: "Sanur", keys: ["Sanur"] },
  { area: "Nusa Dua", keys: ["Nusa Dua", "Tanjung Benoa"] },
  { area: "Tabanan", keys: ["Tabanan", "Tanah Lot", "Nyanyi", "Kedungu", "Kaba-Kaba", "Buwit"] },
];

export function inferListingArea(title: string, description: string): string {
  const hay = `${title}\n${description}`.slice(0, 1200);
  for (const { area, keys } of AREA_KEYWORDS) {
    if (keys.some((k) => hay.includes(k))) return area;
  }
  return "Bali";
}

export function inferBedroomsBucket(title: string, description: string): number | null {
  const t = `${title}\n${description}`;
  const m = t.match(/\b(\d+)\s*[-–]?\s*(?:bedroom|bedrooms)\b/i);
  if (m) {
    const n = Number(m[1]);
    return n >= 4 ? 4 : n;
  }
  const m2 = t.match(/\b(\d+)\s*BR\b/i);
  if (m2) {
    const n = Number(m2[1]);
    return n >= 4 ? 4 : n;
  }
  return null;
}

export function listingPriceLine(description: string): string {
  const d = description.slice(0, 4000);
  const usd = d.match(/USD\s*([\d,.]+)\s*(k|K)?/i);
  if (usd) return `From USD ${usd[1].replace(/,/g, "")}`;
  const idr = d.match(/IDR\s*([\d .]+)\s*Billion/i);
  if (idr) return `From IDR ${idr[1].trim()} Billion`;
  const idr2 = d.match(/Rp\.?\s*([\d .,]+)/i);
  if (idr2) return `From ${idr2[0].trim()}`;
  const eur = d.match(/EUR\s*([\d,.]+)/i);
  if (eur) return `From EUR ${eur[1].replace(/,/g, "")}`;
  return "Price on request";
}

export function listingShortBlurb(description: string, maxLen = 160): string {
  const t = description.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length <= maxLen ? t : `${t.slice(0, maxLen - 1)}…`;
}

/** Admin display only; derived from marketing copy until CRM exposes a status field. */
export function inferListingStatus(description: string): string {
  const d = description.slice(0, 3000).toLowerCase();
  if (/\bsold\b|under contract|reserved only|fully reserved\b/.test(d)) return "Reserved";
  if (/\bsold out\b|no longer available\b/.test(d)) return "Sold";
  if (/\bleasehold\b/.test(d) && !/\bfreehold\b/.test(d)) return "Leasehold";
  if (/\bfreehold\b/.test(d)) return "Freehold";
  if (/\bcoming soon\b|pre[-\s]?launch\b/.test(d)) return "Coming soon";
  return "Active";
}

/** E.g. "30 Years" for marketing copy; used on listing cards. */
export function inferLeaseYearsLabel(description: string): string | null {
  const d = description.slice(0, 2800);
  const leaseholdParen = d.match(/Leasehold\s*\(\s*(\d+)\s*Years?\s*\)/i);
  if (leaseholdParen) return `${leaseholdParen[1]} Years`;
  const m = d.match(/\b(\d+)\s*(?:years?|yrs?)\b(?:\s*(?:lease|remaining))?/i);
  if (m) return `${m[1]} Years`;
  const m2 = d.match(/(\d+)\s*(?:years?|yrs?)\s*leasehold/i);
  if (m2) return `${m2[1]} Years`;
  return null;
}
