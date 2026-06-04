import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AreaSearchMenuPanel } from "@/components/site/AreaSearchMenuPanel";

type AreaSearchMenuDropdownProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  selectedArea: string;
  areaLocationSearch: string;
  onAreaLocationSearchChange: (value: string) => void;
  onSelectArea: (area: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
};

export function AreaSearchMenuDropdown({
  open,
  onClose,
  triggerRef,
  selectedArea,
  areaLocationSearch,
  onAreaLocationSearchChange,
  onSelectArea,
  searchInputRef,
}: AreaSearchMenuDropdownProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(780, window.innerWidth - 16);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    setPosition({ top: rect.bottom + 8, left, width });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => updatePosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onClose, triggerRef]);

  if (!open || !position || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed"
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      <AreaSearchMenuPanel
        selectedArea={selectedArea}
        areaLocationSearch={areaLocationSearch}
        onAreaLocationSearchChange={onAreaLocationSearchChange}
        onSelectArea={(area) => {
          onSelectArea(area);
          onClose();
        }}
        searchInputRef={searchInputRef}
      />
    </div>,
    document.body,
  );
}
