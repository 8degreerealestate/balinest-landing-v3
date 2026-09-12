import { useId } from "react";
import {
  activeBaliMapRegions,
  BALI_HIGHLIGHT_BOXES,
  BALI_ISLAND_PATH_D,
  BALI_MAP_BASE_FILL,
  BALI_MAP_BASE_STROKE,
  BALI_MAP_BRAND,
  BALI_MAP_REGION_AREA,
  BALI_MAP_VIEW,
  baliHighlightRectPath,
} from "@/lib/bali-area-map";
import { cn } from "@/lib/utils";

type BaliAreaMapProps = {
  selectedArea: string;
  onSelectArea?: (area: string) => void;
  className?: string;
};

export function BaliAreaMap({ selectedArea, onSelectArea, className }: BaliAreaMapProps) {
  const clipId = `bali-map-clip-${useId().replace(/:/g, "")}`;
  const mapActive = activeBaliMapRegions(selectedArea);
  const interactive = typeof onSelectArea === "function";

  return (
    <div
      className={cn(
        "relative min-h-[220px] overflow-hidden rounded border border-[#01514E]/15 bg-[#e8eceb] md:min-h-[260px]",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${BALI_MAP_VIEW.w} ${BALI_MAP_VIEW.h}`}
        className="h-full w-full min-h-[240px]"
        role={interactive ? "img" : undefined}
        aria-label={interactive ? "Bali map — click a region to filter" : undefined}
        aria-hidden={interactive ? undefined : true}
      >
        <title>Bali map</title>
        <defs>
          <clipPath id={clipId}>
            <path d={BALI_ISLAND_PATH_D} />
          </clipPath>
        </defs>
        <path fill={BALI_MAP_BASE_FILL} stroke={BALI_MAP_BASE_STROKE} strokeWidth="1" d={BALI_ISLAND_PATH_D} />
        <g clipPath={`url(#${clipId})`}>
          {(Object.keys(BALI_HIGHLIGHT_BOXES) as string[]).map((regionId) => {
            const [w, s, e, n] = BALI_HIGHLIGHT_BOXES[regionId];
            const on = mapActive.has(regionId);
            const areaLabel = BALI_MAP_REGION_AREA[regionId];
            return (
              <path
                key={regionId}
                d={baliHighlightRectPath(w, s, e, n)}
                fill={on ? BALI_MAP_BRAND : interactive ? BALI_MAP_BRAND : "transparent"}
                fillOpacity={on ? 0.9 : interactive ? 1 : 0}
                className={interactive ? "cursor-pointer outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100" : undefined}
                style={
                  interactive && !on
                    ? { opacity: 0.12 }
                    : undefined
                }
                role={interactive && areaLabel ? "button" : undefined}
                tabIndex={interactive && areaLabel ? 0 : undefined}
                aria-label={areaLabel ? `Select ${areaLabel}` : undefined}
                onClick={
                  interactive && areaLabel
                    ? () => onSelectArea(on && selectedArea === areaLabel ? "Area" : areaLabel)
                    : undefined
                }
                onKeyDown={
                  interactive && areaLabel
                    ? (event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        onSelectArea(on && selectedArea === areaLabel ? "Area" : areaLabel);
                      }
                    : undefined
                }
              />
            );
          })}
        </g>
        <path fill="none" stroke={BALI_MAP_BASE_STROKE} strokeWidth="1" d={BALI_ISLAND_PATH_D} />
      </svg>
      {interactive ? (
        <p className="pointer-events-none absolute bottom-2 left-2 right-2 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[#01514E]/70">
          Tap map to choose area
        </p>
      ) : null}
    </div>
  );
}
