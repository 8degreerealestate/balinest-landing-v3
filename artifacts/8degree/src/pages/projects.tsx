import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useListInventoryListings, useListProjects } from "@workspace/api-client-react";
import { borrowInventoryImages, inferListingArea } from "@/lib/portfolio-listing";
import {
  inventoryListingMatchesSearch,
  projectMatchesBedroomsFilter,
  searchFiltersAreActive,
  type PropertySearchFilterState,
} from "@/lib/property-search-filters";
import {
  filtersFromSearchPayload,
  filtersToSearchPayload,
  pageIndexFromLocationSearch,
  rememberProjectsUrl,
  replaceProjectsSearchUrl,
  searchPayloadFromLocationSearch,
} from "@/lib/property-search-url";
import { Seo } from "@/components/site/Seo";
import { PropertySearchPanel, type PropertySearchApplyPayload } from "@/components/site/PropertySearchPanel";
import { HOME_COPY } from "@/lib/i18n/home-copy";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { BALI_PROPERTIES_PAGE_SURFACE } from "@/lib/home-section-surfaces";
import { cn } from "@/lib/utils";
import {
  FeaturedListingCard,
  HIGHLIGHTED_CARD_BRAND,
  developmentProjectToFeaturedModel,
  inventoryRowToFeaturedModel,
  type FeaturedCardModel,
} from "@/components/site/highlighted-listing-card";

/** Stable empty list so `useMemo` deps do not churn when a request fails. */
const EMPTY_LIST: [] = [];

const LISTINGS_PAGE_SIZE = 9;

