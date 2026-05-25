/**
 * Local marketing assets (downloaded from Google Drive).
 * Source Drive folder IDs are preserved in scripts/fetch-site-media-from-drive.sh.
 *
 * Hero assets
 *   hero-cinematic.mp4  ← Drive ID 10sSFDovjSw_krEVU918oNqNQPrWVFX9z
 *   hero-still.jpg      ← Drive ID 1qaXnGteqT0MRHOCrCILtQmEh3wRI42_x
 *   hero-poster.jpg     ← Drive ID 1ub5eDDyyhD6lKjTNd5IfHXgd8G-0jqi-
 *
 * Team photos     ← Drive folder 1y_5qRH398Jexl7ccmWx_63lQ7jSXxePb
 * Area images     ← Drive folder 1_XsNdvz-ip0KqnLnecHdyxNDQFlE84Dp
 * Buyer's Agent page (`public/site-media/`)
 *   buyer-agent-hero.jpg
 *   buyer-agent-intro-interior.png
 *   buyer-agent-dining.jpg
 *   buyer-agent-villa-exterior.png
 *   buyer-agent-kitchen.png
 *
 * Seller's Agent page (`public/site-media/`)
 *   seller-agent-hero.png
 */

export const SITE_MEDIA = {
  heroVideo: "/site-media/hero-cinematic.mp4",
  heroPoster: "/site-media/hero-poster.jpg",
  heroStill: "/site-media/hero-still.jpg",
  topArea: "/site-media/area-canggu.jpg",
  /** Navbar Guides mega menu hero (left column). */
  guidesDropdown: "/site-media/guides-dropdown-hero.png",

  team: [
    { src: "/site-media/team-robert.jpg",   name: "Robert",   role: "CEO" },
    { src: "/site-media/team-stephen.jpg",  name: "Stephen",  role: "Listing Agent" },
    { src: "/site-media/team-maya.jpg",     name: "Maya",     role: "Property Adviser" },
    { src: "/site-media/team-ryan.jpg",     name: "Ryan",     role: "Marketing Manager" },
    { src: "/site-media/team-mariam.jpg",   name: "Mariam",   role: "Business Office Manager" },
    { src: "/site-media/team-yohanes.jpg",  name: "Yohanes",  role: "Executive Sales Advisor" },
    { src: "/site-media/team-kinan.jpg",    name: "Kinan",    role: "Social Media Manager" },
    { src: "/site-media/team-rangga.jpg",   name: "Rangga",   role: "Photographer & Graphic Designer" },
    { src: "/site-media/team-charis.jpg",   name: "Charis",   role: "Videographer" },
  ] as const,

  areas: [
    { src: "/site-media/area-canggu.jpg",    label: "Canggu" },
    { src: "/site-media/area-cemagi.jpg",    label: "Cemagi" },
    { src: "/site-media/area-jimbaran.jpg",  label: "Jimbaran" },
    { src: "/site-media/area-kuta.jpg",      label: "Kuta" },
    { src: "/site-media/area-nusa-dua.jpg",  label: "Nusa Dua" },
    { src: "/site-media/area-seminyak.jpg",  label: "Seminyak" },
    { src: "/site-media/area-tabanan.jpg",   label: "Tabanan" },
    { src: "/site-media/area-ubud.jpg",      label: "Ubud" },
    { src: "/site-media/area-uluwatu.jpg",   label: "Uluwatu" },
  ] as const,

  /**
   * Buyer's Agent landing page (`/buyer-agents`).
   * Export filenames from your Google Doc bundle into `public/site-media/`.
   * Until files exist, the page falls back to hero/area stills.
   */
  buyerAgentHero: "/site-media/buyer-agent-hero.jpg",
  buyerAgentIntroInterior: "/site-media/buyer-agent-intro-interior.png",
  buyerAgentDining: "/site-media/buyer-agent-dining.jpg",
  buyerAgentVillaExterior: "/site-media/buyer-agent-villa-exterior.png",
  buyerAgentKitchen: "/site-media/buyer-agent-kitchen.png",

  /** Seller's Agent landing (`/seller-agents`). */
  sellerAgentHero: "/site-media/seller-agent-hero.png",

  /** Legal Guide hero (`/legal-guide`). */
  legalGuideHero: "/site-media/legal-guide-hero.png",
  /** Legal Guide intro panel (lead image under hero). */
  legalGuideIntro: "/site-media/legal-guide-intro.png",
  /** Legal Guide §03 — building permits. */
  legalGuideBuildingPermits: "/site-media/legal-guide-building-permits.png",
  /** Legal Guide §09 — full-width coastal panorama (1024×309, ~822:248). */
  legalGuidePanorama: "/site-media/legal-guide-panorama.jpg",

  /** Investment guide hero (`/investment-guide`). */
  investHero: "/site-media/investment-guide-hero.png",
  /** Invest landing hero (`/invest`). */
  investIncHero: "/site-media/invest-inc-hero.png",
  /** Invest — lifestyle market section. */
  investMarket: "/site-media/invest-market.jpg",
  /** Invest — returns example villa (§2). */
  investReturns: "/site-media/invest-returns.jpg",
  /** Invest — advisory meeting banner (display ~802×322). */
  investMeeting: "/site-media/invest-meeting.jpg",
  /** Invest — 3 main investment strategies cards. */
  investStrategyIncome: "/site-media/invest-strategy-income.jpg",
  investStrategyLifestyle: "/site-media/invest-strategy-lifestyle.jpg",
  investStrategyGrowth: "/site-media/invest-strategy-growth.jpg",
  /** Invest — common mistakes section. */
  investMistakes: "/site-media/invest-mistakes.jpg",
  /** Invest — wide lifestyle panorama strip (display ~804×114). */
  investPanorama: "/site-media/invest-panorama.jpg",
} as const;
