import type { RefObject } from "react";
import { Search } from "lucide-react";
import { BaliAreaMap } from "@/components/site/BaliAreaMap";

const POPULAR_AREA_NAMES = ["Uluwatu", "Melasti", "Bingin", "Pecatu", "Pandawa", "Ungasan", "Padang Padang"] as const;
const PROPERTY_AREA_NAMES = ["Uluwatu", "Canggu", "Umalas", "Pererenan", "Others", "Seminyak", "Ubud", "Tabanan"] as const;

export function filterAreaNames(names: readonly string[], query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...names];
  return names.filter((name) => name.toLowerCase().includes(needle));
}

export const AREA_SEARCH_MENU_PANEL_CLASS =
  "z-[200] grid w-[min(92vw,780px)] max-w-[calc(100vw-1rem)] grid-cols-1 gap-2 rounded border border-[#01514E]/25 bg-[#f7f5f1] p-2.5 shadow-xl sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.45fr)]";

type AreaSearchMenuPanelProps = {
  selectedArea: string;
  areaLocationSearch: string;
  onAreaLocationSearchChange: (value: string) => void;
  onSelectArea: (area: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
};

export function AreaSearchMenuPanel({
  selectedArea,
  areaLocationSearch,
  onAreaLocationSearchChange,
  onSelectArea,
  searchInputRef,
  className,
}: AreaSearchMenuPanelProps) {
  const filteredPopularAreas = filterAreaNames(POPULAR_AREA_NAMES, areaLocationSearch);
  const filteredPropertyAreas = filterAreaNames(PROPERTY_AREA_NAMES, areaLocationSearch);

  return (
    <div className={className ?? AREA_SEARCH_MENU_PANEL_CLASS}>
      <div>
        <p className="text-xs font-semibold text-[#01514E]">Search Locations</p>
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
            filteredPopularAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => onSelectArea(area)}
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
        <div className="mt-1.5 max-h-[200px] space-y-1 overflow-y-auto">
          {filteredPropertyAreas.length === 0 ? (
            <p className="rounded px-2 py-1.5 text-[11px] text-[#1f1d1b]/50">No matches in property locations</p>
          ) : (
            filteredPropertyAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => onSelectArea(area)}
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

      <BaliAreaMap selectedArea={selectedArea} />
    </div>
  );
}
