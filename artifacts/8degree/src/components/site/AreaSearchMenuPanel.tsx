import type { RefObject } from "react";
import { Check, Search } from "lucide-react";
import { BaliAreaMap } from "@/components/site/BaliAreaMap";
import { BALI_POPULAR_SEARCH_AREAS, BALI_PROPERTY_SEARCH_AREAS } from "@/lib/bali-search-areas";
import { cn } from "@/lib/utils";

export function filterAreaNames(names: readonly string[], query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...names];
  return names.filter((name) => name.toLowerCase().includes(needle));
}

export const AREA_SEARCH_MENU_PANEL_CLASS =
  "grid w-full min-w-0 grid-cols-1 gap-2 overflow-visible rounded border border-[#01514E]/25 bg-[#f7f5f1] p-2.5 shadow-xl sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.45fr)]";

type AreaSearchMenuPanelProps = {
  selectedArea: string;
  areaLocationSearch: string;
  onAreaLocationSearchChange: (value: string) => void;
  onSelectArea: (area: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
};

function isAreaSelected(selectedArea: string, area: string): boolean {
  return selectedArea === area;
}

export function AreaSearchMenuPanel({
  selectedArea,
  areaLocationSearch,
  onAreaLocationSearchChange,
  onSelectArea,
  searchInputRef,
  className,
}: AreaSearchMenuPanelProps) {
  const filteredPopularAreas = filterAreaNames(BALI_POPULAR_SEARCH_AREAS, areaLocationSearch);
  const filteredPropertyAreas = filterAreaNames(BALI_PROPERTY_SEARCH_AREAS, areaLocationSearch);
  const hasSelection = Boolean(selectedArea && selectedArea !== "Area" && selectedArea !== "all");

  return (
    <div className={className ?? AREA_SEARCH_MENU_PANEL_CLASS}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#01514E]">Search Locations</p>
          {hasSelection ? (
            <button
              type="button"
              onClick={() => onSelectArea("Area")}
              className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#01514E]/80 underline-offset-2 hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#01514E]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            ref={searchInputRef}
            type="search"
            value={areaLocationSearch}
            onChange={(e) => onAreaLocationSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const pick = filteredPopularAreas[0] ?? filteredPropertyAreas[0];
              if (!pick) return;
              e.preventDefault();
              onSelectArea(pick);
            }}
            placeholder="Search area…"
            autoComplete="off"
            aria-label="Search locations"
            className="h-9 w-full rounded border border-[#01514E] bg-[#f7f7f5] py-1 pl-9 pr-2 text-xs text-[#1f1d1b] placeholder:text-[#1f1d1b]/45 focus:border-[#01514E] focus:outline-none focus:ring-1 focus:ring-[#01514E]/30"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-[#01514E]/70">Popular Locations</p>
        <div className="mt-1.5 max-h-[200px] space-y-0.5 overflow-y-auto text-xs">
          {filteredPopularAreas.length === 0 ? (
            <p className="px-1.5 py-1 text-[11px] text-[#1f1d1b]/50">No matches in popular areas</p>
          ) : (
            filteredPopularAreas.map((area) => {
              const selected = isAreaSelected(selectedArea, area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => onSelectArea(area)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left text-[#1f1d1b] hover:bg-[#01514E]/10",
                    selected && "bg-[#01514E]/12",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px]",
                      selected
                        ? "border-[#01514E] bg-[#01514E] text-white"
                        : "border-[#01514E]/35 bg-transparent text-transparent",
                    )}
                    aria-hidden
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 whitespace-normal leading-snug">{area}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#01514E]">Property Locations</p>
        <div className="mt-1.5 max-h-[240px] space-y-1 overflow-y-auto">
          {filteredPropertyAreas.length === 0 ? (
            <p className="rounded px-2 py-1.5 text-[11px] text-[#1f1d1b]/50">No matches in property locations</p>
          ) : (
            filteredPropertyAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => onSelectArea(area)}
                className={`w-full rounded px-2 py-1.5 text-left text-xs leading-snug ${
                  isAreaSelected(selectedArea, area)
                    ? "bg-[#01514E] text-white"
                    : "bg-[#e6efee] text-[#1f1d1b] hover:bg-[#d7e6e4]"
                }`}
              >
                <span className="block whitespace-normal">{area}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <BaliAreaMap selectedArea={selectedArea} onSelectArea={onSelectArea} />
    </div>
  );
}
