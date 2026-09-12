import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BedDouble,
  CalendarDays,
  Diamond,
  ExternalLink,
  Infinity as InfinityIcon,
  MapPin,
} from "lucide-react";
import { ListingStatIcon, type ListingStatIconName } from "@/components/site/listing-stat-icons";
import type { PropertyInventoryListing } from "@workspace/api-client-react";
import {
  resolveLeaseYearsLabel,
  resolveListingPhotoBadges,
  inferLeaseYearsLabel,
  inferListingArea,
  inferListingStatus,
  inventoryListingPriceUsd,
  listingPriceLine,
  inventoryGalleryUrls,
  listingHasDriveFolderSource,
  LISTING_IMAGE_FALLBACK,
  pickInventoryThumbnail,
  proxyInventoryImageUrl,
} from "@/lib/portfolio-listing";
import { useListingPhotos } from "@/hooks/use-listing-photos";
import { formatPriceForSiteCurrency, parseUsdNumber, useSiteCurrency } from "@/lib/site-currency";
import { COMMON_COPY } from "@/lib/i18n/common";
import { useSiteCopy } from "@/lib/site-language";
import { propertyListingPath } from "@/lib/site-paths";

export const HIGHLIGHTED_CARD_BRAND = "#01514E";
export const HIGHLIGHTED_CARD_ACCENT = "#e0fdac";

export type FeaturedCardModel = {
  id: string;
  href: string;
  code: string;
  title: string;
  imageUrl: string | null;
  /** Additional URLs to try if the primary photo fails to load. */
  imageCandidates?: string[];
  /** When true, card fetches resolved Drive photos lazily (projects grid). */
  needsPhotoResolve?: boolean;
  imageAlt: string;
  area: string;
  /** Canonical USD for navbar currency conversion; null uses `priceDisplay` fallback. */
  priceUsd: number | null;
  /** Raw marketing label when USD amount is unknown (templates, non-USD dev projects). */
  priceDisplay: string;
  ownership: string;
  bedrooms: string;
  buildingSqm: string | null;
  landSqm: string | null;
  leaseYears: string | null;
  /** Homepage highlighted strip sort priority — not the EXCLUSIVE badge. */
  featured: boolean;
  /** EXCLUSIVE badge + green card styling; only when legally accurate. */
  showExclusive: boolean;
  /** Top-left photo badge label; falls back to localized “Exclusive” when `showExclusive` and unset. */
  badgeTopLeft: string | null;
  /** Top-right photo badge (category / tag slot 2). */
  categoryLabel: string | null;
  /** Bottom-right photo badge (status / tag slot 3). */
  statusBadge: string | null;
  /** Optional third-party listing URL (opens in new tab). */
  externalListingUrl?: string | null;
};

type CalendarTenure = { kind: "lease"; label: string } | { kind: "infinity" } | { kind: "dash" };

/** Beside calendar: lease text, infinity (freehold, no term), or em dash. */
export function resolveCalendarTenure(ownership: string, leaseYears: string | null): CalendarTenure {
  const lease = leaseYears?.trim();
  if (lease) return { kind: "lease", label: lease };
  const o = ownership.toLowerCase();
  if (/\bfreehold\b/.test(o) && !/\bleasehold\b/.test(o)) return { kind: "infinity" };
  return { kind: "dash" };
}

function displayBedrooms(row: PropertyInventoryListing): string {
  if (row.br?.trim()) return row.br.trim();
  const hay = `${row.title}\n${row.description}`;
  const m = hay.match(/(\d+)\s*(?:bedroom|bedrooms|bed|BR)\b/i);
  if (m) return m[1];
  if (/bedroom\s*\(\s*s\s*\)/i.test(hay)) return "1+";
  return "—";
}