export default function Projects() {
  const language = useSiteLanguage();
  const t = useMemo(() => {
    const map: Record<SiteLanguage, Record<string, string>> = {
      en: {
        portfolio: "Portfolio",
        title: "Bali Properties for Sale",
        heroSub:
          "Explore a curated selection of villas, developments, and land across Bali's most sought-after locations. Refine your search below to view available listings.",
        search: "Search by name, code, or area...",
        clear: "Clear",
        portfolioBrowseTitle: "All listings & developments",
        portfolioBrowseSubtitle:
          "Results update when you search or change filters in the panel above. Use page numbers when there are more than nine matches.",
      },
      id: {
        portfolio: "Portofolio",
        title: "Properti Bali Dijual",
        heroSub:
          "Jelajahi pilihan terkurasi vila, pengembangan, dan tanah di lokasi-lokasi paling diminati di Bali. Sesuaikan pencarian Anda di bawah untuk melihat listing yang tersedia.",
        search: "Cari berdasarkan nama, kode, atau area...",
        clear: "Reset",
        portfolioBrowseTitle: "Semua listing & pengembangan",
        portfolioBrowseSubtitle:
          "Hasil berubah saat Anda mencari atau mengubah filter di panel di atas. Gunakan nomor halaman jika lebih dari sembilan hasil.",
      },
      fr: {
        portfolio: "Portefeuille",
        title: "Biens a vendre a Bali",
        heroSub:
          "Decouvrez une selection soignee de villas, programmes immobiliers et terrains dans les zones les plus recherche de Bali. Affinez votre recherche ci-dessous pour voir les annonces disponibles.",
        search: "Rechercher par nom, code ou zone...",
        clear: "Effacer",
        portfolioBrowseTitle: "Toutes les annonces et programmes",
        portfolioBrowseSubtitle:
          "Les resultats se mettent a jour selon votre recherche et vos filtres. Utilisez la pagination au-dela de neuf biens.",
      },
      zh: {
        portfolio: "项目组合",
        title: "巴厘岛在售房源",
        heroSub:
          "探索精选别墅、开发项目及土地，覆盖巴厘岛最受欢迎的区域。在下方完善搜索条件以查看在售房源。",
        search: "按名称、编号或区域搜索...",
        clear: "清除",
        portfolioBrowseTitle: "全部房源与项目",
        portfolioBrowseSubtitle: "在上方调整搜索或筛选后结果会更新；超过九条时请用页码翻页。",
      },
      tr: {
        portfolio: "Portfoy",
        title: "Bali Satilik Gayrimenkul",
        heroSub:
          "Bali'nin en cok talep goren bolgelerinde villalar, projeler ve arsa icin secilmis bir portfoyu kesfedin. Mevcut ilanlari gormek icin asagidan aramanizi daraltin.",
        search: "Isim, kod veya bolgeye gore ara...",
        clear: "Temizle",
        portfolioBrowseTitle: "Tum ilanlar ve projeler",
        portfolioBrowseSubtitle:
          "Ustteki arama ve filtreler degistiginde sonuclar guncellenir. Dokuzdan fazla eslesme icin sayfa numaralarini kullanin.",
      },
    };
    return map[language];
  }, [language]);
  const [filters, setFilters] = useState<PropertySearchFilterState>(() => {
    const fromUrl =
      typeof window !== "undefined"
        ? searchPayloadFromLocationSearch(window.location.search)
        : null;
    return fromUrl
      ? filtersFromSearchPayload(fromUrl)
      : {
          area: "all",
          propertyType: "all",
          bedrooms: "all",
          listingQuery: "",
          ownership: "all",
          devStatus: "all",
          priceMinUsd: null,
          priceMaxUsd: null,
        };
  });
  const [listingsPage, setListingsPage] = useState(() =>
    typeof window !== "undefined" ? pageIndexFromLocationSearch(window.location.search) : 0,
  );
  const skipFilterPageReset = useRef(true);

  const {
    data: projectData,
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErr,
  } = useListProjects({
    area: filters.area !== "all" ? filters.area : undefined,
    property_type: filters.propertyType !== "all" ? filters.propertyType : undefined,
    limit: 200,
  });

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    isError: inventoryError,
    error: inventoryErr,
  } = useListInventoryListings(
    { channel: "website", limit: 500, offset: 0 },
    { query: { staleTime: 5 * 60_000 } },
  );

  const projects = useMemo(() => {
    const raw = projectsError ? EMPTY_LIST : (projectData?.projects ?? []);
    return raw.filter((p) =>
      projectMatchesBedroomsFilter(filters.bedrooms, p.bedroomsMin, p.bedroomsMax),
    );
  }, [projectsError, projectData?.projects, filters.bedrooms]);
  const listingsRaw = inventoryError ? EMPTY_LIST : (inventoryData?.listings ?? []);

  const isLoading = projectsLoading || inventoryLoading;
  const loadError = projectsError && inventoryError;
  const loadErrorMessage =
    (projectsErr instanceof Error ? projectsErr.message : null) ??
    (inventoryErr instanceof Error ? inventoryErr.message : null) ??
    "Could not load portfolio data";
  const projectsFetchFailed = projectsError && !inventoryError;
  const inventoryFetchFailed = inventoryError && !projectsError;

  const portfolioFeaturedModels = useMemo((): FeaturedCardModel[] => {
    const listingsPublic = listingsRaw.filter((row) => {
      const vis = row.visibility ?? "active";
      const sale = row.saleStatus ?? "available";
      return vis !== "draft" && sale !== "sold";
    });

    const listingsFiltered = listingsPublic.filter((row) => inventoryListingMatchesSearch(row, filters));

    const listingsForCards = [...listingsFiltered].sort(
      (a, b) => Number(!!b.featured) - Number(!!a.featured),
    );

    type MergedItem =
      | { kind: "project"; p: (typeof projects)[number] }
      | { kind: "listing"; row: (typeof listingsForCards)[number] };

    let mergedItems: MergedItem[] = [
      ...projects.map((p) => ({ kind: "project" as const, p })),
      ...listingsForCards.map((row) => ({ kind: "listing" as const, row })),
    ];

    if (filters.listingQuery.trim()) {
      const q = filters.listingQuery.toLowerCase();
      mergedItems = mergedItems.filter((item) => {
        if (item.kind === "project") {
          const c = item.p;
          return `${c.title} ${c.area} ${c.shortDescription}`.toLowerCase().includes(q);
        }
        const row = item.row;
        const ar = inferListingArea(row.title, row.description);
        return `${row.code} ${row.title} ${ar} ${row.location ?? ""}`.toLowerCase().includes(q);
      });
    }

    return mergedItems.map((item, idx) =>
      item.kind === "project"
        ? developmentProjectToFeaturedModel(
            {
              id: item.p.id,
              slug: item.p.slug,
              title: item.p.title,
              area: item.p.area,
              shortDescription: item.p.shortDescription,
              heroImageUrl: item.p.heroImageUrl,
              featured: item.p.featured,
              priceFrom: item.p.priceFrom,
              currency: item.p.currency,
              propertyType: item.p.propertyType,
              bedroomsMin: item.p.bedroomsMin,
              bedroomsMax: item.p.bedroomsMax,
            },
            idx,
          )
        : inventoryRowToFeaturedModel(borrowInventoryImages(item.row, listingsPublic), idx),
    );
  }, [projects, listingsRaw, filters]);

  const listingsTotalPages = Math.max(1, Math.ceil(portfolioFeaturedModels.length / LISTINGS_PAGE_SIZE));
  const listingsPageSafe = Math.min(listingsPage, listingsTotalPages - 1);
  const listingsPageModels = portfolioFeaturedModels.slice(
    listingsPageSafe * LISTINGS_PAGE_SIZE,
    listingsPageSafe * LISTINGS_PAGE_SIZE + LISTINGS_PAGE_SIZE,
  );

  useEffect(() => {
    // Keep URL page on first mount; only reset when the user changes filters later.
    if (skipFilterPageReset.current) {
      skipFilterPageReset.current = false;
      return;
    }
    setListingsPage(0);
  }, [filters]);

  useEffect(() => {
    // Avoid clamping to page 0 while the grid is still empty/loading.
    if (isLoading) return;
    setListingsPage((p) => Math.min(p, listingsTotalPages - 1));
  }, [listingsTotalPages, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    replaceProjectsSearchUrl(filtersToSearchPayload(filters), { pageIndex: listingsPageSafe });
  }, [filters, listingsPageSafe, isLoading]);

  useEffect(() => {
    rememberProjectsUrl();
  }, []);

  useEffect(() => {
    const search = window.location.search;
    if (!searchPayloadFromLocationSearch(search) && pageIndexFromLocationSearch(search) === 0) return;
    requestAnimationFrame(() =>
      document.getElementById("portfolio-results")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, []);

  const homeCopy = HOME_COPY[language];
  const searchLabels = {
    searchHeadline: homeCopy.searchHeadline,
    propertyType: homeCopy.propertyType,
    area: homeCopy.area,
    bedrooms: homeCopy.bedrooms,
    ownership: homeCopy.ownership,
    priceRange: homeCopy.priceRange,
    devStatus: homeCopy.devStatus,
    propertyCode: homeCopy.propertyCode,
    search: homeCopy.search,
  };

  function handleSearchApply(payload: PropertySearchApplyPayload) {
    const next = filtersFromSearchPayload(payload);
    setFilters(next);
    replaceProjectsSearchUrl(payload, { pageIndex: 0 });
    requestAnimationFrame(() =>
      document.getElementById("portfolio-results")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BALI_PROPERTIES_PAGE_SURFACE }}>
      <Seo
        title="Bali properties for sale · 8 Degree"
        description={truncateForMeta(
          "Explore a curated selection of villas, developments, and land across Bali's most sought-after locations. Refine your search to view available listings.",
        )}
        path="/projects"
      />
      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 overflow-hidden min-h-[min(100dvh,960px)]">
          <div className="absolute inset-0 z-10 bg-black/40" aria-hidden />
          <img
            src="/site-media/real-estate-for-sale-hero.png"
            alt=""
            className="hero-image-breathe h-full min-h-[min(100dvh,960px)] w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="relative z-20 mx-auto flex min-h-[min(100dvh,960px)] w-full max-w-6xl flex-col items-center justify-center px-6 py-20 text-center text-white translate-y-[6dvh] md:translate-y-[8dvh] lg:translate-y-[9dvh] md:py-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-white/90"
          >
            {t.portfolio}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl font-serif text-4xl font-bold leading-tight tracking-[0.04em] md:text-6xl"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 max-w-2xl text-sm font-light text-white/85 md:text-base"
          >
            {t.heroSub}
          </motion.p>
        </div>
      </section>

      <PropertySearchPanel
        labels={searchLabels}
        onApply={handleSearchApply}
        initialValues={filtersToSearchPayload(filters)}
      />

      <div id="portfolio-results" className="container mx-auto max-w-6xl px-6 py-16">
        {projectsFetchFailed ? (
          <div
            className="mb-8 rounded-lg border border-amber-600/35 bg-amber-500/[0.08] px-4 py-3 text-sm text-foreground"
            role="status"
          >
            Developments could not be loaded (database may be missing the projects table). Sheet-driven listings below
            are unchanged.
          </div>
        ) : null}
        {inventoryFetchFailed ? (
          <div
            className="mb-8 rounded-lg border border-amber-600/35 bg-amber-500/[0.08] px-4 py-3 text-sm text-foreground"
            role="status"
          >
            Inventory could not be loaded. Check the sheet connection and API logs; developments above may still appear.
          </div>
        ) : null}
        {loadError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-6 py-8 text-center">
            <p className="font-medium text-foreground mb-2">Could not reach the API</p>
            <p className="text-sm text-muted-foreground mb-3">{loadErrorMessage}</p>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              Run the API locally on port 8080 (<code className="text-[11px]">pnpm dev</code> from the repo root) so{" "}
              <code className="text-[11px]">/api</code> proxies correctly from Vite.
            </p>
          </div>
        ) : (
          <section className="pb-16 pt-4 md:pb-20 md:pt-6" style={{ backgroundColor: BALI_PROPERTIES_PAGE_SURFACE }}>
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10">
              <div className="mb-10 mx-auto max-w-2xl text-center md:mb-12">
                <h2 className="font-serif text-3xl font-bold uppercase tracking-[0.06em] text-primary md:text-4xl lg:text-[2.35rem]">
                  {t.portfolioBrowseTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#1c1917]/70 md:text-base">
                  {t.portfolioBrowseSubtitle}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {Array.from({ length: LISTINGS_PAGE_SIZE }, (_, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl bg-white/60 shadow-sm">
                      <div className="aspect-[16/10] animate-pulse bg-[#d8d4ce]/80" />
                      <div className="space-y-3 px-5 py-4">
                        <div className="h-3 w-[65%] animate-pulse rounded bg-[#1c1917]/10" />
                        <div className="h-5 w-full animate-pulse rounded bg-[#1c1917]/10" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-[#1c1917]/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : portfolioFeaturedModels.length === 0 ? (
                <PortfolioEmptyState
                  hasFilters={searchFiltersAreActive(filters)}
                  projectCount={projectsError ? 0 : (projectData?.projects?.length ?? 0)}
                  websiteInventoryCount={inventoryError ? 0 : (inventoryData?.listings?.length ?? 0)}
                  projectsUnavailable={projectsError}
                  inventoryUnavailable={inventoryError}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                    {listingsPageModels.map((model, i) => {
                      const isProjectCard = model.href.startsWith("/projects/");
                      const testSlug = isProjectCard ? model.href.replace(/^\/projects\//, "") : "";
                      return (
                        <div
                          key={model.id}
                          data-testid={
                            isProjectCard ? `card-project-${testSlug}` : `card-listing-${model.code}`
                          }
                        >
                          <FeaturedListingCard model={model} idx={i} />
                        </div>
                      );
                    })}
                  </div>

                  {listingsTotalPages > 1 ? (
                    <nav
                      className="mt-10 flex flex-wrap items-center justify-center gap-2 md:mt-12"
                      aria-label="Listing pages"
                    >
                      {Array.from({ length: listingsTotalPages }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setListingsPage(i);
                            replaceProjectsSearchUrl(filtersToSearchPayload(filters), { pageIndex: i });
                          }}
                          className={cn(
                            "min-h-9 min-w-9 rounded-full border px-3 py-1.5 text-sm font-medium tabular-nums transition-colors",
                            i === listingsPageSafe
                              ? "border-transparent text-white shadow-sm"
                              : "border-[#1c1917]/20 bg-white/80 text-[#1c1917] hover:border-[#01514E]/40 hover:bg-white",
                          )}
                          style={i === listingsPageSafe ? { backgroundColor: HIGHLIGHTED_CARD_BRAND } : undefined}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  ) : null}
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PortfolioEmptyState({
  hasFilters,
  projectCount,
  websiteInventoryCount,
  projectsUnavailable,
  inventoryUnavailable,
}: {
  hasFilters: boolean;
  projectCount: number;
  websiteInventoryCount: number;
  projectsUnavailable: boolean;
  inventoryUnavailable: boolean;
}) {
  const language = useSiteLanguage();
  const emptyCopy: Record<SiteLanguage, { title: string; sub: string }> = {
    en: { title: "Nothing matches your filters", sub: "Try clearing filters or search." },
    id: { title: "Tidak ada hasil sesuai filter", sub: "Coba hapus filter atau kata kunci." },
    fr: { title: "Aucun resultat pour ces filtres", sub: "Essayez de reinitialiser les filtres." },
    zh: { title: "没有符合筛选的结果", sub: "请尝试清除筛选条件。" },
    tr: { title: "Filtrelere uygun sonuc yok", sub: "Filtreleri temizleyip tekrar deneyin." },
  };

  if (hasFilters) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p className="mb-2 font-serif text-2xl font-bold tracking-[0.04em] text-primary">{emptyCopy[language].title}</p>
        <p className="text-sm font-light">{emptyCopy[language].sub}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 text-muted-foreground max-w-2xl mx-auto space-y-4">
      <p className="font-serif text-2xl text-primary">Nothing to show on the portfolio yet</p>
      <p className="text-sm">
        Before filters: {projectsUnavailable ? "developments unavailable" : `${projectCount} development(s)`},{" "}
        {inventoryUnavailable ? "sheet inventory unavailable" : `${websiteInventoryCount} website-channel row(s) from the sheet`}.
      </p>
      <p className="text-sm font-light leading-relaxed">
        Rows with <code className="text-[11px] bg-muted px-1 py-0.5 text-foreground">channel: &quot;silent&quot;</code> stay
        in admin only. Use Admin → Inventory and upsert with{" "}
        <code className="text-[11px] bg-muted px-1 py-0.5 text-foreground">website</code> for listings that should appear
        here.
      </p>
      <p className="text-xs text-muted-foreground">
        Developments use the projects table when the database is set up. Listings come from your configured Google Sheet.
      </p>
    </div>
  );
}
