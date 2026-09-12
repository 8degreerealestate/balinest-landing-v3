import { useQuery } from "@tanstack/react-query";
import type { PropertyInventoryListing } from "@workspace/api-client-react";
import { apiUrl } from "@/lib/api-base";

export type ListingPhotosResponse = {
  imageUrl: string | null;
  imageUrls: string[];
};

export async function fetchListingPhotos(code: string): Promise<ListingPhotosResponse> {
  const res = await fetch(apiUrl(`/api/inventory/listings/${encodeURIComponent(code)}/photos`));
  if (!res.ok) {
    throw new Error(`Listing photos fetch failed (${res.status})`);
  }
  return res.json() as Promise<ListingPhotosResponse>;
}

export async function fetchFeaturedInventoryListings(
  limit = 6,
): Promise<PropertyInventoryListing[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(apiUrl(`/api/inventory/listings/featured?${params}`));
  if (!res.ok) {
    throw new Error(`Featured listings fetch failed (${res.status})`);
  }
  const body = (await res.json()) as { listings?: PropertyInventoryListing[] };
  return body.listings ?? [];
}

export function useListingPhotos(code: string | undefined, enabled = false) {
  return useQuery({
    queryKey: ["/api/inventory/listings", code, "photos"],
    queryFn: () => fetchListingPhotos(code!),
    enabled: Boolean(code) && enabled,
    staleTime: 24 * 60 * 60_000,
    retry: 1,
  });
}

export function useFeaturedInventoryListings(limit = 6, enabled = true) {
  return useQuery({
    queryKey: ["/api/inventory/listings/featured", limit],
    queryFn: () => fetchFeaturedInventoryListings(limit),
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
