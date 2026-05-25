import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  activeBaliMapRegions,
  BALI_HIGHLIGHT_BOXES,
  BALI_ISLAND_PATH_D,
  BALI_MAP_BASE_FILL,
  BALI_MAP_BASE_STROKE,
  BALI_MAP_BRAND,
  BALI_MAP_VIEW,
  baliHighlightRectPath,
} from "@/lib/bali-area-map";
import { HOME_LISTINGS_BAND } from "@/lib/home-section-surfaces";

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

const POPULAR_AREA_NAMES = ["Uluwatu", "Melasti", "Bingin", "Pecatu", "Pandawa", "Ungasan", "Padang Padang"] as const;
const PROPERTY_AREA_NAMES = ["Uluwatu", "Canggu", "Umalas", "Pererenan", "Others", "Seminyak", "Ubud", "Tabanan"] as const;

function filterAreaNames(names: readonly string[], query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...names];
  return names.filter((name) => name.toLowerCase().includes(needle));
}

const SEARCH_SELECT_ITEM =
  "cursor-pointer hover:bg-[#e0fdac] focus:bg-[#e0fdac] focus:text-[#1f1d1b] data-[highlighted]:bg-[#e0fdac] data-[highlighted]:text-[#1f1d1b]";
const SEARCH_SELECT_TRIGGER =
  "mt-1 h-auto min-h-10 w-full min-w-0 border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 py-1 text-base text-[#1f1d1b] shadow-none rounded-none ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:border-[#01514E] whitespace-normal items-start [&>span]:block [&>span]:min-w-0 [&>span]:line-clamp-none [&>span]:overflow-visible [&>span]:whitespace-normal [&>span]:leading-snug [&>svg]:mt-1 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:opacity-70";

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
};

