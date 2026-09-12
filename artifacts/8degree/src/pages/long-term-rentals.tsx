import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListInventoryListings } from "@workspace/api-client-react";
import { borrowInventoryImages } from "@/lib/portfolio-listing";
import {
  inventoryListingMatchesSearch,
  searchFiltersAreActive,
  type PropertySearchFilterState,
} from "@/lib/property-search-filters";
import { filtersFromSearchPayload } from "@/lib/property-search-url";
import { Seo } from "@/components/site/Seo";
import {
  PropertySearchPanel,
  type PropertySearchApplyPayload,
  type PropertySearchLabels,
} from "@/components/site/PropertySearchPanel";
import { HOME_COPY } from "@/lib/i18n/home-copy";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { BALI_PROPERTIES_PAGE_SURFACE } from "@/lib/home-section-surfaces";
import { cn } from "@/lib/utils";
import {
  FeaturedListingCard,
  HIGHLIGHTED_CARD_BRAND,
  inventoryRowToFeaturedModel,
  type FeaturedCardModel,
} from "@/components/site/highlighted-listing-card";

const PATH = "/long-term-rentals";

const RENTAL_SEARCH_HEADLINE: Record<SiteLanguage, string> = {
  en: "Find Your Long-Term Rental in Bali",
  id: "Temukan Sewa Jangka Panjang Anda di Bali",
  fr: "Trouvez votre location longue durée à Bali",
  zh: "在巴厘岛找到您的长期租赁",
  tr: "Bali'de uzun dönem kiralamanızı bulun",
};

const RENTAL_PRICE_RANGE_YEAR: Record<SiteLanguage, string> = {
  en: "Price range / year",
  id: "Rentang harga / tahun",
  fr: "Fourchette de prix / an",
  zh: "价格区间 / 年",
  tr: "Fiyat aralığı / yıl",
};

/** Annual rent search upper bound (USD) for the long-term rentals hero panel. */
const RENTAL_SEARCH_PRICE_MAX_USD = 150_000;

const EMPTY_LIST: [] = [];
const LISTINGS_PAGE_SIZE = 9;

