import { useId } from "react";
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
import { cn } from "@/lib/utils";

type BaliAreaMapProps = {
  selectedArea: string;
  className?: string;
};

export function BaliAreaMap({ selectedArea, className }: BaliAreaMapProps) {
  const clipId = `bali-map-clip-${useId().replace(/:/g, "")}`;
  const mapActive = activeBaliMapRegions(selectedArea);

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
        aria-hidden
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
  );
}
