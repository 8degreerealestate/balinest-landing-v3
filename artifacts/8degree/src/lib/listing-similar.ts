import type { PropertyInventoryListing } from "@workspace/api-client-react";
import { apiUrl } from "@/lib/api-base";

export async function fetchListingSimilar(
  code: string,
  limit = 3,
): Promise<PropertyInventoryListing[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(
    apiUrl(`/api/inventory/listings/${encodeURIComponent(code)}/similar?${params}`),
  );
  if (!res.ok) {
    throw new Error(`Similar listings fetch failed (${res.status})`);
  }
  const body = (await res.json()) as { listings?: PropertyInventoryListing[] };
  return body.listings ?? [];
}
