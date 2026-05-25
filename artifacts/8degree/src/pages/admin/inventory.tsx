import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useListInventoryListings,
  getListInventoryListingsQueryKey,
  type PropertyInventoryListing,
} from "@workspace/api-client-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Star,
  Stamp,
  Upload,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InventoryImportPanel } from "@/components/admin/InventoryImportPanel";
import { apiUrl } from "@/lib/api-base";
import { cn } from "@/lib/utils";
import { inferListingArea, listingPriceLine } from "@/lib/portfolio-listing";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 50;

type SortKey = "posted" | "price" | null;

function listingKindLabel(row: PropertyInventoryListing): string {
  const hay = `${row.deliveryEstimate ?? ""}\n${row.description}`.slice(0, 1200).toLowerCase();
  if (/\bready\b|\bcompleted\b|\bhandover\b|\bturnkey\b/.test(hay)) return "Ready Units";
  return "Off-Plan Projects";
}

function thumbUrl(row: PropertyInventoryListing): string | null {
  const urls = row.imageUrls;
  if (Array.isArray(urls) && urls.length > 0) return urls[0] ?? null;
  return row.imageUrl;
}

function priceDisplay(row: PropertyInventoryListing): string {
  if (row.estimatePriceUsd?.trim()) return row.estimatePriceUsd.trim();
  return listingPriceLine(row.description);
}