function stripEmojis(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

type CommonCardCopy = (typeof COMMON_COPY)["en"];

/** Localized label for sheet-driven status badges on listing cards. */
export function statusBadgeDisplayLabel(badge: string, common: CommonCardCopy): string {
  const lower = badge.trim().toLowerCase();
  if (lower === "ready") return common.ready;
  if (lower === "off-plan" || lower === "offplan") return common.offPlan;
  if (lower === "great deal") return common.greatDeal;
  return badge.trim();
}

function categoryBadgeDisplayLabel(label: string, common: CommonCardCopy): string {
  if (label === "Residential") return common.residential;
  if (label === "Investment") return common.investment;
  return label;
}

/** Map an inventory API row to the highlighted card model (homepage / projects). */
export function inventoryRowToFeaturedModel(row: PropertyInventoryListing, _idx: number): FeaturedCardModel {
  const gallery = inventoryGalleryUrls(row);
  const needsPhotoResolve = listingHasDriveFolderSource(row) && !pickInventoryThumbnail(row);
  const img = needsPhotoResolve
    ? null
    : gallery[0] ?? pickInventoryThumbnail(row) ?? LISTING_IMAGE_FALLBACK;
  const area = row.location?.trim() || inferListingArea(row.title, row.description);
  const ownership = row.ownership?.trim() || inferListingStatus(row.description);
  // Prefer sheet `Year of Leasehold`; only infer from copy when the column is blank.
  const leaseYears = resolveLeaseYearsLabel(
    row.leaseYears,
    ownership,
    row.title,
    row.description,
    row.deliveryEstimate,
  );
  const badges = resolveListingPhotoBadges(row);
  const displayTitle = stripEmojis(row.title || row.code) || row.code;
  return {
    id: row.id,
    href: propertyListingPath(row.code),
    code: row.code,
    title: displayTitle,
    imageUrl: img,
    imageCandidates: gallery.length > 0 ? gallery : needsPhotoResolve ? [] : img ? [img] : [],
    needsPhotoResolve,
    imageAlt: `${row.code} property photo`,
    area,
    priceUsd: inventoryListingPriceUsd(row.estimatePriceUsd, row.description),
    priceDisplay: listingPriceLine(row.description),
    ownership,
    bedrooms: displayBedrooms(row),
    buildingSqm: row.buildingSizeSqm?.trim() ? row.buildingSizeSqm : null,
    landSqm: row.landSizeSqm?.trim() ? row.landSizeSqm : null,
    leaseYears,
    featured: Boolean(row.featured),
    showExclusive: badges.showExclusive,
    badgeTopLeft: badges.badgeTopLeft,
    categoryLabel: badges.categoryLabel,
    statusBadge: badges.statusBadge,
    externalListingUrl: row.listingUrl?.trim() || null,
  };
}

export type DevelopmentFeaturedInput = {
  id: number;
  slug: string;
  title: string;
  area: string;
  shortDescription: string;
  heroImageUrl?: string | null;
  featured: boolean;
  priceFrom: number;
  currency: string;
  propertyType: string;
  bedroomsMin: number;
  bedroomsMax: number;
};

export function developmentProjectToFeaturedModel(p: DevelopmentFeaturedInput, _idx: number): FeaturedCardModel {
  const bedrooms =
    p.bedroomsMin === p.bedroomsMax
      ? String(p.bedroomsMin)
      : `${p.bedroomsMin}–${p.bedroomsMax}`;
  const priceDisplay =
    p.priceFrom > 0 ? `${p.currency} ${p.priceFrom.toLocaleString("en-US")}` : "Price on request";
  const priceUsd =
    p.priceFrom > 0 && p.currency.trim().toUpperCase() === "USD" ? p.priceFrom : null;
  const leaseYears = inferLeaseYearsLabel(p.shortDescription);
  const showExclusive = Boolean(p.featured);
  const statusBadge = /\boff[\s-]?plan\b/i.test(p.ownership) ? "Off-plan" : null;
  const category =
    p.propertyType?.trim() ||
    (/\b(villa|residence|home|house)\b/i.test(p.title) ? "Residential" : "Development");
  return {
    id: `dev-${p.slug}`,
    href: `/projects/${encodeURIComponent(p.slug)}`,
    code: `P-${p.id}`,
    title: p.title,
    imageUrl: p.heroImageUrl ?? null,
    imageAlt: p.title,
    area: p.area?.trim() || "Bali",
    priceUsd,
    priceDisplay,
    ownership: p.propertyType?.trim() || "Off-plan",
    bedrooms,
    buildingSqm: null,
    landSqm: null,
    leaseYears,
    featured: Boolean(p.featured),
    showExclusive,
    badgeTopLeft: showExclusive ? null : null,
    categoryLabel: category,
    statusBadge,
    externalListingUrl: null,
  };
}

function StatSqmValue({
  value,
  muted,
  isExclusive,
  iconName,
}: {
  value: string | null;
  muted: boolean;
  isExclusive: boolean;
  iconName: Extract<ListingStatIconName, "land" | "building">;
}) {
  const num = value?.trim() || "—";
  const iconClass = isExclusive ? "shrink-0 text-[#e0fdac]" : "shrink-0";
  const iconStyle = !isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 tabular-nums whitespace-nowrap",
        muted && !isExclusive ? "text-[#1c1917]/45" : "",
        muted && isExclusive ? "text-white/50" : "",
      ].join(" ")}
    >
      <ListingStatIcon name={iconName} size={14} className={iconClass} style={iconStyle} />
      <span>{num}</span>
      <span className="shrink-0">m²</span>
    </span>
  );
}

