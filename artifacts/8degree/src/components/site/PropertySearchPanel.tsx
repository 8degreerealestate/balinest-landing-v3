import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { AreaSearchMenuDropdown } from "@/components/site/AreaSearchMenuDropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HOME_LISTINGS_BAND } from "@/lib/home-section-surfaces";
import { BEDROOM_FILTER_OPTIONS, serializeBedroomFilterValues } from "@/lib/property-search-filters";

const MIN_PRICE_BOUND = 0;
const MAX_PRICE_BOUND = 3000000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sliderToPrice(sliderValue: number, maxBound: number = MAX_PRICE_BOUND) {
  return Math.round((sliderValue / 100) * (maxBound - MIN_PRICE_BOUND) + MIN_PRICE_BOUND);
}

function priceToSlider(priceValue: number, maxBound: number = MAX_PRICE_BOUND) {
  if (!Number.isFinite(priceValue)) return 0;
  const span = maxBound - MIN_PRICE_BOUND;
  if (span <= 0) return 0;
  const normalized = ((priceValue - MIN_PRICE_BOUND) / span) * 100;
  return clamp(Math.round(normalized), 0, 100);
}

function parseNumericInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

function formatPriceInput(value: number, maxBound: number = MAX_PRICE_BOUND) {
  if (!Number.isFinite(value)) return "0";
  return clamp(value, MIN_PRICE_BOUND, maxBound).toLocaleString("en-US");
}

function isFullPriceRange(minUsd: number | null, maxUsd: number | null, maxBound: number): boolean {
  const min = minUsd ?? MIN_PRICE_BOUND;
  const max = maxUsd ?? maxBound;
  return min <= MIN_PRICE_BOUND && max >= maxBound;
}

function formatPriceTriggerLabel(
  selectedPriceLabel: string,
  minPrice: string,
  maxPrice: string,
  maxBound: number,
  placeholder = "Price",
): string {
  if (selectedPriceLabel) return selectedPriceLabel;
  const parsedMin = parseNumericInput(minPrice);
  const parsedMax = parseNumericInput(maxPrice);
  if (parsedMin === null || parsedMax === null) return placeholder;
  if (isFullPriceRange(parsedMin, parsedMax, maxBound)) return placeholder;
  return `$${formatPriceInput(parsedMin, maxBound)} – $${formatPriceInput(parsedMax, maxBound)}`;
}

const SALES_QUICK_PRICE_OPTIONS = [
  { label: "$150k-$500k", min: 150_000, max: 500_000 },
  { label: "$500k-$1M", min: 500_000, max: 1_000_000 },
  { label: ">$1M", min: 1_000_000, max: null as number | null },
] as const;

const SEARCH_SELECT_ITEM =
  "cursor-pointer hover:bg-[#e0fdac] focus:bg-[#e0fdac] focus:text-[#1f1d1b] data-[highlighted]:bg-[#e0fdac] data-[highlighted]:text-[#1f1d1b]";
const SEARCH_SELECT_TRIGGER =
  "mt-1 h-auto min-h-10 w-full min-w-0 border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 py-1 text-base text-[#1f1d1b] shadow-none rounded-none ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:border-[#01514E] whitespace-normal items-start [&>span]:block [&>span]:min-w-0 [&>span]:max-w-full [&>span]:overflow-hidden [&>span]:whitespace-normal [&>span]:leading-snug [&>svg]:mt-1 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:stroke-[2] [&>svg]:opacity-70";

const SEARCH_FIELD_LABEL =
  "text-[11px] font-medium uppercase tracking-[0.14em] text-[#01514E] sm:tracking-[0.22em] md:tracking-[0.28em]";

const SEARCH_FIELD_CHEVRON_CLASS =
  "mt-1 h-4 w-4 shrink-0 text-[#1f1d1b] opacity-70 transition-transform duration-200";

function SearchFieldChevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      className={cn(SEARCH_FIELD_CHEVRON_CLASS, open && "rotate-180")}
      strokeWidth={2}
      aria-hidden
    />
  );
}

