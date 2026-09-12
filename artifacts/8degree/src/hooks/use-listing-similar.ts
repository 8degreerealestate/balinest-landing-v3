import { useQuery } from "@tanstack/react-query";
import { fetchListingSimilar } from "@/lib/listing-similar";

export function useListingSimilar(code: string | undefined, enabled = true, limit = 3) {
  return useQuery({
    queryKey: ["/api/inventory/listings", code, "similar", limit],
    queryFn: () => fetchListingSimilar(code!, limit),
    enabled: Boolean(code) && enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
