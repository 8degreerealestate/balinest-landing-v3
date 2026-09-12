import { apiUrl } from "@/lib/api-base";

export type NearbyCategory = "shopping" | "cafes" | "landmarks";

export type NearbyPlace = {
  name: string;
  distance: number;
};

export type ListingNearbyResponse = Record<NearbyCategory, NearbyPlace[]> & {
  center: { lat: number; lng: number; source: "sheet" | "area" | "default" };
};

export async function fetchListingNearby(code: string): Promise<ListingNearbyResponse> {
  const res = await fetch(apiUrl(`/api/inventory/listings/${encodeURIComponent(code)}/nearby`));
  if (!res.ok) {
    throw new Error(`Nearby fetch failed (${res.status})`);
  }
  return res.json() as Promise<ListingNearbyResponse>;
}
