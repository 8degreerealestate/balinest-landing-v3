/**
 * Homepage “Highlighted listings” cards — edit this file with your real listings.
 *
 * Switch data source in `HOME_FEATURED_LISTINGS_MODE` below:
 * - `"template"` — always uses the array below (good for design / before inventory API is ready).
 * - `"api"` — loads from your inventory API (Google Sheet). Never shows DEMO rows below.
 */

export const HOME_FEATURED_LISTINGS_MODE = "api" as "template" | "api";

export type HomeFeaturedListingTemplate = {
  /** Stable id for React keys */
  id: string;
  /** Property reference shown on the card (e.g. OPUM016) */
  code: string;
  /** Link when the card is clicked — use `/property/{code}` when the listing exists in CRM */
  href: string;
  title: string;
  /** Main photo URL */
  imageUrl: string;
  location: string;
  priceDisplay: string;
  ownership: string;
  bedrooms: string;
  buildingSqm?: string;
  landSqm?: string;
  /** e.g. "30 Years", or omit / null for "—" */
  leaseYears?: string | null;
  /** Homepage sort priority — not the EXCLUSIVE badge. */
  featured?: boolean;
  /** EXCLUSIVE badge + green card (only when legally accurate). */
  showExclusive?: boolean;
  category?: "Residential" | "Investment";
  /** Bottom-right photo badge: Ready, Off-plan, Great deal, or omit. */
  statusBadge?: string | null;
};

/**
 * Replace these rows with your real listings (homepage highlighted strip shows 6 when mode is `"template"`).
 * Optional fields can be removed if unknown.
 */
export const HOME_FEATURED_LISTINGS_TEMPLATE: HomeFeaturedListingTemplate[] = [
  {
    id: "tpl-1",
    code: "DEMO-001",
    href: "/projects",
    title: "6 Bedroom Villa in Umalas with Modern Luxury Tropical Design",
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    location: "Umalas",
    priceDisplay: "USD 2,450,000",
    ownership: "Leasehold",
    bedrooms: "6",
    buildingSqm: "450",
    landSqm: "700",
    leaseYears: "30 Years",
    featured: true,
    category: "Residential",
    statusBadge: null,
  },
  {
    id: "tpl-2",
    code: "DEMO-002",
    href: "/projects",
    title: "Ocean-View Estate in Uluwatu with Infinity Pool",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    location: "Uluwatu",
    priceDisplay: "USD 3,200,000",
    ownership: "Freehold",
    bedrooms: "5",
    buildingSqm: "520",
    landSqm: "850",
    leaseYears: null,
    featured: true,
    category: "Investment",
    statusBadge: null,
  },
  {
    id: "tpl-3",
    code: "DEMO-003",
    href: "/projects",
    title: "Designer Villa Walking Distance to Pererenan Beach",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    location: "Pererenan",
    priceDisplay: "USD 1,890,000",
    ownership: "Leasehold",
    bedrooms: "4",
    buildingSqm: "380",
    landSqm: "550",
    leaseYears: "25 Years",
    featured: false,
    category: "Residential",
    statusBadge: "Ready",
  },
  {
    id: "tpl-4",
    code: "DEMO-004",
    href: "/projects",
    title: "Riverside Retreat in Ubud with Rice Field Views",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    location: "Ubud",
    priceDisplay: "USD 1,275,000",
    ownership: "Leasehold",
    bedrooms: "3",
    buildingSqm: "280",
    landSqm: "600",
    leaseYears: "20 Years",
    featured: false,
    category: "Investment",
    statusBadge: "Ready",
  },
  {
    id: "tpl-5",
    code: "DEMO-005",
    href: "/projects",
    title: "Berawa Contemporary Villa Near Finns Beach Club",
    imageUrl:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    location: "Canggu",
    priceDisplay: "USD 2,100,000",
    ownership: "Freehold",
    bedrooms: "4",
    buildingSqm: "410",
    landSqm: "480",
    leaseYears: null,
    featured: false,
    category: "Residential",
    statusBadge: "Ready",
  },
  {
    id: "tpl-6",
    code: "DEMO-006",
    href: "/projects",
    title: "Cliff-Front Development Plot with Concept Plans",
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    location: "Tabanan",
    priceDisplay: "USD 890,000",
    ownership: "Leasehold",
    bedrooms: "—",
    buildingSqm: "—",
    landSqm: "1200",
    leaseYears: "28 Years",
    featured: false,
    category: "Investment",
    statusBadge: "Ready",
  },
  {
    id: "tpl-7",
    code: "DEMO-007",
    href: "/projects",
    title: "Minimalist Villa with Rice Terrace Views in Seseh",
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    location: "Seseh",
    priceDisplay: "USD 1,650,000",
    ownership: "Leasehold",
    bedrooms: "4",
    buildingSqm: "340",
    landSqm: "520",
    leaseYears: "22 Years",
    featured: false,
    category: "Residential",
    statusBadge: "Ready",
  },
  {
    id: "tpl-8",
    code: "DEMO-008",
    href: "/projects",
    title: "Luxury Compound with Guest Villas in Jimbaran",
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    location: "Jimbaran",
    priceDisplay: "USD 4,800,000",
    ownership: "Freehold",
    bedrooms: "7",
    buildingSqm: "680",
    landSqm: "1100",
    leaseYears: null,
    featured: true,
    category: "Residential",
    statusBadge: null,
  },
  {
    id: "tpl-9",
    code: "DEMO-009",
    href: "/projects",
    title: "Off-Plan Boutique Apartments Near Echo Beach",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    location: "Canggu",
    priceDisplay: "USD 425,000",
    ownership: "Leasehold",
    bedrooms: "2",
    buildingSqm: "95",
    landSqm: "—",
    leaseYears: "30 Years",
    featured: false,
    category: "Investment",
    statusBadge: "Ready",
  },
];
