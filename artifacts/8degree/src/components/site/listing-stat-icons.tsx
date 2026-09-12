import type { CSSProperties } from "react";

export type ListingStatIconName =
  | "bed"
  | "bath"
  | "land"
  | "building"
  | "tenure"
  | "calendar"
  | "pin"
  | "price"
  | "stairs"
  | "zoning"
  | "sofa";

/** Shared property-stat icons (listing detail grid + listing cards). */
export function ListingStatIcon({
  name,
  size = 28,
  className,
  style,
}: {
  name: ListingStatIconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "bed":
      return (
        <svg {...common}>
          <path d="M3 18v-5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5" />
          <path d="M3 18v2M21 18v2M3 14h18" />
          <rect x="7" y="10.5" width="4" height="2" rx="0.5" />
        </svg>
      );
    case "bath":
      return (
        <svg {...common}>
          <path d="M5 12V6a2 2 0 0 1 4 0v.5" />
          <circle cx="9" cy="8" r="1.4" />
          <path d="M3 12h18" />
          <path d="M5 12v2a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-2" />
          <path d="M7 18l-1 3M17 18l1 3" />
        </svg>
      );
    case "land":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <path d="M8 4v3M16 4v3M4 8h3M4 16h3M17 17l3 3" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9" />
          <path d="M3 11l9-7 9 7" />
          <path d="M10 21v-5h4v5" />
        </svg>
      );
    case "tenure":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 3v4M16 3v4" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "price":
      return (
        <svg {...common}>
          <path d="M12 2v20" />
          <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "stairs":
      return (
        <svg {...common}>
          <path d="M3 21h4v-4h4v-4h4v-4h4v-4h2" />
          <path d="M3 21v-1" />
        </svg>
      );
    case "zoning":
      return (
        <svg {...common}>
          <path d="M12 3l-5 7h3v4h-2l-3 5h14l-3-5h-2v-4h3z" />
          <line x1="12" y1="19" x2="12" y2="21" />
        </svg>
      );
    case "sofa":
      return (
        <svg {...common}>
          <path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4H4z" />
          <path d="M4 13V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <path d="M7 11V8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
          <path d="M4 17v2M20 17v2" />
        </svg>
      );
  }
}