function postedTimestamp(row: PropertyInventoryListing): number {
  const raw = row.postedAt ?? row.updatedAt ?? row.createdAt;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

function formatPosted(row: PropertyInventoryListing): string {
  const raw = row.postedAt ?? row.updatedAt ?? row.createdAt;
  if (!raw) return "-";
  try {
    return new Date(raw).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(raw);
  }
}

export default function AdminInventory() {
  const [location] = useLocation();
  const [channel, setChannel] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("posted");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const openFromDeepLink = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash !== "#import-import") return;
      setImportOpen(true);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    };
    openFromDeepLink();
    window.addEventListener("hashchange", openFromDeepLink);
    return () => window.removeEventListener("hashchange", openFromDeepLink);
  }, [location]);

  const params = {
    channel: channel !== "all" ? (channel as "silent" | "website") : undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useListInventoryListings(params);
  const [sheetRefreshing, setSheetRefreshing] = useState(false);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const patchListingMeta = useCallback(
    async (
      code: string,
      body: { featured?: boolean; visibility?: "active" | "draft"; saleStatus?: "available" | "sold" },
    ) => {
      setRowBusy((m) => ({ ...m, [code]: true }));
      try {
        const res = await fetch(apiUrl(`/api/inventory/listings/${encodeURIComponent(code)}/meta`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const raw = await res.text();
        let payload: { error?: string } = {};
        try {
          payload = raw ? (JSON.parse(raw) as { error?: string }) : {};
        } catch {
          if (raw) payload = { error: raw.slice(0, 400) };
        }
        if (!res.ok) {
          const htmlResponse = /<!DOCTYPE|<html[\s>]/i.test(raw);
          if (htmlResponse) {
            throw new Error(
              "This request did not reach the Node API (wrong host, or no /api proxy). For local preview run the API on port 8080 and use the same proxy as dev, or set VITE_API_BASE_URL to your Express origin when building.",
            );
          }
          throw new Error(
            typeof payload.error === "string" && payload.error.trim()
              ? payload.error
              : `${res.status} ${res.statusText}`,
          );
        }
        await qc.invalidateQueries({ queryKey: ["/api/inventory/listings"] });
      } catch (e) {
        toast({
          title: "Could not update listing",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
      } finally {
        setRowBusy((m) => {
          const next = { ...m };
          delete next[code];
          return next;
        });
      }
    },
    [qc, toast],
  );

  async function refreshInventorySources() {
    setSheetRefreshing(true);
    try {
      await fetch(apiUrl("/api/inventory/listings/revalidate-sheet"), { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["/api/inventory/listings"] });
    } finally {
      setSheetRefreshing(false);
    }
  }

  const listingsRaw = data?.listings;
  const listings = useMemo(() => {
    const rows = [...(listingsRaw ?? [])];
    if (!sortKey) return rows;
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sortKey === "posted") {
        return (postedTimestamp(a) - postedTimestamp(b)) * dir;
      }
      return priceDisplay(a).localeCompare(priceDisplay(b), undefined, { numeric: true }) * dir;
    });
    return rows;
  }, [listingsRaw, sortKey, sortDir]);

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  function handleChannelChange(val: string) {
    setChannel(val);
    setOffset(0);
    qc.invalidateQueries({ queryKey: getListInventoryListingsQueryKey() });
  }

  function toggleSort(next: Exclude<SortKey, null>) {
    if (sortKey !== next) {
      setSortKey(next);
      setSortDir(next === "posted" ? "desc" : "asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  const channelBadge = (ch: string) => {
    if (ch === "silent") return "bg-purple-100 text-purple-800";
    if (ch === "website") return "bg-blue-100 text-blue-800";
    return "";
  };

  function SortHeader({
    label,
    columnKey,
    align = "left",
  }: {
    label: string;
    columnKey: Exclude<SortKey, null>;
    align?: "left" | "right";
  }) {
    const active = sortKey === columnKey;
    const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th
        className={`py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground ${
          align === "right" ? "text-right" : "text-left"
        }`}
      >
        <button
          type="button"
          className={`inline-flex items-center gap-1 hover:text-foreground ${align === "right" ? "ml-auto" : ""}`}
          onClick={() => toggleSort(columnKey)}
        >
          {label}
          <Icon className="h-3.5 w-3.5 opacity-60" aria-hidden />
        </button>
      </th>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-1">Inventory</h1>
          <p className="text-muted-foreground text-sm">
            {isError ? "Could not reach API; inventory not loaded" : `${total} listings total`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            type="button"
            className="rounded-none"
            variant="outline"
            disabled={sheetRefreshing || isFetching}
            onClick={() => void refreshInventorySources()}
          >
            <RefreshCw size={16} className={`mr-2 ${sheetRefreshing || isFetching ? "animate-spin" : ""}`} />
            Refresh sources
          </Button>
          <Button type="button" className="rounded-none" variant="secondary" onClick={() => setImportOpen(true)}>
            <Upload size={16} className="mr-2" />
            Import
          </Button>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-4xl w-[min(96vw,56rem)] max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif">Import listings</DialogTitle>
            <DialogDescription>
              JSON upsert into CRM inventory. Use the sidebar Import control or this dialog any time you are on All Listings.
            </DialogDescription>
          </DialogHeader>
          <InventoryImportPanel
            onSuccess={() => {
              void qc.invalidateQueries({ queryKey: getListInventoryListingsQueryKey() });
            }}
          />
        </DialogContent>
      </Dialog>

      {isError ? (
        <div className="mb-6 rounded-none border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm">
          <p className="font-medium text-foreground mb-2">The admin page could not load listings from the API.</p>
          <p className="text-muted-foreground mb-3">
            This usually means the Express server is not running, or the browser cannot reach it. In local dev, Vite
            proxies <code className="text-xs bg-muted px-1">/api</code> to{" "}
            <code className="text-xs bg-muted px-1">http://localhost:8080</code> by default (set{" "}
            <code className="text-xs bg-muted px-1">API_URL</code> when starting Vite if the API uses another host/port).
          </p>
          <p className="text-muted-foreground text-xs mb-3 font-sans break-all">
            {error instanceof Error ? error.message : String(error)}
          </p>
          <p className="text-muted-foreground text-xs mb-4">
            Start the stack from the repo root: <code className="bg-muted px-1">pnpm dev</code> (needs{" "}
            <code className="bg-muted px-1">DATABASE_URL</code> for the API), or run only the API on port 8080, then refresh
            this page.
          </p>
          <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="flex gap-3 mb-6 flex-wrap">
        <Select value={channel} onValueChange={handleChannelChange}>
          <SelectTrigger className="w-44 rounded-none">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="silent">Silent</SelectItem>
            <SelectItem value="website">Website</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-muted animate-pulse" />
          ))}
        </div>
      ) : isError ? null : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground min-w-[220px]">
                  Info
                </th>
                <SortHeader label="Price" columnKey="price" align="right" />
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground w-24">
                  Featured
                </th>
                <SortHeader label="Posted" columnKey="posted" />
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground w-36">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground w-[200px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                const busy = Boolean(rowBusy[listing.code]);
                const featured = listing.featured ?? false;
                const visibility = listing.visibility ?? "active";
                const saleStatus = listing.saleStatus ?? "available";
                const isDraft = visibility === "draft";
                const isSold = saleStatus === "sold";
                const t = thumbUrl(listing);
                const city = inferListingArea(listing.title, listing.description);
                const kind = listingKindLabel(listing);

                return (
                  <tr key={listing.id} className="border-b border-border/50 hover:bg-muted/20 align-top">
                    <td className="py-3 px-4">
                      <div className="flex gap-3">
                        <div className="shrink-0 w-16 h-16 bg-muted border border-border overflow-hidden">
                          {t ? (
                            <a href={t} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                              <img
                                src={t}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                              />
                            </a>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground px-1 text-center">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-xs text-muted-foreground">
                            <span className="text-muted-foreground/80">City:</span>{" "}
                            <span className="text-foreground font-medium">{city}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="text-muted-foreground/80">Status:</span>{" "}
                            <span className="text-foreground">{kind}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="text-muted-foreground/80">Listing ID:</span>{" "}
                            <span className="font-sans text-foreground">{listing.code}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-2 pt-0.5">{listing.title}</div>
                          <div className="pt-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${channelBadge(listing.channel ?? "")}`}>
                              {listing.channel ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">{priceDisplay(listing)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{featured ? "Yes" : "No"}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs leading-relaxed">
                      <div>{formatPosted(listing)}</div>
                      <div className="text-muted-foreground/80 mt-0.5">by 8degree</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full shrink-0 ${isDraft ? "bg-zinc-400" : "bg-emerald-500"}`}
                          aria-hidden
                        />
                        <span className="text-foreground">{isDraft ? "Draft" : "Active"}</span>
                      </div>
                      {isSold ? (
                        <div className="mt-1.5 flex items-center gap-2 text-destructive">
                          <span className="inline-block h-2 w-2 rounded-full bg-destructive shrink-0" aria-hidden />
                          <span>Sold</span>
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        {!isDraft ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none shrink-0"
                              disabled={busy}
                              title={featured ? "Remove from featured" : "Feature on website"}
                              onClick={() => void patchListingMeta(listing.code, { featured: !featured })}
                            >
                              <Star className={`h-4 w-4 ${featured ? "fill-amber-500 text-amber-600" : ""}`} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none shrink-0"
                              disabled={busy}
                              title="Save as draft (hide from public site)"
                              onClick={() => void patchListingMeta(listing.code, { visibility: "draft" })}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            {listing.listingUrl ? (
                              <a
                                href={listing.listingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open listing URL"
                                className={cn(
                                  buttonVariants({ variant: "ghost", size: "icon" }),
                                  "h-8 w-8 rounded-none shrink-0",
                                )}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : null}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none shrink-0"
                              disabled={busy || isSold}
                              title="Mark as sold"
                              onClick={() => void patchListingMeta(listing.code, { saleStatus: "sold" })}
                            >
                              <Stamp className="h-4 w-4" />
                            </Button>
                            {isSold ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none shrink-0"
                                disabled={busy}
                                title="Mark available again"
                                onClick={() => void patchListingMeta(listing.code, { saleStatus: "available" })}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none shrink-0"
                              disabled={busy}
                              title="Copy listing code"
                              onClick={() => void navigator.clipboard.writeText(listing.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none shrink-0"
                              disabled={busy}
                              title="Publish (show on public site)"
                              onClick={() => void patchListingMeta(listing.code, { visibility: "active" })}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none shrink-0"
                              disabled={busy}
                              title="Copy listing code"
                              onClick={() => void navigator.clipboard.writeText(listing.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {listings.length === 0 && (
            <div className="text-center py-12 px-4 text-muted-foreground text-sm space-y-2">
              <p>No inventory listings in this response.</p>
              <p className="text-xs max-w-lg mx-auto">
                If you expect Google Sheet rows: ensure the API is running with{" "}
                <code className="bg-muted px-1">PROPERTY_INVENTORY_SOURCE</code> unset or set to{" "}
                <code className="bg-muted px-1">sheet</code> (not <code className="bg-muted px-1">database</code>), the
                sheet is shared as <strong>Viewer</strong> for anyone with the link, then click{" "}
                <strong>Refresh sources</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
