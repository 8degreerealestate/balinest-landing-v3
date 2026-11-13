import { useCallback, useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 280;
const SWIPE_MIN_DISTANCE = 48;

type Point = { x: number; y: number };
type Transform = { scale: number; x: number; y: number };

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

function distance(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function midpoint(a: Touch, b: Touch): Point {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type ZoomableLightboxImageProps = {
  src: string;
  alt: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onBackdropTap: () => void;
  onZoomChange?: (zoomed: boolean) => void;
  onError?: () => void;
};

/**
 * Lightbox photo that always fits the same frame (independent of source
 * resolution) with pinch-zoom, double-tap zoom, drag-to-pan, and swipe
 * navigation when not zoomed.
 */
export function ZoomableLightboxImage({
  src,
  alt,
  onSwipeLeft,
  onSwipeRight,
  onBackdropTap,
  onZoomChange,
  onError,
}: ZoomableLightboxImageProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const [animating, setAnimating] = useState(false);
  const transformRef = useRef<Transform>(IDENTITY);

  const gesture = useRef<{
    mode: "none" | "pan" | "pinch" | "swipe";
    start: Point;
    startTransform: Transform;
    startDistance: number;
    startMid: Point;
    moved: boolean;
  }>({
    mode: "none",
    start: { x: 0, y: 0 },
    startTransform: IDENTITY,
    startDistance: 0,
    startMid: { x: 0, y: 0 },
    moved: false,
  });
  const lastTap = useRef<{ time: number; point: Point } | null>(null);

  const apply = useCallback(
    (next: Transform, animate = false) => {
      const frame = frameRef.current;
      let { scale, x, y } = next;
      scale = clamp(scale, MIN_SCALE, MAX_SCALE);
      if (frame && scale > 1) {
        const maxX = (frame.clientWidth * (scale - 1)) / 2;
        const maxY = (frame.clientHeight * (scale - 1)) / 2;
        x = clamp(x, -maxX, maxX);
        y = clamp(y, -maxY, maxY);
      } else {
        x = 0;
        y = 0;
      }
      const clamped = { scale, x, y };
      transformRef.current = clamped;
      setAnimating(animate);
      setTransform(clamped);
    },
    [],
  );

  useEffect(() => {
    transformRef.current = IDENTITY;
    setAnimating(false);
    setTransform(IDENTITY);
  }, [src]);

  useEffect(() => {
    onZoomChange?.(transform.scale > 1.01);
  }, [transform.scale, onZoomChange]);

  /** Zoom so the point under the finger stays put. */
  const zoomAt = useCallback(
    (targetScale: number, client: Point, base: Transform, animate: boolean) => {
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const ox = client.x - (rect.left + rect.width / 2);
      const oy = client.y - (rect.top + rect.height / 2);
      const ratio = targetScale / base.scale;
      apply(
        {
          scale: targetScale,
          x: ox - (ox - base.x) * ratio,
          y: oy - (oy - base.y) * ratio,
        },
        animate,
      );
    },
    [apply],
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const onTouchStart = (e: TouchEvent) => {
      const g = gesture.current;
      g.moved = false;
      g.startTransform = transformRef.current;
      if (e.touches.length >= 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        g.mode = "pinch";
        g.startDistance = distance(a, b);
        g.startMid = midpoint(a, b);
        e.preventDefault();
        return;
      }
      const t = e.touches[0];
      if (!t) return;
      g.start = { x: t.clientX, y: t.clientY };
      g.mode = transformRef.current.scale > 1.01 ? "pan" : "swipe";
    };

    const onTouchMove = (e: TouchEvent) => {
      const g = gesture.current;
      if (g.mode === "pinch" && e.touches.length >= 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const nextScale = clamp(
          g.startTransform.scale * (distance(a, b) / Math.max(g.startDistance, 1)),
          MIN_SCALE * 0.85,
          MAX_SCALE * 1.15,
        );
        const mid = midpoint(a, b);
        const frameEl = frameRef.current;
        if (!frameEl) return;
        const rect = frameEl.getBoundingClientRect();
        const ox = g.startMid.x - (rect.left + rect.width / 2);
        const oy = g.startMid.y - (rect.top + rect.height / 2);
        const ratio = nextScale / g.startTransform.scale;
        const next = {
          scale: nextScale,
          x: ox - (ox - g.startTransform.x) * ratio + (mid.x - g.startMid.x),
          y: oy - (oy - g.startTransform.y) * ratio + (mid.y - g.startMid.y),
        };
        transformRef.current = next;
        setAnimating(false);
        setTransform(next);
        g.moved = true;
        return;
      }
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - g.start.x;
      const dy = t.clientY - g.start.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.moved = true;
      if (g.mode === "pan") {
        e.preventDefault();
        apply({
          scale: g.startTransform.scale,
          x: g.startTransform.x + dx,
          y: g.startTransform.y + dy,
        });
      } else if (g.mode === "swipe" && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gesture.current;
      const t = e.changedTouches[0];

      if (g.mode === "pinch") {
        if (e.touches.length === 1) {
          // One finger lifted mid-pinch — continue as a pan from here.
          const rest = e.touches[0];
          g.mode = transformRef.current.scale > 1.01 ? "pan" : "none";
          g.start = { x: rest.clientX, y: rest.clientY };
          g.startTransform = transformRef.current;
          return;
        }
        g.mode = "none";
        apply(transformRef.current, true);
        return;
      }

      if (g.mode === "swipe" && t) {
        const dx = t.clientX - g.start.x;
        const dy = t.clientY - g.start.y;
        if (Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.25) {
          g.mode = "none";
          if (dx < 0) onSwipeLeft();
          else onSwipeRight();
          return;
        }
      }

      if (!g.moved && t) {
        const now = Date.now();
        const point = { x: t.clientX, y: t.clientY };
        const prev = lastTap.current;
        if (prev && now - prev.time < DOUBLE_TAP_MS && Math.hypot(point.x - prev.point.x, point.y - prev.point.y) < 40) {
          lastTap.current = null;
          e.preventDefault();
          if (transformRef.current.scale > 1.01) apply(IDENTITY, true);
          else zoomAt(DOUBLE_TAP_SCALE, point, transformRef.current, true);
        } else {
          lastTap.current = { time: now, point };
        }
      }
      g.mode = "none";
    };

    // Non-passive so we can preventDefault and own pinch/pan inside the frame.
    frame.addEventListener("touchstart", onTouchStart, { passive: false });
    frame.addEventListener("touchmove", onTouchMove, { passive: false });
    frame.addEventListener("touchend", onTouchEnd, { passive: false });
    frame.addEventListener("touchcancel", onTouchEnd, { passive: false });
    return () => {
      frame.removeEventListener("touchstart", onTouchStart);
      frame.removeEventListener("touchmove", onTouchMove);
      frame.removeEventListener("touchend", onTouchEnd);
      frame.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [apply, zoomAt, onSwipeLeft, onSwipeRight]);

  const zoomed = transform.scale > 1.01;

  return (
    <div
      ref={frameRef}
      className="relative h-full w-full overflow-hidden"
      style={{ touchAction: "none", cursor: zoomed ? "grab" : "zoom-in" }}
      onClick={(e) => {
        // Desktop: tap outside the photo closes; handled by parent for touch.
        if (e.target === e.currentTarget && !zoomed) onBackdropTap();
      }}
      onDoubleClick={(e) => {
        if (zoomed) apply(IDENTITY, true);
        else zoomAt(DOUBLE_TAP_SCALE, { x: e.clientX, y: e.clientY }, transformRef.current, true);
      }}
      onWheel={(e) => {
        if (!e.ctrlKey && !zoomed) return;
        e.preventDefault();
        const next = transformRef.current.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15);
        zoomAt(clamp(next, MIN_SCALE, MAX_SCALE), { x: e.clientX, y: e.clientY }, transformRef.current, false);
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onError={onError}
        className="absolute inset-0 h-full w-full select-none object-contain"
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          transformOrigin: "center center",
          transition: animating ? "transform 220ms ease-out" : "none",
          willChange: "transform",
        }}
      />
    </div>
  );
}