/** Heuristic removed — rentals page uses sheet `Channel` = rentals only. */
export default function LongTermRentalsPage() {
  const language = useSiteLanguage();
  const t = useMemo(() => {
    const map: Record<SiteLanguage, Record<string, string>> = {
      en: {
        kicker: "Rentals",
        title: "Long Term Rentals",
        heroSub:
          "Explore villa and home rentals for extended stays in Bali—relocation, remote work, or seasonal living. Refine your search below to browse options.",
        portfolioBrowseTitle: "Rental list",
        portfolioBrowseSubtitle:
          "Results follow your search and filters above. Use page numbers when there are more than nine matches.",
        rentalEmptyHint:
          "Set Channel to rentals (or rental list) in your property sheet for rows that should appear here — not website (property listings).",
      },
      id: {
        kicker: "Sewa",
        title: "Sewa Jangka Panjang",
        heroSub:
          "Jelajahi sewa vila dan rumah untuk tinggal lebih lama di Bali—relokasi, kerja jarak jauh, atau hidup musiman. Sesuaikan pencarian di bawah.",
        portfolioBrowseTitle: "Daftar sewa",
        portfolioBrowseSubtitle:
          "Hasil mengikuti pencarian dan filter di atas. Gunakan nomor halaman jika lebih dari sembilan hasil.",
        rentalEmptyHint:
          "Atur Channel ke rentals di sheet untuk baris yang tampil di sini — bukan website (listing properti).",
      },
      fr: {
        kicker: "Locations",
        title: "Locations longue duree",
        heroSub:
          "Villas et maisons pour sejours prolonges a Bali—relocation, teletravail ou residence saisonniere. Affinez la recherche ci-dessous.",
        portfolioBrowseTitle: "Liste location",
        portfolioBrowseSubtitle:
          "Les resultats suivent votre recherche et vos filtres. Pagination au-dela de neuf biens.",
        rentalEmptyHint:
          "Definissez Channel = rentals dans la feuille pour les annonces affichees ici — pas website (vente).",
      },
      zh: {
        kicker: "租赁",
        title: "长期租赁",
        heroSub:
          "探索巴厘岛别墅与住宅的长期租赁方案——移居、远程办公或季节性居住。在下方完善搜索条件。",
        portfolioBrowseTitle: "租赁列表",
        portfolioBrowseSubtitle: "结果随上方搜索与筛选更新；超过九条请用页码翻页。",
        rentalEmptyHint: "表格中 Channel 设为 rentals 的条目会显示在此页，而非 website（在售房源）。",
      },
      tr: {
        kicker: "Kiralik",
        title: "Uzun Donem Kiralik",
        heroSub:
          "Bali de villa ve ev kiralari—relokasyon, uzaktan calisma veya mevsimsel yasam. Asagidan aramanizi daraltin.",
        portfolioBrowseTitle: "Kiralik listesi",
        portfolioBrowseSubtitle:
          "Sonuclar ustteki arama ve filtrelere gore guncellenir. Dokuzdan fazla icin sayfa numaralari.",
        rentalEmptyHint:
          "Bu sayfada gosterilecek satirlar icin sheet Channel = rentals olmali — website (satilik) degil.",
      },
    };
    return map[language];
  }, [language]);

  const seoDescription = useMemo(() => {
    const map: Record<SiteLanguage, string> = {
      en: "Explore villa and home rentals for extended stays—ideal for relocation, remote work, or seasonal living in Bali.",
      id: "Jelajahi sewa vila dan rumah untuk tinggal lebih lama—cocok untuk relokasi, kerja jarak jauh, atau hidup musiman di Bali.",
      fr: "Villas et maisons pour sejours prolonges—relocation, teletravail ou residence saisonniere a Bali.",
      zh: "探索别墅与住宅的长期租赁——适合移居巴厘岛、远程办公或季节性居住。",
      tr: "Uzun sureli konaklama icin villa ve ev kiralari—relokasyon, uzaktan calisma veya mevsimsel yasam.",
    };
    return map[language];
  }, [language]);

  const [filters, setFilters] = useState<PropertySearchFilterState>({
    area: "all",
    propertyType: "all",
    bedrooms: "all",
    listingQuery: "",
    ownership: "all",
    devStatus: "all",
    priceMinUsd: null,
    priceMaxUsd: null,
  });
  const [listingsPage, setListingsPage] = useState(0);

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    isError: inventoryError,
    error: inventoryErr,
  } = useListInventoryListings(
    { channel: "rentals", limit: 500, offset: 0 },
    { query: { staleTime: 5 * 60_000 } },
  );

  const listingsRaw = inventoryError ? EMPTY_LIST : (inventoryData?.listings ?? []);
  const loadErrorMessage =
    inventoryErr instanceof Error ? inventoryErr.message : "Could not load rental listings";

  const { portfolioFeaturedModels } = useMemo(() => {
    const listingsPublic = listingsRaw.filter((row) => {
      const vis = row.visibility ?? "active";
      const sale = row.saleStatus ?? "available";
      return vis !== "draft" && sale !== "sold";
    });

    const listingsBaseFiltered = listingsPublic.filter((row) => inventoryListingMatchesSearch(row, filters));

    const sorted = [...listingsBaseFiltered].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

    const models = sorted.map((row, idx) =>
      inventoryRowToFeaturedModel(borrowInventoryImages(row, listingsPublic), idx),
    );
    return { portfolioFeaturedModels: models };
  }, [listingsRaw, filters]);

  const listingsTotalPages = Math.max(1, Math.ceil(portfolioFeaturedModels.length / LISTINGS_PAGE_SIZE));
  const listingsPageSafe = Math.min(listingsPage, listingsTotalPages - 1);
  const listingsPageModels = portfolioFeaturedModels.slice(
    listingsPageSafe * LISTINGS_PAGE_SIZE,
    listingsPageSafe * LISTINGS_PAGE_SIZE + LISTINGS_PAGE_SIZE,
  );

  useEffect(() => {
    setListingsPage(0);
  }, [filters]);

  useEffect(() => {
    setListingsPage((p) => Math.min(p, listingsTotalPages - 1));
  }, [listingsTotalPages]);

  const searchLabels = useMemo((): PropertySearchLabels => {
    const h = HOME_COPY[language];
    return {
      searchHeadline: RENTAL_SEARCH_HEADLINE[language],
      propertyType: h.propertyType,
      area: h.area,
      bedrooms: h.bedrooms,
      ownership: h.ownership,
      priceRange: RENTAL_PRICE_RANGE_YEAR[language],
      devStatus: h.devStatus,
      propertyCode: h.propertyCode,
      search: h.search,
    };
  }, [language]);

  function handleSearchApply(payload: PropertySearchApplyPayload) {
    setFilters(filtersFromSearchPayload(payload));
    requestAnimationFrame(() =>
      document.getElementById("rental-results")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BALI_PROPERTIES_PAGE_SURFACE }}>
      <Seo
        title={`${t.title} · 8 Degree`}
        description={truncateForMeta(seoDescription)}
        path={PATH}
      />
      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 overflow-hidden min-h-[min(100dvh,960px)]">
          <div className="absolute inset-0 z-10 bg-black/40" aria-hidden />
          <img
            src="/site-media/long-term-rentals-hero.png"
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
            {t.kicker}
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
          <PropertySearchPanel
            layout="embeddedInHero"
            fieldSet="rentalsMinimal"
            priceRangeMax={RENTAL_SEARCH_PRICE_MAX_USD}
            labels={searchLabels}
            onApply={handleSearchApply}
          />
        </div>
      </section>

      <div id="rental-results" className="container mx-auto max-w-6xl px-6 py-16">
        {inventoryError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-6 py-8 text-center">
            <p className="mb-2 font-medium text-foreground">Could not reach the API</p>
            <p className="mb-3 text-sm text-muted-foreground">{loadErrorMessage}</p>
            <p className="mx-auto max-w-lg text-xs text-muted-foreground">
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

              {inventoryLoading ? (
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
                <RentalsEmptyState
                  hasFilters={searchFiltersAreActive(filters)}
                  websiteInventoryCount={inventoryError ? 0 : (inventoryData?.listings?.length ?? 0)}
                  inventoryUnavailable={inventoryError}
                  emptyHint={t.rentalEmptyHint}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                    {listingsPageModels.map((model, i) => (
                      <div key={model.id} data-testid={`card-listing-${model.code}`}>
                        <FeaturedListingCard model={model} idx={i} />
                      </div>
                    ))}
                  </div>

                  {listingsTotalPages > 1 ? (
                    <nav
                      className="mt-10 flex flex-wrap items-center justify-center gap-2 md:mt-12"
                      aria-label="Rental listing pages"
                    >
                      {Array.from({ length: listingsTotalPages }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setListingsPage(i)}
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

function RentalsEmptyState({
  hasFilters,
  websiteInventoryCount,
  inventoryUnavailable,
  emptyHint,
}: {
  hasFilters: boolean;
  websiteInventoryCount: number;
  inventoryUnavailable: boolean;
  emptyHint: string;
}) {
  const language = useSiteLanguage();
  const emptyCopy: Record<SiteLanguage, { title: string; sub: string }> = {
    en: { title: "No rentals match your filters", sub: "Try clearing filters or search, or contact us for options." },
    id: { title: "Tidak ada sewa sesuai filter", sub: "Coba hapus filter atau hubungi kami." },
    fr: { title: "Aucune location pour ces filtres", sub: "Reinitialisez les filtres ou contactez-nous." },
    zh: { title: "没有符合筛选的租赁", sub: "请尝试清除筛选或联系我们。" },
    tr: { title: "Filtrelere uygun kiralik yok", sub: "Filtreleri temizleyin veya iletisime gecin." },
  };

  if (hasFilters) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <p className="mb-2 font-serif text-2xl font-bold tracking-[0.04em] text-primary">{emptyCopy[language].title}</p>
        <p className="text-sm font-light">{emptyCopy[language].sub}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-16 text-center text-muted-foreground">
      <p className="font-serif text-2xl text-primary">No rental listings to show yet</p>
      <p className="text-sm">
        {inventoryUnavailable
          ? "Inventory could not be loaded."
          : `Rows with Channel = rentals in the sheet: ${websiteInventoryCount}.`}
      </p>
      <p className="text-sm font-light leading-relaxed">{emptyHint}</p>
      <p className="text-sm font-light leading-relaxed">
        Property listings for sale use <code className="text-[11px] bg-muted px-1 py-0.5 text-foreground">website</code>{" "}
        and appear on{" "}
        <Link href="/projects" className="text-primary underline-offset-4 hover:underline">
          Bali properties
        </Link>
        .
      </p>
      <p className="text-xs text-muted-foreground">
        <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
          Contact us
        </Link>{" "}
        for long-term rental requests.
      </p>
    </div>
  );
}