export type PropertySearchLabels = {
  searchHeadline: string;
  propertyType: string;
  area: string;
  bedrooms: string;
  ownership: string;
  priceRange: string;
  devStatus: string;
  propertyCode: string;
  search: string;
};

export type PropertySearchApplyPayload = {
  area: string;
  propertyType: string;
  bedrooms: string;
  listingQuery: string;
  ownership: string;
  devStatus: string;
  priceMinUsd: number | null;
  priceMaxUsd: number | null;
};

function mapPropertyTypeChoice(raw: string | undefined): string {
  if (!raw) return "all";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function formatBedroomsTriggerLabel(selected: readonly string[], placeholder: string): string {
  if (selected.length === 0) return placeholder;
  return selected
    .map((v) => BEDROOM_FILTER_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join(", ");
}

function BedroomsMultiSelect({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  return (
    <div className="relative mt-1 min-w-0" ref={menuRef}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={label}
      >
        <span className="min-w-0 truncate pr-2">{formatBedroomsTriggerLabel(selected, label)}</span>
        <SearchFieldChevron open={open} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded border border-[#1f1d1b]/20 bg-[#f7f5f1] py-1 shadow-lg">
          {BEDROOM_FILTER_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[#1f1d1b]",
                  isSelected ? "bg-[#e0fdac]" : "hover:bg-[#e0fdac]/70",
                )}
              >
                <span>{opt.label}</span>
                {isSelected ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function mapAreaChoice(selectedArea: string): string {
  if (!selectedArea || selectedArea === "Area") return "all";
  return selectedArea;
}

function mapOwnershipChoice(raw: string | undefined): string {
  if (!raw) return "all";
  if (raw === "freehold") return "Freehold";
  if (raw === "leasehold") return "Leasehold";
  return "all";
}

function mapDevStatusChoice(raw: string | undefined): string {
  if (!raw) return "all";
  return raw;
}

type PropertySearchPanelProps = {
  labels: PropertySearchLabels;
  onApply?: (payload: PropertySearchApplyPayload) => void;
  /** Homepage: band below hero with upward overlap. Listings hero: card sits inside hero under copy. */
  layout?: "overlapBelowHero" | "embeddedInHero";
  /** Long-term rentals: area, bedrooms, price/year, and search only (custom headline via labels). */
  fieldSet?: "full" | "rentalsMinimal";
  /** Upper bound for price min/max inputs and sliders (USD). Defaults to 3,000,000. */
  priceRangeMax?: number;
  /** Hydrate controls from URL / prior search (e.g. /projects?area=Melasti). */
  initialValues?: Partial<PropertySearchApplyPayload> | null;
};

export function PropertySearchPanel({
  labels: t,
  onApply,
  layout = "overlapBelowHero",
  fieldSet = "full",
  priceRangeMax,
  initialValues,
}: PropertySearchPanelProps) {
  const effectivePriceMax = priceRangeMax ?? MAX_PRICE_BOUND;

  const initialArea =
    initialValues?.area && initialValues.area !== "all" ? initialValues.area : "Area";
  const initialMin =
    initialValues?.priceMinUsd != null && Number.isFinite(initialValues.priceMinUsd)
      ? clamp(initialValues.priceMinUsd, MIN_PRICE_BOUND, effectivePriceMax)
      : MIN_PRICE_BOUND;
  const initialMax =
    initialValues?.priceMaxUsd != null && Number.isFinite(initialValues.priceMaxUsd)
      ? clamp(initialValues.priceMaxUsd, MIN_PRICE_BOUND, effectivePriceMax)
      : effectivePriceMax;

  const [isAreaMenuOpen, setIsAreaMenuOpen] = useState(false);
  const [areaLocationSearch, setAreaLocationSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [propertyTypeChoice, setPropertyTypeChoice] = useState<string | undefined>(() => {
    const raw = initialValues?.propertyType;
    if (!raw || raw === "all") return undefined;
    return raw.toLowerCase();
  });
  const [bedroomsChoices, setBedroomsChoices] = useState<string[]>(() => {
    const raw = initialValues?.bedrooms;
    if (!raw || raw === "all") return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  });
  const [ownershipChoice, setOwnershipChoice] = useState<string | undefined>(() => {
    const raw = initialValues?.ownership;
    if (!raw || raw === "all") return undefined;
    return raw.toLowerCase();
  });
  const [devStatusChoice, setDevStatusChoice] = useState<string | undefined>(() => {
    const raw = initialValues?.devStatus;
    if (!raw || raw === "all") return undefined;
    return raw;
  });
  const [isPriceMenuOpen, setIsPriceMenuOpen] = useState(false);
  const [selectedPriceLabel, setSelectedPriceLabel] = useState("");
  const [minPrice, setMinPrice] = useState(() => formatPriceInput(initialMin, effectivePriceMax));
  const [maxPrice, setMaxPrice] = useState(() => formatPriceInput(initialMax, effectivePriceMax));
  const [minSlider, setMinSlider] = useState(() => priceToSlider(initialMin, effectivePriceMax));
  const [maxSlider, setMaxSlider] = useState(() => priceToSlider(initialMax, effectivePriceMax));
  const [propertyCode, setPropertyCode] = useState(() => initialValues?.listingQuery?.trim() ?? "");
  const areaTriggerRef = useRef<HTMLButtonElement | null>(null);
  const areaLocationSearchRef = useRef<HTMLInputElement | null>(null);
  const priceMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAreaMenuOpen) {
      setAreaLocationSearch("");
      return;
    }
    const timer = window.setTimeout(() => areaLocationSearchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isAreaMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!priceMenuRef.current) return;
      if (!priceMenuRef.current.contains(event.target as Node)) {
        setIsPriceMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function emitApply() {
    const parsedMin = parseNumericInput(minPrice);
    const parsedMax = parseNumericInput(maxPrice);
    const minUsd = parsedMin ?? MIN_PRICE_BOUND;
    const maxUsd = parsedMax ?? effectivePriceMax;
    // Full-range defaults should not count as an active price filter.
    const priceFilterActive = !isFullPriceRange(minUsd, maxUsd, effectivePriceMax);
    onApply?.({
      area: mapAreaChoice(selectedArea),
      propertyType: mapPropertyTypeChoice(propertyTypeChoice),
      bedrooms: serializeBedroomFilterValues(bedroomsChoices),
      listingQuery: propertyCode.trim(),
      ownership: mapOwnershipChoice(ownershipChoice),
      devStatus: mapDevStatusChoice(devStatusChoice),
      priceMinUsd: priceFilterActive ? minUsd : null,
      priceMaxUsd: priceFilterActive ? maxUsd : null,
    });
  }

  const priceTriggerText = formatPriceTriggerLabel(
    selectedPriceLabel,
    minPrice,
    maxPrice,
    effectivePriceMax,
    "Price",
  );

  const embedded = layout === "embeddedInHero";
  const minimalRental = fieldSet === "rentalsMinimal";

  const areaSearchControl = (
    <>
      <button
        ref={areaTriggerRef}
        type="button"
        className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
        onClick={() => setIsAreaMenuOpen((prev) => !prev)}
        aria-expanded={isAreaMenuOpen}
        aria-label={t.area}
      >
        <span>{selectedArea}</span>
        <SearchFieldChevron open={isAreaMenuOpen} />
      </button>
      <AreaSearchMenuDropdown
        open={isAreaMenuOpen}
        onClose={() => setIsAreaMenuOpen(false)}
        triggerRef={areaTriggerRef}
        selectedArea={selectedArea}
        areaLocationSearch={areaLocationSearch}
        onAreaLocationSearchChange={setAreaLocationSearch}
        onSelectArea={setSelectedArea}
        searchInputRef={areaLocationSearchRef}
      />
    </>
  );

  const rentalMinimalGrid = minimalRental ? (
    <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-12 md:items-end">
      <label className="block min-w-0 md:col-span-12 lg:col-span-4">
        <span className={SEARCH_FIELD_LABEL}>{t.area}</span>
        <div className="relative mt-1 min-w-0">{areaSearchControl}</div>
      </label>
      <div className="block md:col-span-6 lg:col-span-2">
        <span className={SEARCH_FIELD_LABEL}>{t.bedrooms}</span>
        <BedroomsMultiSelect label={t.bedrooms} selected={bedroomsChoices} onChange={setBedroomsChoices} />
      </div>
      <label className="block md:col-span-12 lg:col-span-4">
        <span className={SEARCH_FIELD_LABEL}>{t.priceRange}</span>
        <div className="relative mt-1" ref={priceMenuRef}>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
            onClick={() => setIsPriceMenuOpen((prev) => !prev)}
            aria-expanded={isPriceMenuOpen}
            aria-label={t.priceRange}
          >
            <span>
              {priceTriggerText}
            </span>
            <SearchFieldChevron open={isPriceMenuOpen} />
          </button>

          {isPriceMenuOpen ? (
            <div className="absolute left-0 right-0 top-12 z-40 rounded border border-[#1f1d1b]/20 bg-[#f7f5f1] p-3 shadow-lg">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-[#1f1d1b]/70">
                  Min Price, $
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minPrice}
                    onChange={(e) => {
                      const parsedMin = parseNumericInput(e.target.value);
                      if (parsedMin === null) {
                        setMinPrice("");
                        setSelectedPriceLabel("");
                        return;
                      }
                      const nextMin = clamp(parsedMin, MIN_PRICE_BOUND, effectivePriceMax);
                      const currentMax = clamp(
                        parseNumericInput(maxPrice) ?? effectivePriceMax,
                        MIN_PRICE_BOUND,
                        effectivePriceMax,
                      );
                      const finalMin = Math.min(nextMin, currentMax);

                      setMinPrice(formatPriceInput(finalMin, effectivePriceMax));
                      setMinSlider(priceToSlider(finalMin, effectivePriceMax));
                      setSelectedPriceLabel("");
                    }}
                    className="mt-1 h-9 w-full rounded border border-[#1f1d1b]/35 bg-transparent px-2 text-sm text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
                    placeholder="0"
                  />
                </label>
                <label className="text-xs text-[#1f1d1b]/70">
                  Max Price, $
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(e) => {
                      const parsedMax = parseNumericInput(e.target.value);
                      if (parsedMax === null) {
                        setMaxPrice("");
                        setSelectedPriceLabel("");
                        return;
                      }
                      const nextMax = clamp(parsedMax, MIN_PRICE_BOUND, effectivePriceMax);
                      const currentMin = clamp(
                        parseNumericInput(minPrice) ?? MIN_PRICE_BOUND,
                        MIN_PRICE_BOUND,
                        effectivePriceMax,
                      );
                      const finalMax = Math.max(nextMax, currentMin);

                      setMaxPrice(formatPriceInput(finalMax, effectivePriceMax));
                      setMaxSlider(priceToSlider(finalMax, effectivePriceMax));
                      setSelectedPriceLabel("");
                    }}
                    className="mt-1 h-9 w-full rounded border border-[#1f1d1b]/35 bg-transparent px-2 text-sm text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
                    placeholder="0"
                  />
                </label>
              </div>

              <div className="relative mt-3 h-8">
                <div className="absolute left-0 right-0 top-3 h-1 rounded bg-[#1f1d1b]/20" />
                <div
                  className="absolute top-3 h-1 rounded bg-[#01514E]"
                  style={{ left: `${minSlider}%`, width: `${Math.max(maxSlider - minSlider, 0)}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minSlider}
                  onChange={(e) => {
                    const nextMin = Math.min(Number(e.target.value), maxSlider - 1);
                    const mappedMin = sliderToPrice(nextMin, effectivePriceMax);
                    setMinSlider(nextMin);
                    setMinPrice(formatPriceInput(mappedMin, effectivePriceMax));
                    setSelectedPriceLabel("");
                  }}
                  className="pointer-events-none absolute left-0 right-0 top-1 z-30 h-4 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1f1d1b] [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#1f1d1b]"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={maxSlider}
                  onChange={(e) => {
                    const nextMax = Math.max(Number(e.target.value), minSlider + 1);
                    const mappedMax = sliderToPrice(nextMax, effectivePriceMax);
                    setMaxSlider(nextMax);
                    setMaxPrice(formatPriceInput(mappedMax, effectivePriceMax));
                    setSelectedPriceLabel("");
                  }}
                  className="pointer-events-none absolute left-0 right-0 top-1 z-20 h-4 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1f1d1b] [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#1f1d1b]"
                />
              </div>
            </div>
          ) : null}
        </div>
      </label>
      <div className="flex items-end justify-end md:col-span-12 lg:col-span-2">
        <Button
          type="button"
          className="h-10 rounded-full bg-[#01514E] px-6 text-sm uppercase tracking-[0.12em] text-white hover:bg-[#013f3d]"
          onClick={() => {
            emitApply();
          }}
        >
          {t.search}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <section
      className={
        embedded
          ? "relative z-20 mt-6 w-full min-w-0 md:mt-8"
          : cn(
              "relative z-30 mt-4 w-full min-w-0 pb-2 sm:-mt-14 md:-mt-20 md:pb-3",
              isAreaMenuOpen ? "overflow-visible" : "overflow-x-clip overflow-y-visible",
            )
      }
      style={embedded ? undefined : { backgroundColor: HOME_LISTINGS_BAND }}
    >
      <div
        className={
          embedded
            ? "mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-6"
            : "container mx-auto w-full min-w-0 max-w-full px-4 sm:px-6"
        }
      >
        <div
          className={cn(
            embedded
              ? "w-full min-w-0 max-w-full rounded-[18px] bg-[#f7f5f1] px-4 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)] sm:px-5 sm:py-6 md:px-10 md:py-7"
              : "w-full min-w-0 max-w-full rounded-[18px] bg-[#f7f5f1] px-4 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.16)] sm:px-6 sm:py-6 md:px-10 md:py-7",
            isAreaMenuOpen && "overflow-visible",
          )}
        >
          <div className="mb-5 flex w-full min-w-0 justify-center sm:mb-6">
            <h3 className="max-w-full min-w-0 text-balance text-center text-sm font-bold uppercase leading-snug tracking-[0.02em] text-primary sm:text-base sm:tracking-[0.04em] md:text-xl md:leading-tight md:tracking-[0.06em] lg:text-2xl">
              {t.searchHeadline}
            </h3>
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            {rentalMinimalGrid}
            {!minimalRental && (
              <>
                <div
                  className={cn(
                    "grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-4",
                    isAreaMenuOpen && "relative z-[1] overflow-visible",
                  )}
                >
                  <div className="block min-w-0">
                    <span className={SEARCH_FIELD_LABEL}>{t.propertyType}</span>
                    <Select value={propertyTypeChoice} onValueChange={setPropertyTypeChoice}>
                      <SelectTrigger className={SEARCH_SELECT_TRIGGER} aria-label={t.propertyType}>
                        <SelectValue placeholder={t.propertyType} />
                      </SelectTrigger>
                      <SelectContent className="border-[#1f1d1b]/20 bg-[#f7f5f1]">
                        <SelectItem value="villa" className={SEARCH_SELECT_ITEM}>
                          Villa
                        </SelectItem>
                        <SelectItem value="apartment" className={SEARCH_SELECT_ITEM}>
                          Apartment
                        </SelectItem>
                        <SelectItem value="land" className={SEARCH_SELECT_ITEM}>
                          Land
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              <label className="block min-w-0">
                <span className={SEARCH_FIELD_LABEL}>{t.area}</span>
                <div className="relative mt-1 min-w-0">{areaSearchControl}</div>
              </label>
              <div className="block min-w-0">
                <span className={SEARCH_FIELD_LABEL}>{t.bedrooms}</span>
                <BedroomsMultiSelect
                  label={t.bedrooms}
                  selected={bedroomsChoices}
                  onChange={setBedroomsChoices}
                />
              </div>
              <div className="block min-w-0">
                <span className={SEARCH_FIELD_LABEL}>{t.ownership}</span>
                <Select value={ownershipChoice} onValueChange={setOwnershipChoice}>
                  <SelectTrigger className={SEARCH_SELECT_TRIGGER} aria-label={t.ownership}>
                    <SelectValue placeholder={t.ownership} />
                  </SelectTrigger>
                  <SelectContent className="border-[#1f1d1b]/20 bg-[#f7f5f1]">
                    <SelectItem value="freehold" className={SEARCH_SELECT_ITEM}>
                      Freehold
                    </SelectItem>
                    <SelectItem value="leasehold" className={SEARCH_SELECT_ITEM}>
                      Leasehold
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-12 md:items-end">
              <label className="block min-w-0 md:col-span-4">
                <span className={SEARCH_FIELD_LABEL}>{t.priceRange}</span>
                <div className="relative mt-1" ref={priceMenuRef}>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
                    onClick={() => setIsPriceMenuOpen((prev) => !prev)}
                    aria-expanded={isPriceMenuOpen}
                    aria-label={t.priceRange}
                  >
                    <span>{priceTriggerText}</span>
                    <SearchFieldChevron open={isPriceMenuOpen} />
                  </button>

                  {isPriceMenuOpen ? (
                    <div className="absolute left-0 right-0 top-12 z-40 rounded border border-[#1f1d1b]/20 bg-[#f7f5f1] p-3 shadow-lg">
                      <p className="text-xs font-semibold text-[#1f1d1b]">Quick Price Selections</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {SALES_QUICK_PRICE_OPTIONS.map((option) => {
                          const optionMax = option.max ?? effectivePriceMax;
                          const isActive =
                            selectedPriceLabel === option.label ||
                            (parseNumericInput(minPrice) === option.min &&
                              parseNumericInput(maxPrice) === optionMax);
                          return (
                          <button
                            key={option.label}
                            type="button"
                            className={cn(
                              "rounded border px-2 py-1 text-xs text-[#1f1d1b] hover:bg-[#01514E]/10",
                              isActive ? "border-[#01514E] bg-[#01514E]/10" : "border-[#1f1d1b]/20",
                            )}
                            onClick={() => {
                              setSelectedPriceLabel(option.label);
                              setMinPrice(formatPriceInput(option.min, effectivePriceMax));
                              setMaxPrice(formatPriceInput(optionMax, effectivePriceMax));
                              setMinSlider(priceToSlider(option.min, effectivePriceMax));
                              setMaxSlider(priceToSlider(optionMax, effectivePriceMax));
                            }}
                          >
                            {option.label}
                          </button>
                          );
                        })}
                      </div>

                      <p className="mt-3 text-xs font-semibold text-[#1f1d1b]">Enter Price Manually</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <label className="text-xs text-[#1f1d1b]/70">
                          Min Price, $
                          <input
                            type="text"
                            inputMode="numeric"
                            value={minPrice}
                            onChange={(e) => {
                              const parsedMin = parseNumericInput(e.target.value);
                              if (parsedMin === null) {
                                setMinPrice("");
                                setSelectedPriceLabel("");
                                return;
                              }
                              const nextMin = clamp(parsedMin, MIN_PRICE_BOUND, effectivePriceMax);
                              const currentMax = clamp(
                                parseNumericInput(maxPrice) ?? effectivePriceMax,
                                MIN_PRICE_BOUND,
                                effectivePriceMax,
                              );
                              const finalMin = Math.min(nextMin, currentMax);

                              setMinPrice(formatPriceInput(finalMin, effectivePriceMax));
                              setMinSlider(priceToSlider(finalMin, effectivePriceMax));
                              setSelectedPriceLabel("");
                            }}
                            className="mt-1 h-9 w-full rounded border border-[#1f1d1b]/35 bg-transparent px-2 text-sm text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
                            placeholder="0"
                          />
                        </label>
                        <label className="text-xs text-[#1f1d1b]/70">
                          Max Price, $
                          <input
                            type="text"
                            inputMode="numeric"
                            value={maxPrice}
                            onChange={(e) => {
                              const parsedMax = parseNumericInput(e.target.value);
                              if (parsedMax === null) {
                                setMaxPrice("");
                                setSelectedPriceLabel("");
                                return;
                              }
                              const nextMax = clamp(parsedMax, MIN_PRICE_BOUND, effectivePriceMax);
                              const currentMin = clamp(
                                parseNumericInput(minPrice) ?? MIN_PRICE_BOUND,
                                MIN_PRICE_BOUND,
                                effectivePriceMax,
                              );
                              const finalMax = Math.max(nextMax, currentMin);

                              setMaxPrice(formatPriceInput(finalMax, effectivePriceMax));
                              setMaxSlider(priceToSlider(finalMax, effectivePriceMax));
                              setSelectedPriceLabel("");
                            }}
                            className="mt-1 h-9 w-full rounded border border-[#1f1d1b]/35 bg-transparent px-2 text-sm text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
                            placeholder="0"
                          />
                        </label>
                      </div>

                      <div className="relative mt-3 h-8">
                        <div className="absolute left-0 right-0 top-3 h-1 rounded bg-[#1f1d1b]/20" />
                        <div
                          className="absolute top-3 h-1 rounded bg-[#01514E]"
                          style={{ left: `${minSlider}%`, width: `${Math.max(maxSlider - minSlider, 0)}%` }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={minSlider}
                          onChange={(e) => {
                            const nextMin = Math.min(Number(e.target.value), maxSlider - 1);
                            const mappedMin = sliderToPrice(nextMin, effectivePriceMax);
                            setMinSlider(nextMin);
                            setMinPrice(formatPriceInput(mappedMin, effectivePriceMax));
                            setSelectedPriceLabel("");
                          }}
                          className="pointer-events-none absolute left-0 right-0 top-1 z-30 h-4 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1f1d1b] [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#1f1d1b]"
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={maxSlider}
                          onChange={(e) => {
                            const nextMax = Math.max(Number(e.target.value), minSlider + 1);
                            const mappedMax = sliderToPrice(nextMax, effectivePriceMax);
                            setMaxSlider(nextMax);
                            setMaxPrice(formatPriceInput(mappedMax, effectivePriceMax));
                            setSelectedPriceLabel("");
                          }}
                          className="pointer-events-none absolute left-0 right-0 top-1 z-20 h-4 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1f1d1b] [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#1f1d1b]"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </label>
              <div className="block min-w-0 md:col-span-3">
                <span className={SEARCH_FIELD_LABEL}>{t.devStatus}</span>
                <Select value={devStatusChoice} onValueChange={setDevStatusChoice}>
                  <SelectTrigger className={SEARCH_SELECT_TRIGGER} aria-label={t.devStatus}>
                    <SelectValue placeholder={t.devStatus} />
                  </SelectTrigger>
                  <SelectContent className="border-[#1f1d1b]/20 bg-[#f7f5f1]">
                    <SelectItem value="off-plan" className={SEARCH_SELECT_ITEM}>
                      Off-plan
                    </SelectItem>
                    <SelectItem value="ready" className={SEARCH_SELECT_ITEM}>
                      Ready
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="block min-w-0 md:col-span-3">
                <span className={SEARCH_FIELD_LABEL}>{t.propertyCode}</span>
                <input
                  type="text"
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      emitApply();
                    }
                  }}
                  placeholder="e.g: 8DV35A"
                  className="mt-1 h-10 w-full border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-base text-[#1f1d1b] placeholder:text-[#1f1d1b]/55 focus:border-[#01514E] focus:outline-none"
                />
              </label>
              <div className="flex items-end justify-end md:col-span-2">
                <Button
                  type="button"
                  className="h-10 rounded-full bg-[#01514E] px-6 text-sm uppercase tracking-[0.12em] text-white hover:bg-[#013f3d]"
                  onClick={() => {
                    emitApply();
                  }}
                >
                  {t.search}
                </Button>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
