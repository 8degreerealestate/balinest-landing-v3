import { useCallback, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { PropertyInventoryListing } from "@workspace/api-client-react";
import {
  HOME_FEATURED_LISTINGS_MODE,
  HOME_FEATURED_LISTINGS_TEMPLATE,
  type HomeFeaturedListingTemplate,
} from "@/data/home-featured-listings-template";
import { HOME_LISTINGS_BAND } from "@/lib/home-section-surfaces";
import { borrowInventoryImages } from "@/lib/portfolio-listing";
import { useFeaturedInventoryListings } from "@/hooks/use-listing-photos";
import { parseUsdNumber } from "@/lib/site-currency";
import {
  FeaturedListingCard,
  inventoryRowToFeaturedModel,
  type FeaturedCardModel,
} from "@/components/site/highlighted-listing-card";

const DEFAULT_GRID_SLOTS = 6;

const sectionSurface = {
  overlapHero: "-mt-4 pt-3 pb-14 md:-mt-6 md:pt-4 md:pb-20 lg:pt-5",
  /** After a full-bleed hero (e.g. projects page): no negative overlap. */
  standalone: "pt-10 pb-14 md:pt-12 md:pb-20",
} as const;

export type FeaturedInventoryStripProps = {
  title: string;
  subtitle: string;
  viewAllLabel: string;
  /** Defaults to `/projects`. Use `#anchor` for in-page jumps on the projects page. */
  viewAllHref?: string;
  /** `overlapHero` tucks under the homepage hero; `standalone` is for the Bali properties page. */
  sectionVariant?: keyof typeof sectionSurface;
  /** When true, the section title and subtitle are not rendered (e.g. projects page). Homepage omits this. */
  hideHeading?: boolean;
  /** Max cards to show (homepage uses default 6; projects strip uses 9 for a 3×3 grid). */
  maxCards?: number;
  /** Section background (homepage default: listings band). */
  sectionBackgroundColor?: string;
};

function templateToCard(t: HomeFeaturedListingTemplate): FeaturedCardModel {
  return {
    id: t.id,
    href: t.href,
    code: t.code,
    title: t.title,
    imageUrl: t.imageUrl,
    imageAlt: t.title,
    area: t.location,
    priceUsd: parseUsdNumber(t.priceDisplay),
    priceDisplay: t.priceDisplay,
    ownership: t.ownership,
    bedrooms: t.bedrooms,
    buildingSqm: t.buildingSqm?.trim() ? t.buildingSqm : null,
    landSqm: t.landSqm?.trim() ? t.landSqm : null,
    leaseYears: t.leaseYears?.trim() ? t.leaseYears : null,
    featured: Boolean(t.featured),
    showExclusive: Boolean(t.showExclusive),
    badgeTopLeft: null,
    categoryLabel: t.category ?? "Residential",
    statusBadge: t.statusBadge?.trim() || null,
    externalListingUrl: null,
  };
}

const viewAllCtaClassName =
  "group inline-flex items-center gap-2 rounded-full border border-[#1c1917]/25 bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.28em] text-primary shadow-sm backdrop-blur-sm transition-colors hover:border-[#01514E] hover:bg-white";

export function FeaturedInventoryStrip({
  title,
  subtitle,
  viewAllLabel,
  viewAllHref = "/projects",
  sectionVariant = "overlapHero",
  hideHeading = false,
  maxCards = DEFAULT_GRID_SLOTS,
  sectionBackgroundColor = HOME_LISTINGS_BAND,
}: FeaturedInventoryStripProps) {
  const slots = Math.max(1, Math.min(maxCards, 24));
  const useApi = HOME_FEATURED_LISTINGS_MODE === "api";

  const [dismissedCodes, setDismissedCodes] = useState(() => new Set<string>());
  const dismissListingPhoto = useCallback((code: string) => {
    setDismissedCodes((prev) => {
      if (prev.has(code)) return prev;
      const next = new Set(prev);
      next.add(code);
      return next;
    });
  }, []);

  const { data, isError, isPending, isFetching } = useFeaturedInventoryListings(
    slots + dismissedCodes.size,
    useApi,
  );

  const cards = useMemo((): FeaturedCardModel[] => {
    if (!useApi) {
      return HOME_FEATURED_LISTINGS_TEMPLATE.slice(0, slots).map(templateToCard);
    }

    if (isPending || isFetching) {
      return [];
    }

    if (isError || !data?.length) {
      return [];
    }

    const eligible = data.filter((row) => !dismissedCodes.has(row.code));

    if (eligible.length === 0) {
      return [];
    }

    const pool = eligible.map((row) => borrowInventoryImages(row, eligible));

    return pool
      .slice(0, slots)
      .map((row: PropertyInventoryListing, idx: number) => inventoryRowToFeaturedModel(row, idx));
  }, [useApi, data, isError, isPending, isFetching, slots, dismissedCodes]);

  const showLoading = useApi && (isPending || isFetching) && cards.length === 0;

  if (!showLoading && cards.length === 0) return null;

  return (
    <section
      className={`${sectionSurface[sectionVariant]} overflow-x-clip`}
      style={{ backgroundColor: sectionBackgroundColor }}
    >
      <div className="mx-auto w-full min-w-0 max-w-[1400px] px-4 sm:px-6 md:px-10">
        {hideHeading ? null : (
          <div className="mb-10 mx-auto max-w-2xl text-center md:mb-14">
            <h2 className="font-serif text-3xl font-bold uppercase tracking-[0.06em] text-primary md:text-4xl lg:text-[2.35rem]">
              {title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#1c1917]/70 md:text-base">
              {subtitle}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {showLoading
            ? Array.from({ length: slots }, (_, i) => (
                <div
                  key={`featured-skeleton-${i}`}
                  className="aspect-[16/10] animate-pulse rounded-2xl bg-[#d8d4ce]/80 ring-1 ring-[#1c1917]/[0.06]"
                  aria-hidden
                />
              ))
            : cards.map((row, idx) => (
                <FeaturedListingCard
                  key={`${row.id}-${idx}`}
                  model={row}
                  idx={idx}
                  onImageUnavailable={dismissListingPhoto}
                />
              ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          {viewAllHref.startsWith("#") ? (
            <a href={viewAllHref} className={viewAllCtaClassName}>
              {viewAllLabel}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          ) : (
            <Link href={viewAllHref} className={viewAllCtaClassName}>
              {viewAllLabel}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
