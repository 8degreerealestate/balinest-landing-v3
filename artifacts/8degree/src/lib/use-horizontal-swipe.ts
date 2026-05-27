import { useCallback, useRef } from "react";

type SwipeHandlers = {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: () => void;
};

/**
 * Horizontal swipe on touch devices (e.g. hero gallery on property pages).
 * Swipe left → next; swipe right → previous.
 */
export function useHorizontalSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  options?: { minDistance?: number },
): { handlers: SwipeHandlers; shouldIgnoreClick: () => boolean } {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const minDistance = options?.minDistance ?? 48;

  const handlers: SwipeHandlers = {
    onTouchStart(e) {
      swiped.current = false;
      const t = e.touches[0];
      if (!t) return;
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd(e) {
      if (!start.current) return;
      const t = e.changedTouches[0];
      if (!t) {
        start.current = null;
        return;
      }
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) < minDistance || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      swiped.current = true;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
    onTouchCancel() {
      start.current = null;
    },
  };

  const shouldIgnoreClick = useCallback(() => {
    if (!swiped.current) return false;
    swiped.current = false;
    return true;
  }, []);

  return { handlers, shouldIgnoreClick };
}
