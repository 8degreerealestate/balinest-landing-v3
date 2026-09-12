import { useQuery } from "@tanstack/react-query";
import { fetchListingNearby } from "@/lib/listing-nearby";

export function useListingNearby(code: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["/api/inventory/listings", code, "nearby"],
    queryFn: () => fetchListingNearby(code!),
    enabled: Boolean(code) && enabled,
    staleTime: 24 * 60 * 60_000,
    retry: 1,
  });
}