export type FeaturedListingCardProps = {
  model: FeaturedCardModel;
  idx: number;
  /** Called when every candidate photo failed — parent can swap in another listing. */
  onImageUnavailable?: (code: string) => void;
};

export function FeaturedListingCard({ model: row, idx, onImageUnavailable }: FeaturedListingCardProps) {
  const common = useSiteCopy(COMMON_COPY);
  const currency = useSiteCurrency();
  const { data: resolvedPhotos, isLoading: photosLoading } = useListingPhotos(
    row.code,
    Boolean(row.needsPhotoResolve),
  );
  const resolvedGallery = useMemo(
    () => (resolvedPhotos ? inventoryGalleryUrls(resolvedPhotos) : []),
    [resolvedPhotos],
  );
  const priceLabel = useMemo(
    () => formatPriceForSiteCurrency(row.priceUsd, row.priceDisplay, currency),
    [row.priceUsd, row.priceDisplay, currency],
  );
  const candidates = useMemo(() => {
    const raw = resolvedGallery.length
      ? resolvedGallery
      : row.imageCandidates?.length
        ? row.imageCandidates
        : row.imageUrl
          ? [row.imageUrl]
          : [];
    const seen = new Set<string>();
    return raw
      .map((u) => proxyInventoryImageUrl(u) ?? "")
      .filter((u) => {
        if (!u || seen.has(u)) return false;
        seen.add(u);
        return true;
      });
  }, [resolvedGallery, row.imageCandidates, row.imageUrl]);

  const [candidateIdx, setCandidateIdx] = useState(0);
  const [showStockFallback, setShowStockFallback] = useState(false);

  useEffect(() => {
    setCandidateIdx(0);
    setShowStockFallback(false);
  }, [row.code, resolvedGallery]);

  const swapOnFailure = Boolean(onImageUnavailable);
  const photoSrc = showStockFallback
    ? LISTING_IMAGE_FALLBACK
    : (candidates[candidateIdx] ?? (swapOnFailure ? null : LISTING_IMAGE_FALLBACK));

  useEffect(() => {
    if (swapOnFailure && !photosLoading && candidates.length === 0) {
      onImageUnavailable?.(row.code);
    }
  }, [swapOnFailure, photosLoading, candidates.length, row.code, onImageUnavailable]);

  const isExclusive = row.showExclusive;
  const calendarTenure = resolveCalendarTenure(row.ownership, row.leaseYears);
  const tenureMetaIconClass = isExclusive ? "text-[#e0fdac]" : "";
  const tenureMetaIconStyle = !isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined;
  const ext = row.externalListingUrl?.trim();

  const topLeftLabel = row.badgeTopLeft ?? (row.showExclusive ? common.exclusive : null);
  const topRightLabel = row.categoryLabel
    ? categoryBadgeDisplayLabel(row.categoryLabel, common)
    : null;
  const statusBadgeLabel = row.statusBadge ? statusBadgeDisplayLabel(row.statusBadge, common) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ duration: 0.45, delay: Math.min(idx * 0.06, 0.3) }}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_-12px_rgba(28,25,23,0.12)] ring-1 ring-[#1c1917]/[0.06]"
    >
      <Link href={row.href} className="group flex h-full min-h-0 flex-1 flex-col">
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[#d8d4ce]">
          {photosLoading && row.needsPhotoResolve ? (
            <div className="h-full w-full animate-pulse bg-[#d8d4ce]" aria-hidden />
          ) : photoSrc ? (
            <img
              src={photoSrc}
              alt=""
              role="presentation"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
              decoding="async"
              loading="lazy"
              onError={() => {
                if (candidateIdx < candidates.length - 1) {
                  setCandidateIdx((i) => i + 1);
                  return;
                }
                if (!showStockFallback) {
                  setShowStockFallback(true);
                  return;
                }
                if (swapOnFailure) {
                  onImageUnavailable?.(row.code);
                }
              }}
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-[#d8d4ce]" aria-hidden />
          )}

          {topLeftLabel ? (
            <span
              className="absolute left-3 top-3 rounded px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-white shadow-md"
              style={{ backgroundColor: HIGHLIGHTED_CARD_BRAND }}
            >
              {topLeftLabel}
            </span>
          ) : null}

          {topRightLabel ? (
            <span className="absolute right-3 top-3 rounded bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1c1917] shadow-sm backdrop-blur-sm">
              {topRightLabel}
            </span>
          ) : null}

          {row.showExclusive ? (
            <span
              className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-md shadow-md"
              style={{ backgroundColor: "#1c1917", color: HIGHLIGHTED_CARD_ACCENT }}
              aria-hidden
            >
              <Diamond size={14} strokeWidth={2.5} />
            </span>
          ) : null}

          {statusBadgeLabel ? (
            <span
              className="absolute bottom-3 right-3 rounded px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#1c1917] shadow-md"
              style={{ backgroundColor: HIGHLIGHTED_CARD_ACCENT }}
            >
              {statusBadgeLabel}
            </span>
          ) : null}
        </div>

        <div
          className={[
            "flex flex-1 flex-col px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4",
            isExclusive ? "bg-[#01514E] text-white" : "bg-white text-[#1c1917]",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-2 text-xs">
            <span
              className={[
                "inline-flex items-center gap-1.5 font-medium",
                isExclusive ? "text-white/90" : "text-[#1c1917]/80",
              ].join(" ")}
            >
              <MapPin size={14} className={isExclusive ? "text-[#e0fdac]" : ""} style={!isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined} />
              {row.area}
            </span>
            <span
              className={
                isExclusive
                  ? "shrink-0 text-[10px] uppercase tracking-wider text-white/55"
                  : "shrink-0 text-[10px] uppercase tracking-wider text-[#1c1917]/45"
              }
            >
              {row.code}
            </span>
          </div>

          <h3
            className={[
              "mt-2 line-clamp-2 font-sans text-base font-semibold leading-snug tracking-[0.02em] text-balance md:text-[1.05rem] md:leading-snug",
              isExclusive ? "text-white" : "text-[#1c1917]",
            ].join(" ")}
          >
            {row.title}
          </h3>

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span
              className={[
                "text-lg font-semibold tabular-nums tracking-tight md:text-xl",
                isExclusive ? "text-white" : "text-[#1c1917]",
              ].join(" ")}
            >
              {priceLabel}
            </span>
            <span
              className={[
                "shrink-0 text-right text-xs font-medium leading-tight",
                isExclusive ? "text-white/70" : "text-[#1c1917]/60",
              ].join(" ")}
            >
              <span className="block">{row.ownership}</span>
              {row.leaseYears && /\bleasehold\b/i.test(row.ownership) ? (
                <span
                  className={[
                    "mt-0.5 block text-[11px] font-semibold tabular-nums",
                    isExclusive ? "text-white/90" : "text-[#1c1917]/80",
                  ].join(" ")}
                >
                  {row.leaseYears}
                </span>
              ) : null}
            </span>
          </div>

          <div
            className={[
              "mt-4 grid grid-cols-4 gap-x-1.5 gap-y-2.5 border-t pt-3 text-[11px] sm:gap-x-3 sm:text-xs",
              isExclusive ? "border-white/15 text-white/90" : "border-[#1c1917]/10 text-[#1c1917]/80",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-1 tabular-nums whitespace-nowrap">
              <BedDouble size={14} className={isExclusive ? "shrink-0 text-[#e0fdac]" : "shrink-0"} style={!isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined} />
              <span>{row.bedrooms}</span>
            </span>
            <StatSqmValue
              value={row.buildingSqm}
              muted={!row.buildingSqm?.trim()}
              isExclusive={isExclusive}
              iconName="building"
            />
            <StatSqmValue
              value={row.landSqm}
              muted={!row.landSqm?.trim()}
              isExclusive={isExclusive}
              iconName="land"
            />
            <span className="inline-flex min-w-0 items-center gap-1.5 tabular-nums">
              <CalendarDays size={14} className={tenureMetaIconClass} style={tenureMetaIconStyle} />
              {calendarTenure.kind === "infinity" ? (
                <InfinityIcon
                  size={14}
                  strokeWidth={2}
                  className={tenureMetaIconClass}
                  style={tenureMetaIconStyle}
                  aria-label="No fixed lease term"
                />
              ) : calendarTenure.kind === "lease" ? (
                <span className="truncate">{calendarTenure.label}</span>
              ) : (
                "—"
              )}
            </span>
          </div>
        </div>
      </Link>
      {ext ? (
        <a
          href={ext}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-3 top-12 z-20 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-primary shadow-md backdrop-blur-sm transition-colors hover:bg-white"
          title="View on listing site"
          aria-label="Open external listing"
        >
          <ExternalLink size={16} />
        </a>
      ) : null}
    </motion.article>
  );
}
