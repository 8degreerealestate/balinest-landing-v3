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
  Maximize2,
  Square,
} from "lucide-react";
import type { PropertyInventoryListing } from "@workspace/api-client-react";
import {
  inferLeaseYearsLabel,
  inferListingArea,
  inferListingStatus,
  listingPriceLine,
  inventoryGalleryUrls,
  LISTING_IMAGE_FALLBACK,
  pickInventoryThumbnail,
} from "@/lib/portfolio-listing";
import { COMMON_COPY } from "@/lib/i18n/common";
import { useSiteCopy } from "@/lib/site-language";

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
  imageAlt: string;
  area: string;
  priceDisplay: string;
  ownership: string;
  bedrooms: string;
  buildingSqm: string | null;
  landSqm: string | null;
  leaseYears: string | null;
  featured: boolean;
  categoryLabel: string;
  showGreatDeal: boolean;
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

function formatCardPrice(row: PropertyInventoryListing): string {
  if (row.estimatePriceUsd) {
    const raw = String(row.estimatePriceUsd).replace(/,/g, "").trim();
    const n = Number(raw);
    if (!Number.isNaN(n) && n > 0) return `USD ${n.toLocaleString("en-US")}`;
    if (raw) return `USD ${raw}`;
  }
  return listingPriceLine(row.description);
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

function categoryBadge(row: PropertyInventoryListing): string {
  const t = `${row.title} ${row.description}`.toLowerCase();
  if (/\b(villa|residence|home|house)\b/.test(t)) return "Residential";
  return "Investment";
}

/** Map an inventory API row to the highlighted card model (homepage / projects). */
export function inventoryRowToFeaturedModel(row: PropertyInventoryListing, idx: number): FeaturedCardModel {
  const gallery = inventoryGalleryUrls(row);
  const img = gallery[0] ?? pickInventoryThumbnail(row) ?? LISTING_IMAGE_FALLBACK;
  const area = row.location?.trim() || inferListingArea(row.title, row.description);
  const ownership = row.ownership?.trim() || inferListingStatus(row.description);
  const leaseYears =
    inferLeaseYearsLabel(row.description) ??
    inferLeaseYearsLabel(ownership) ??
    inferLeaseYearsLabel(row.deliveryEstimate ?? "");
  const showGreatDeal = Boolean(row.featured) || idx >= 2;
  const displayTitle = stripEmojis(row.title || row.code) || row.code;
  return {
    id: row.id,
    href: `/properties/${encodeURIComponent(row.code)}`,
    code: row.code,
    title: displayTitle,
    imageUrl: img,
    imageCandidates: gallery.length > 0 ? gallery : [img],
    imageAlt: `${row.code} property photo`,
    area,
    priceDisplay: formatCardPrice(row),
    ownership,
    bedrooms: displayBedrooms(row),
    buildingSqm: row.buildingSizeSqm?.trim() ? row.buildingSizeSqm : null,
    landSqm: row.landSizeSqm?.trim() ? row.landSizeSqm : null,
    leaseYears,
    featured: Boolean(row.featured),
    categoryLabel: categoryBadge(row),
    showGreatDeal,
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

export function developmentProjectToFeaturedModel(p: DevelopmentFeaturedInput, idx: number): FeaturedCardModel {
  const bedrooms =
    p.bedroomsMin === p.bedroomsMax
      ? String(p.bedroomsMin)
      : `${p.bedroomsMin}–${p.bedroomsMax}`;
  const priceDisplay =
    p.priceFrom > 0 ? `${p.currency} ${p.priceFrom.toLocaleString("en-US")}` : "Price on request";
  const leaseYears = inferLeaseYearsLabel(p.shortDescription);
  const showGreatDeal = Boolean(p.featured) || idx >= 2;
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
    priceDisplay,
    ownership: p.propertyType?.trim() || "Off-plan",
    bedrooms,
    buildingSqm: null,
    landSqm: null,
    leaseYears,
    featured: Boolean(p.featured),
    categoryLabel: category,
    showGreatDeal,
    externalListingUrl: null,
  };
}

export type FeaturedListingCardProps = {
  model: FeaturedCardModel;
  idx: number;
  /** Called when every candidate photo failed — parent can swap in another listing. */
  onImageUnavailable?: (code: string) => void;
};

export function FeaturedListingCard({ model: row, idx, onImageUnavailable }: FeaturedListingCardProps) {
  const common = useSiteCopy(COMMON_COPY);
  const candidates = useMemo(() => {
    const raw = row.imageCandidates?.length
      ? row.imageCandidates
      : row.imageUrl
        ? [row.imageUrl]
        : [];
    const seen = new Set<string>();
    return raw.filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [row.imageCandidates, row.imageUrl]);

  const [candidateIdx, setCandidateIdx] = useState(0);
  const [showStockFallback, setShowStockFallback] = useState(false);
  const swapOnFailure = Boolean(onImageUnavailable);
  const photoSrc = showStockFallback
    ? LISTING_IMAGE_FALLBACK
    : (candidates[candidateIdx] ?? (swapOnFailure ? null : LISTING_IMAGE_FALLBACK));

  useEffect(() => {
    if (swapOnFailure && candidates.length === 0) {
      onImageUnavailable?.(row.code);
    }
  }, [swapOnFailure, candidates.length, row.code, onImageUnavailable]);

  const isExclusive = row.featured;
  const calendarTenure = resolveCalendarTenure(row.ownership, row.leaseYears);
  const tenureMetaIconClass = isExclusive ? "text-[#e0fdac]" : "";
  const tenureMetaIconStyle = !isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined;
  const ext = row.externalListingUrl?.trim();

  const buildingLabel = row.buildingSqm?.trim() ? `${row.buildingSqm.trim()} m²` : "— m²";
  const landLabel = row.landSqm?.trim() ? `${row.landSqm.trim()} m²` : "— m²";

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
          {photoSrc ? (
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

          {row.featured ? (
            <span
              className="absolute left-3 top-3 rounded px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-white shadow-md"
              style={{ backgroundColor: HIGHLIGHTED_CARD_BRAND }}
            >
              {common.exclusive}
            </span>
          ) : null}

          <span className="absolute right-3 top-3 rounded bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1c1917] shadow-sm backdrop-blur-sm">
            {row.categoryLabel === "Residential" || row.categoryLabel === "Investment"
              ? row.categoryLabel === "Residential"
                ? common.residential
                : common.investment
              : row.categoryLabel}
          </span>

          {row.featured ? (
            <span
              className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-md shadow-md"
              style={{ backgroundColor: "#1c1917", color: HIGHLIGHTED_CARD_ACCENT }}
              aria-hidden
            >
              <Diamond size={14} strokeWidth={2.5} />
            </span>
          ) : null}

          {row.showGreatDeal ? (
            <span
              className="absolute bottom-3 right-3 rounded px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#1c1917] shadow-md"
              style={{ backgroundColor: HIGHLIGHTED_CARD_ACCENT }}
            >
              {common.greatDeal}
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
              {row.priceDisplay}
            </span>
            <span
              className={[
                "text-xs font-medium",
                isExclusive ? "text-white/70" : "text-[#1c1917]/60",
              ].join(" ")}
            >
              {row.ownership}
            </span>
          </div>

          <div
            className={[
              "mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t pt-3 text-xs sm:grid-cols-4 sm:gap-x-4",
              isExclusive ? "border-white/15 text-white/90" : "border-[#1c1917]/10 text-[#1c1917]/80",
            ].join(" ")}
          >
            <span className="inline-flex min-w-0 items-center gap-1.5 tabular-nums">
              <BedDouble size={14} className={isExclusive ? "shrink-0 text-[#e0fdac]" : "shrink-0"} style={!isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined} />
              <span className="truncate">{row.bedrooms}</span>
            </span>
            <span
              className={[
                "inline-flex min-w-0 items-center gap-1.5 tabular-nums",
                !row.buildingSqm?.trim() && !isExclusive ? "text-[#1c1917]/45" : "",
                !row.buildingSqm?.trim() && isExclusive ? "text-white/50" : "",
              ].join(" ")}
            >
              <Maximize2 size={14} className={isExclusive ? "shrink-0 text-[#e0fdac]" : "shrink-0"} style={!isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined} />
              <span className="truncate">{buildingLabel}</span>
            </span>
            <span
              className={[
                "inline-flex min-w-0 items-center gap-1.5 tabular-nums",
                !row.landSqm?.trim() && !isExclusive ? "text-[#1c1917]/45" : "",
                !row.landSqm?.trim() && isExclusive ? "text-white/50" : "",
              ].join(" ")}
            >
              <Square size={14} className={isExclusive ? "shrink-0 text-[#e0fdac]" : "shrink-0"} style={!isExclusive ? { color: HIGHLIGHTED_CARD_BRAND } : undefined} />
              <span className="truncate">{landLabel}</span>
            </span>
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