function mapPropertyTypeChoice(raw: string | undefined): string {
  if (!raw) return "all";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function mapBedroomsChoice(raw: string | undefined): string {
  if (!raw) return "all";
  return raw;
}

function mapAreaChoice(selectedArea: string): string {
  if (!selectedArea || selectedArea === "Area") return "all";
  return selectedArea;
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
};

export function PropertySearchPanel({
  labels: t,
  onApply,
  layout = "overlapBelowHero",
  fieldSet = "full",
  priceRangeMax,
}: PropertySearchPanelProps) {
  const effectivePriceMax = priceRangeMax ?? MAX_PRICE_BOUND;

  const baliMapClipId = `bali-map-clip-${useId().replace(/:/g, "")}`;
  const [isAreaMenuOpen, setIsAreaMenuOpen] = useState(false);
  const [areaLocationSearch, setAreaLocationSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("Area");
  const [propertyTypeChoice, setPropertyTypeChoice] = useState<string | undefined>(undefined);
  const [bedroomsChoice, setBedroomsChoice] = useState<string | undefined>(undefined);
  const [ownershipChoice, setOwnershipChoice] = useState<string | undefined>(undefined);
  const [devStatusChoice, setDevStatusChoice] = useState<string | undefined>(undefined);
  const [isPriceMenuOpen, setIsPriceMenuOpen] = useState(false);
  const [selectedPriceLabel, setSelectedPriceLabel] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState(() => formatPriceInput(effectivePriceMax, effectivePriceMax));
  const [minSlider, setMinSlider] = useState(0);
  const [maxSlider, setMaxSlider] = useState(100);
  const [propertyCode, setPropertyCode] = useState("");
  const areaMenuRef = useRef<HTMLDivElement | null>(null);
  const areaLocationSearchRef = useRef<HTMLInputElement | null>(null);
  const priceMenuRef = useRef<HTMLDivElement | null>(null);

  const filteredPopularAreas = useMemo(
    () => filterAreaNames(POPULAR_AREA_NAMES, areaLocationSearch),
    [areaLocationSearch],
  );
  const filteredPropertyAreas = useMemo(
    () => filterAreaNames(PROPERTY_AREA_NAMES, areaLocationSearch),
    [areaLocationSearch],
  );

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
      if (areaMenuRef.current && !areaMenuRef.current.contains(event.target as Node)) {
        setIsAreaMenuOpen(false);
      }
      if (!priceMenuRef.current) return;
      if (!priceMenuRef.current.contains(event.target as Node)) {
        setIsPriceMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mapActive = activeBaliMapRegions(selectedArea);

  function emitApply() {
    onApply?.({
      area: mapAreaChoice(selectedArea),
      propertyType: mapPropertyTypeChoice(propertyTypeChoice),
      bedrooms: mapBedroomsChoice(bedroomsChoice),
      listingQuery: propertyCode.trim(),
    });
  }

  const embedded = layout === "embeddedInHero";
  const minimalRental = fieldSet === "rentalsMinimal";

  const rentalMinimalGrid = minimalRental ? (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-12 md:items-end">
      <label className="block md:col-span-12 lg:col-span-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.area}</span>
        <div className="relative mt-1" ref={areaMenuRef}>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
            onClick={() => setIsAreaMenuOpen((prev) => !prev)}
            aria-expanded={isAreaMenuOpen}
            aria-label={t.area}
          >
            <span>{selectedArea}</span>
            <span className="text-sm text-[#1f1d1b]/70">{isAreaMenuOpen ? "▲" : "▼"}</span>
          </button>

          {isAreaMenuOpen ? (
            <div className="absolute left-0 top-12 z-50 grid w-[min(92vw,780px)] grid-cols-1 gap-2 rounded border border-[#01514E]/25 bg-[#f7f5f1] p-2.5 shadow-xl md:grid-cols-[1fr_1fr_1.45fr]">
              <div>
                <p className="text-xs font-semibold text-[#01514E]">Search Locations</p>
                <div className="relative mt-2">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#01514E]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <input
                    ref={areaLocationSearchRef}
                    type="search"
                    value={areaLocationSearch}
                    onChange={(e) => setAreaLocationSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      const pick = filteredPopularAreas[0] ?? filteredPropertyAreas[0];
                      if (!pick) return;
                      e.preventDefault();
                      setSelectedArea(pick);
                      setIsAreaMenuOpen(false);
                    }}
                    placeholder="Search area…"
                    autoComplete="off"
                    aria-label="Search locations"
                    className="h-9 w-full rounded border border-[#01514E] bg-[#f7f7f5] py-1 pl-9 pr-2 text-xs text-[#1f1d1b] placeholder:text-[#1f1d1b]/45 focus:border-[#01514E] focus:outline-none focus:ring-1 focus:ring-[#01514E]/30"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#01514E]/70">Popular Locations</p>
                <div className="mt-1.5 space-y-0.5 text-xs">
                  {filteredPopularAreas.length === 0 ? (
                    <p className="px-1.5 py-1 text-[11px] text-[#1f1d1b]/50">No matches in popular areas</p>
                  ) : (
                    filteredPopularAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setSelectedArea(area);
                          setIsAreaMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[#1f1d1b] hover:bg-[#01514E]/10"
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#01514E] text-[10px] text-white">
                          ●
                        </span>
                        {area}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#01514E]">Property Locations</p>
                <div className="mt-1.5 space-y-1">
                  {filteredPropertyAreas.length === 0 ? (
                    <p className="rounded px-2 py-1.5 text-[11px] text-[#1f1d1b]/50">No matches in property locations</p>
                  ) : (
                    filteredPropertyAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setSelectedArea(area);
                          setIsAreaMenuOpen(false);
                        }}
                        className={`w-full rounded px-2 py-1.5 text-xs ${
                          selectedArea === area
                            ? "bg-[#01514E] text-white"
                            : "bg-[#e6efee] text-[#1f1d1b] hover:bg-[#d7e6e4]"
                        }`}
                      >
                        {area}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="relative min-h-[220px] overflow-hidden rounded border border-[#01514E]/15 bg-[#e8eceb] md:min-h-[260px]">
                <svg
                  viewBox={`0 0 ${BALI_MAP_VIEW.w} ${BALI_MAP_VIEW.h}`}
                  className="h-full w-full min-h-[240px]"
                  aria-hidden
                >
                  <title>Bali map</title>
                  <defs>
                    <clipPath id={baliMapClipId}>
                      <path d={BALI_ISLAND_PATH_D} />
                    </clipPath>
                  </defs>
                  <path fill={BALI_MAP_BASE_FILL} stroke={BALI_MAP_BASE_STROKE} strokeWidth="1" d={BALI_ISLAND_PATH_D} />
                  <g clipPath={`url(#${baliMapClipId})`}>
                    {(Object.keys(BALI_HIGHLIGHT_BOXES) as string[]).map((regionId) => {
                      const [w, s, e, n] = BALI_HIGHLIGHT_BOXES[regionId];
                      const on = mapActive.has(regionId);
                      return (
                        <path
                          key={regionId}
                          d={baliHighlightRectPath(w, s, e, n)}
                          fill={on ? BALI_MAP_BRAND : "transparent"}
                          fillOpacity={on ? 0.9 : 0}
                        />
                      );
                    })}
                  </g>
                  <path fill="none" stroke={BALI_MAP_BASE_STROKE} strokeWidth="1" d={BALI_ISLAND_PATH_D} />
                </svg>
              </div>
            </div>
          ) : null}
        </div>
      </label>
      <div className="block md:col-span-6 lg:col-span-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.bedrooms}</span>
        <Select value={bedroomsChoice} onValueChange={setBedroomsChoice}>
          <SelectTrigger className={SEARCH_SELECT_TRIGGER} aria-label={t.bedrooms}>
            <SelectValue placeholder={t.bedrooms} />
          </SelectTrigger>
          <SelectContent className="border-[#1f1d1b]/20 bg-[#f7f5f1]">
            <SelectItem value="1" className={SEARCH_SELECT_ITEM}>
              1 Bedroom
            </SelectItem>
            <SelectItem value="2" className={SEARCH_SELECT_ITEM}>
              2 Bedrooms
            </SelectItem>
            <SelectItem value="3" className={SEARCH_SELECT_ITEM}>
              3 Bedrooms
            </SelectItem>
            <SelectItem value="4" className={SEARCH_SELECT_ITEM}>
              4 Bedrooms
            </SelectItem>
            <SelectItem value="5" className={SEARCH_SELECT_ITEM}>
              5 Bedrooms
            </SelectItem>
            <SelectItem value="6+" className={SEARCH_SELECT_ITEM}>
              6+ Bedrooms
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <label className="block md:col-span-12 lg:col-span-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.priceRange}</span>
        <div className="relative mt-1" ref={priceMenuRef}>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
            onClick={() => setIsPriceMenuOpen((prev) => !prev)}
            aria-expanded={isPriceMenuOpen}
            aria-label={t.priceRange}
          >
            <span>
              {selectedPriceLabel ||
                (minPrice && maxPrice ? `$${minPrice} – $${maxPrice}` : "Price")}
            </span>
            <span className="text-sm text-[#1f1d1b]/70">{isPriceMenuOpen ? "▲" : "▼"}</span>
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
          ? "relative z-20 mt-6 w-full translate-y-2 md:mt-8 md:translate-y-3"
          : "-mt-12 relative z-30 pb-2 md:pb-3"
      }
      style={embedded ? undefined : { backgroundColor: HOME_LISTINGS_BAND }}
    >
      <div className={embedded ? "mx-auto w-full max-w-6xl" : "container mx-auto px-4 sm:px-6"}>
        <div
          className={
            embedded
              ? "rounded-[18px] bg-[#f7f5f1] px-5 py-6 shadow-[0_14px_40px_rgba(0,0,0,0.22)] md:px-10 md:py-7"
              : "-translate-y-[25%] rounded-[18px] bg-[#f7f5f1] px-6 py-6 shadow-[0_14px_40px_rgba(0,0,0,0.16)] md:px-10 md:py-7"
          }
        >
          <div className="mb-6 flex w-full justify-center px-2 sm:px-4">
            <h3 className="max-w-full text-balance text-center text-sm font-bold uppercase leading-snug tracking-[0.04em] text-primary sm:text-base sm:tracking-[0.05em] md:text-xl md:leading-tight md:tracking-[0.06em] lg:text-2xl">
              {t.searchHeadline}
            </h3>
          </div>
          <div className="flex flex-col gap-5">
            {rentalMinimalGrid}
            {!minimalRental && (
              <>
                <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-4">
                  <div className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.propertyType}</span>
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
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.area}</span>
                <div className="relative mt-1" ref={areaMenuRef}>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
                    onClick={() => setIsAreaMenuOpen((prev) => !prev)}
                    aria-expanded={isAreaMenuOpen}
                    aria-label={t.area}
                  >
                    <span>{selectedArea}</span>
                    <span className="text-sm text-[#1f1d1b]/70">{isAreaMenuOpen ? "▲" : "▼"}</span>
                  </button>

                  {isAreaMenuOpen ? (
                    <div className="absolute left-0 top-12 z-50 grid w-[min(92vw,780px)] grid-cols-1 gap-2 rounded border border-[#01514E]/25 bg-[#f7f5f1] p-2.5 shadow-xl md:grid-cols-[1fr_1fr_1.45fr]">
                      <div>
                        <p className="text-xs font-semibold text-[#01514E]">Search Locations</p>
                        <div className="relative mt-2">
                          <Search
                            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#01514E]"
                            strokeWidth={2}
                            aria-hidden
                          />
                          <input
                            ref={areaLocationSearchRef}
                            type="search"
                            value={areaLocationSearch}
                            onChange={(e) => setAreaLocationSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter") return;
                              const pick = filteredPopularAreas[0] ?? filteredPropertyAreas[0];
                              if (!pick) return;
                              e.preventDefault();
                              setSelectedArea(pick);
                              setIsAreaMenuOpen(false);
                            }}
                            placeholder="Search area…"
                            autoComplete="off"
                            aria-label="Search locations"
                            className="h-9 w-full rounded border border-[#01514E] bg-[#f7f7f5] py-1 pl-9 pr-2 text-xs text-[#1f1d1b] placeholder:text-[#1f1d1b]/45 focus:border-[#01514E] focus:outline-none focus:ring-1 focus:ring-[#01514E]/30"
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-[#01514E]/70">Popular Locations</p>
                        <div className="mt-1.5 space-y-0.5 text-xs">
                          {filteredPopularAreas.length === 0 ? (
                            <p className="px-1.5 py-1 text-[11px] text-[#1f1d1b]/50">No matches in popular areas</p>
                          ) : (
                            filteredPopularAreas.map((area) => (
                              <button
                                key={area}
                                type="button"
                                onClick={() => {
                                  setSelectedArea(area);
                                  setIsAreaMenuOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[#1f1d1b] hover:bg-[#01514E]/10"
                              >
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#01514E] text-[10px] text-white">
                                  ●
                                </span>
                                {area}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#01514E]">Property Locations</p>
                        <div className="mt-1.5 space-y-1">
                          {filteredPropertyAreas.length === 0 ? (
                            <p className="rounded px-2 py-1.5 text-[11px] text-[#1f1d1b]/50">No matches in property locations</p>
                          ) : (
                            filteredPropertyAreas.map((area) => (
                              <button
                                key={area}
                                type="button"
                                onClick={() => {
                                  setSelectedArea(area);
                                  setIsAreaMenuOpen(false);
                                }}
                                className={`w-full rounded px-2 py-1.5 text-xs ${
                                  selectedArea === area
                                    ? "bg-[#01514E] text-white"
                                    : "bg-[#e6efee] text-[#1f1d1b] hover:bg-[#d7e6e4]"
                                }`}
                              >
                                {area}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="relative min-h-[220px] overflow-hidden rounded border border-[#01514E]/15 bg-[#e8eceb] md:min-h-[260px]">
                        <svg
                          viewBox={`0 0 ${BALI_MAP_VIEW.w} ${BALI_MAP_VIEW.h}`}
                          className="h-full w-full min-h-[240px]"
                          aria-hidden
                        >
                          <title>Bali map</title>
                          <defs>
                            <clipPath id={baliMapClipId}>
                              <path d={BALI_ISLAND_PATH_D} />
                            </clipPath>
                          </defs>
                          <path fill={BALI_MAP_BASE_FILL} stroke={BALI_MAP_BASE_STROKE} strokeWidth="1" d={BALI_ISLAND_PATH_D} />
                          <g clipPath={`url(#${baliMapClipId})`}>
                            {(Object.keys(BALI_HIGHLIGHT_BOXES) as string[]).map((regionId) => {
                              const [w, s, e, n] = BALI_HIGHLIGHT_BOXES[regionId];
                              const on = mapActive.has(regionId);
                              return (
                                <path
                                  key={regionId}
                                  d={baliHighlightRectPath(w, s, e, n)}
                                  fill={on ? BALI_MAP_BRAND : "transparent"}
                                  fillOpacity={on ? 0.9 : 0}
                                />
                              );
                            })}
                          </g>
                          <path fill="none" stroke={BALI_MAP_BASE_STROKE} strokeWidth="1" d={BALI_ISLAND_PATH_D} />
                        </svg>
                      </div>
                    </div>
                  ) : null}
                </div>
              </label>
              <div className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.bedrooms}</span>
                <Select value={bedroomsChoice} onValueChange={setBedroomsChoice}>
                  <SelectTrigger className={SEARCH_SELECT_TRIGGER} aria-label={t.bedrooms}>
                    <SelectValue placeholder={t.bedrooms} />
                  </SelectTrigger>
                  <SelectContent className="border-[#1f1d1b]/20 bg-[#f7f5f1]">
                    <SelectItem value="1" className={SEARCH_SELECT_ITEM}>
                      1 Bedroom
                    </SelectItem>
                    <SelectItem value="2" className={SEARCH_SELECT_ITEM}>
                      2 Bedrooms
                    </SelectItem>
                    <SelectItem value="3" className={SEARCH_SELECT_ITEM}>
                      3 Bedrooms
                    </SelectItem>
                    <SelectItem value="4" className={SEARCH_SELECT_ITEM}>
                      4 Bedrooms
                    </SelectItem>
                    <SelectItem value="5" className={SEARCH_SELECT_ITEM}>
                      5 Bedrooms
                    </SelectItem>
                    <SelectItem value="6+" className={SEARCH_SELECT_ITEM}>
                      6+ Bedrooms
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.ownership}</span>
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

            <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-12 md:items-end">
              <label className="block md:col-span-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.priceRange}</span>
                <div className="relative mt-1" ref={priceMenuRef}>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between border-0 border-b border-[#1f1d1b]/35 bg-transparent px-0 text-left text-base text-[#1f1d1b] focus:border-[#01514E] focus:outline-none"
                    onClick={() => setIsPriceMenuOpen((prev) => !prev)}
                    aria-expanded={isPriceMenuOpen}
                    aria-label={t.priceRange}
                  >
                    <span>{selectedPriceLabel || "Price"}</span>
                    <span className="text-sm text-[#1f1d1b]/70">{isPriceMenuOpen ? "▲" : "▼"}</span>
                  </button>

                  {isPriceMenuOpen ? (
                    <div className="absolute left-0 right-0 top-12 z-40 rounded border border-[#1f1d1b]/20 bg-[#f7f5f1] p-3 shadow-lg">
                      <p className="text-xs font-semibold text-[#1f1d1b]">Quick Price Selections</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          { label: "$150k-$500k", min: "150000", max: "500000", minS: 5, maxS: 17 },
                          { label: "$500k-$1M", min: "500000", max: "1000000", minS: 17, maxS: 33 },
                          { label: ">$1M", min: "1000000", max: String(effectivePriceMax), minS: 33, maxS: 100 },
                        ].map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            className="rounded border border-[#1f1d1b]/20 px-2 py-1 text-xs text-[#1f1d1b] hover:bg-[#01514E]/10"
                            onClick={() => {
                              setSelectedPriceLabel(option.label);
                              setMinPrice(formatPriceInput(Number(option.min), effectivePriceMax));
                              setMaxPrice(formatPriceInput(Number(option.max), effectivePriceMax));
                              setMinSlider(option.minS);
                              setMaxSlider(option.maxS);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
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
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.devStatus}</span>
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
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#01514E]">{t.propertyCode}</span>
                <input
                  type="text"
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
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
