import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { SITE_MEDIA } from "@/lib/site-assets";
import { truncateForMeta } from "@/lib/site-seo";
import { LEGAL_GUIDE_UI } from "@/lib/legal-guide-ui";
import { useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/lib/utils";

function HeroImage({ className, alt }: { className?: string; alt: string }) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <img
      src={useFallback ? SITE_MEDIA.heroStill : SITE_MEDIA.legalGuideHero}
      alt={alt}
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

const CREAM = "bg-[#fdfbf7]";
const DARK = "bg-[#0d4542]";
const GUIDE_GREEN = "bg-[#eef6e0]";
const GUIDE_GREEN_PANEL = "bg-[#dcefc4]";
const DARK_PANEL = "bg-[#104e4b]";
const BRAND = "text-[#01514E]";

const LAND_TITLE_ROWS = [
  {
    title: "Hak Milik",
    subtitle: "Freehold",
    description:
      "full ownership, available only to Indonesian citizens. Foreigners cannot hold this title directly.",
  },
  {
    title: "Hak Guna Bangunan",
    subtitle: "HGB / Right to Build",
    description:
      "grants the right to construct and own buildings for a defined period (typically 30 years + extensions). Foreign investors access HGB through a PT PMA.",
  },
  {
    title: "Hak Pakai",
    subtitle: "Right to Use",
    description:
      "allows foreign nationals with residency permits to hold residential property. Renewable for up to 80 years total.",
  },
  {
    title: "Hak Sewa",
    subtitle: "Leasehold",
    description:
      "contractual usage rights for a set period (commonly 25–30 years with extensions). The most widely used structure for foreign villa investors.",
  },
] as const;

const BPN_VERIFY_STEPS = [
  {
    num: "01",
    title: "Request a BPN verification letter",
    description:
      "This confirms the certificate is authentic, currently registered, and identifies the legal owner.",
  },
  {
    num: "02",
    title: "Cross-reference boundaries",
    description: "Confirm that the measurements on the certificate match the physical site through a survey.",
  },
  {
    num: "03",
    title: "Check for encumbrances",
    description: "Verify that no mortgages, liens, disputes, or legal holds are recorded against the title.",
  },
  {
    num: "04",
    title: "Confirm the certificate is original",
    description:
      "Insist on sighting the original certificate, not a photocopy. Legitimate sellers will always allow this.",
  },
] as const;

const ZONING_ZONES = [
  {
    barClass: "bg-[#e8a4b8]",
    label: "Pink Zone",
    subtitle: "Tourism / Zona Pariwisata",
    description:
      "Permits commercial tourism operations including rental villas, hotels, resorts, and hospitality developments. This is the zone you need for short-term rental operations.",
  },
  {
    barClass: "bg-[#e8d47a]",
    label: "Yellow Zone",
    subtitle: "Residential",
    description:
      "Permits private residences but may restrict or prohibit commercial short-term rental activity. Suitable for personal homes but may limit income potential.",
  },
  {
    barClass: "bg-[#d48484]",
    label: "Red Zone",
    subtitle: "Commercial",
    description:
      "Permits business operations including offices, retail, restaurants, and large-scale commercial developments.",
  },
  {
    barClass: "bg-[#8fbc8f]",
    label: "Green Zone",
    subtitle: "Agriculture / Conservation",
    description:
      "Highly restricted development. Limited to agricultural structures and approved ecotourism under strict conditions. Investing in green zones carries high risk — we have seen projects shut down due to zoning violations.",
  },
] as const;

const BUILDING_PERMIT_CHECKS = [
  "The permit was issued for the specific property in question (matching the land certificate)",
  "The structure as built matches the approved building plans (floor area, height, setbacks, number of storeys)",
  "The permit has not expired or been revoked",
  "An SLF (Sertifikat Laik Fungsi / Building Worthiness Certificate) has been obtained where required",
] as const;

const OWNERSHIP_HISTORY_ITEMS = [
  {
    title: "Chain of ownership",
    description:
      "How the property has changed hands over time, and whether each transfer was properly documented and registered",
  },
  {
    title: "Customary (adat) land claims",
    description:
      "In Bali, some land has historical ties to local village communities (banjar or desa adat). Even if a formal certificate exists, unresolved adat claims can create serious complications. This is particularly important in rapidly developing areas where agricultural land has been converted",
  },
  {
    title: "Inheritance or family disputes",
    description:
      "Properties inherited through families may have multiple claimants. All rightful parties must have consented to the sale",
  },
  {
    title: "Previous lease agreements",
    description:
      "If the land is under an existing leasehold, the remaining duration and terms of that lease directly affect your rights",
  },
] as const;

const SITE_INSPECTION_ITEMS = [
  {
    title: "Boundary verification",
    description:
      "Confirm that physical boundaries match the certificate measurements. Discrepancies are not uncommon in Bali and should be resolved before purchase.",
  },
  {
    title: "Road access",
    description:
      "Verify that the property has a legal right of way. Some properties are accessible only through private land or narrow village paths, which affects both usability and resale.",
  },
  {
    title: "Environmental considerations",
    description:
      "Check for flood risk, proximity to rivers or ravines, soil stability, and any environmental protection zones.",
  },
  {
    title: "Infrastructure and utilities",
    description:
      "Confirm access to electricity (PLN), water supply (PDAM or well), and internet connectivity. Availability varies significantly between areas.",
  },
  {
    title: "Neighbouring developments",
    description:
      "Understand what is being built or planned nearby. A villa with an ocean view today could face obstruction from a neighbouring development tomorrow.",
  },
  {
    title: "Structural assessment",
    description:
      "For existing buildings, particularly older properties, engage a qualified building inspector or architect to assess construction quality, materials, and any remediation needed.",
  },
] as const;

const TAX_OBLIGATION_ROWS = [
  {
    tax: "Buyer's tax (BPHTB)",
    rate: "5% of declared value",
    who: "Buyer",
    notes: "Applicable to Hak Pakai and HGB transfers",
  },
  {
    tax: "Seller's tax (PPh)",
    rate: "2.5% of declared value",
    who: "Seller",
    notes: "Often a factor in price negotiation",
  },
  {
    tax: "Leasehold tax",
    rate: "10% of declared lease value",
    who: "Lessor (landowner)",
    notes: "Economic allocation often negotiated between parties",
  },
  {
    tax: "Notary / PPAT fees",
    rate: "~1% of transaction value",
    who: "Buyer (typically)",
    notes: "Covers deed, tax processing, registration",
  },
  {
    tax: "Annual property tax (PBB)",
    rate: "Varies",
    who: "Owner",
    notes: "Based on property size, location, assessed value; generally low",
  },
  {
    tax: "Rental income tax",
    rate: "Applicable rates",
    who: "Owner / PT PMA",
    notes: "Via corporate income tax for PT PMA structures",
  },
] as const;

const PROFESSIONALS_ITEMS: { title: string; description: ReactNode }[] = [
  {
    title: "PPAT Notary",
    description:
      "Handles the legal deed of transfer, title registration, and tax processing. Ensure your notary holds valid PPAT credentials.",
  },
  {
    title: "Property Lawyer",
    description: (
      <>
        Reviews all contracts, conducts title searches, and represents your interests. Critically, your lawyer should be{" "}
        <em>independent from the seller</em>.
      </>
    ),
  },
  {
    title: "Real Estate Agent (Buyer's Agent)",
    description:
      "Works exclusively in your interest, evaluating properties, negotiating terms, and coordinating the due diligence process. An agency with AREBI-LSP licensing offers professional accountability.",
  },
  {
    title: "Building Inspector / Architect",
    description:
      "for existing structures, an independent assessment of construction quality and permit compliance.",
  },
];

/** Panorama strip — matches design reference (~822×248 display ratio). */
const LEGAL_GUIDE_PANORAMA_WIDTH = 1024;
const LEGAL_GUIDE_PANORAMA_HEIGHT = 309;

const RED_FLAG_ITEMS = [
  {
    num: "01",
    title: "The seller refuses independent title verification.",
    description:
      "Any legitimate seller will allow your notary to verify the certificate directly with BPN. Refusal is a serious red flag.",
  },
  {
    num: "02",
    title: "You are shown only photocopies of the certificate",
    description:
      "Always insist on sighting the original land certificate. Photocopies may be of an outdated, disputed, or fraudulent document.",
  },
  {
    num: "03",
    title: "The seller pressures you to skip or accelerate due diligence",
    description:
      'Statements like "another buyer is ready" or "we need to close this week" are pressure tactics. Thorough due diligence takes 3–5 weeks — legitimate sellers understand this.',
  },
  {
    num: "04",
    title: "Zoning does not match the intended use",
    description:
      "A villa marketed as a rental investment on land zoned residential or agricultural is a material misrepresentation. Walk away.",
  },
  {
    num: "05",
    title: "The property has no building permit or an expired permit",
    description: "Structures without valid PBG/IMB face risks during licensing, insurance, and resale.",
  },
  {
    num: "06",
    title: "A nominee arrangement is proposed",
    description:
      "Nominee structures are illegal under Indonesian law. Any advisor suggesting this approach is either uninformed or not acting in your interest.",
  },
  {
    num: "07",
    title: "The property has no documented road access",
    description: "Access through private land without a legal right of way creates ongoing vulnerability.",
  },
  {
    num: "08",
    title: "Multiple agents are marketing the same property with different terms",
    description:
      "This suggests unclear ownership authority or an owner working with unlicensed intermediaries.",
  },
] as const;

const DUE_DILIGENCE_TIMELINE_ROWS: { label: string; duration: string; total?: boolean }[] = [
  { label: "Land certificate verification (BPN)", duration: "1–2 weeks" },
  { label: "Zoning confirmation (KKPR)", duration: "1–2 weeks" },
  { label: "Building permit review", duration: "3–5 business days" },
  { label: "Ownership history investigation", duration: "1–2 weeks (parallel)" },
  { label: "Physical site inspection", duration: "1–2 days" },
  { label: "Contract review", duration: "1 week" },
  { label: "Total typical process", duration: "3–5 weeks", total: true },
];

const DUE_DILIGENCE_CHECKLIST_ITEMS = [
  "Land certificate verified independently with BPN (authenticity, ownership, encumbrances)",
  "Zoning confirmation (KKPR) obtained from local planning authority",
  "Building permits (PBG/IMB) reviewed and matched to existing structures",
  "SLF (Building Worthiness Certificate) confirmed where applicable",
  "Ownership history and chain of title investigated",
  "Adat (customary land) status confirmed with local village authorities",
  "Physical site inspection completed (boundaries, access, environment, utilities)",
  "Structural assessment of existing buildings by qualified inspector",
  "Tax obligations calculated and understood",
  "Contract terms reviewed by independent legal advisor",
  "Ownership structure selected and confirmed with notary",
  "Licensing pathway assessed for intended property use (KKPR zone alignment)",
  "NIB and accommodation classification requirements reviewed (if rental)",
];

function SectionShell({
  num,
  sidebarTitle,
  dark,
  darkLimeAccent,
  limeSidebarAccent,
  green,
  sidebarNormalCase,
  children,
}: {
  num: string;
  sidebarTitle: string;
  dark?: boolean;
  darkLimeAccent?: boolean;
  limeSidebarAccent?: boolean;
  green?: boolean;
  sidebarNormalCase?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(dark ? DARK : green ? GUIDE_GREEN : CREAM, "py-16 md:py-24")}>
      <div className="container mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,13rem)_1fr]">
          <div className="relative lg:sticky lg:top-28 lg:self-start">
            <span
              className={cn(
                "absolute -left-3 top-0 hidden h-full w-px lg:block",
                darkLimeAccent
                  ? "bg-[#dbe8a3]/55"
                  : limeSidebarAccent
                    ? "bg-[#b8e29d]"
                    : dark
                      ? "bg-white/25"
                      : "bg-[#01514E]/25",
              )}
              aria-hidden
            />
            <p
              className={cn(
                "font-serif text-4xl font-bold md:text-5xl",
                darkLimeAccent ? "text-white" : dark ? "text-white/95" : green ? "text-[#01514E]/45" : BRAND,
              )}
            >
              {num}
            </p>
            <p
              className={cn(
                "mt-3 max-w-[11rem] text-[11px] font-semibold leading-snug tracking-[0.22em]",
                sidebarNormalCase ? "normal-case" : "uppercase",
                dark ? "text-white/70" : "text-[#01514E]/85",
              )}
            >
              {sidebarTitle}
            </p>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function LegalGuidePage() {
  const language = useSiteLanguage();
  const ui = LEGAL_GUIDE_UI[language];

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-[#0a2f2c] antialiased">
      <Seo
        title={ui.seoTitle}
        description={truncateForMeta(ui.seoDescription)}
        path="/legal-guide"
      />

      {/* Hero — full-bleed image + breathe (centered copy like /projects properties hero) */}
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden min-h-[min(72dvh,680px)]">
          <HeroImage
            alt={ui.heroImageAlt}
            className="hero-image-breathe h-full min-h-[min(72dvh,680px)] w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-black/40" aria-hidden />
        </div>
        <div className="relative z-20 mx-auto flex min-h-[min(72dvh,680px)] w-full max-w-6xl flex-col items-center justify-center px-6 py-20 text-center text-white translate-y-[6dvh] md:translate-y-[8dvh] lg:translate-y-[9dvh] md:px-12 md:py-24">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90">{ui.heroKicker}</p>
          <h1 className="max-w-4xl font-serif text-3xl font-bold leading-[1.12] tracking-[0.03em] md:text-4xl lg:text-[2.55rem]">
            {ui.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/90 md:mt-6 md:text-base lg:text-lg">
            {ui.heroSub}
          </p>
        </div>
      </section>

      {/* Intro — lead */}
      <section className={cn(CREAM, "py-16 md:py-24")}>
        <div className="page-container page-gutter">
          <div className="space-y-5 text-base font-light leading-relaxed text-justify text-[#1c1917]/88 md:text-lg">
            {ui.intro.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 01 Verify the land certificate */}
      <SectionShell num="01" sidebarTitle={ui.s01.sidebar} dark sidebarNormalCase>
        <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-white md:text-3xl lg:text-[2.25rem]">
          {ui.s01.h2}
        </h2>
        <div className="mt-6 space-y-5 text-base font-light leading-relaxed text-white/85 md:text-lg">
          <p>{ui.s01.lead1}</p>
          <p>{ui.s01.lead2}</p>
        </div>
        <div className="mt-8 divide-y divide-white/15 border-t border-white/15">
          {LAND_TITLE_ROWS.map((row) => (
            <div key={row.title} className="py-6 first:pt-8">
              <p className="font-semibold text-[#e0f2f1]">
                {row.title}{" "}
                <span className="font-normal italic text-white/80">
                  ({row.subtitle})
                </span>
              </p>
              <p className="mt-2 text-sm font-light leading-relaxed text-white/85 md:text-base">{row.description}</p>
            </div>
          ))}
        </div>
        <div className={cn(GUIDE_GREEN_PANEL, "mt-10 rounded-[20px] p-6 md:mt-12 md:p-8 lg:p-10")}>
          <h3 className="font-serif text-xl font-bold text-[#01514E] md:text-2xl">{ui.s01Verify.h3}</h3>
          <p className="mt-4 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">
            {ui.s01Verify.lead}
          </p>
          <ol className="mt-8 list-none space-y-6 p-0">
            {BPN_VERIFY_STEPS.map((step) => (
              <li key={step.num} className="flex gap-4">
                <span className="shrink-0 font-serif text-lg font-bold tabular-nums text-[#01514E] md:text-xl">{step.num}</span>
                <div>
                  <p className="font-semibold text-[#01514E]">{step.title}</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <hr className="mt-8 border-[#01514E]/15" />
          <p className="mt-6 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">
            <span className="font-semibold text-[#01514E]">{ui.s01Verify.timelineStrong}</span>
            {ui.s01Verify.timelineRest}
          </p>
        </div>
      </SectionShell>

      {/* 02 Confirm zoning compliance */}
      <SectionShell num="02" sidebarTitle={ui.s02.sidebar} sidebarNormalCase>
        <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-[#01514E] md:text-3xl lg:text-[2.25rem]">
          {ui.s02.h2}
        </h2>
        <div className="mt-6 space-y-5 text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">
          <p>{ui.s02.p1}</p>
          <p>{ui.s02.p2}</p>
        </div>
        <h3 className="mt-10 font-serif text-lg font-bold text-[#01514E] md:text-xl">{ui.s02.zoningHeading}</h3>
        <ul className="mt-6 list-none space-y-6 p-0">
          {ZONING_ZONES.map((zone) => (
            <li key={zone.label} className="flex gap-4">
              <span className={cn("mt-1 w-1 shrink-0 self-stretch rounded-full", zone.barClass)} aria-hidden />
              <div>
                <p className="font-semibold text-[#01514E]">
                  {zone.label}{" "}
                  <span className="font-normal italic text-[#01514E]/90">({zone.subtitle})</span>
                </p>
                <p className="mt-2 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">{zone.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className={cn(GUIDE_GREEN_PANEL, "mt-10 rounded-[20px] p-6 md:mt-12 md:p-8 lg:p-10")}>
          <h3 className="font-serif text-xl font-bold text-[#01514E] md:text-2xl">{ui.s02.verifyH3}</h3>
          <div className="mt-4 space-y-4 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">
            <p>{ui.s02.pKkpr1}</p>
            <p>{ui.s02.pKkpr2}</p>
          </div>
          <hr className="mt-8 border-[#01514E]/15" />
          <p className="mt-6 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">
            <span className="font-semibold text-[#01514E]">{ui.s02.timelineStrong}</span>
            {ui.s02.timelineRest}
          </p>
          <hr className="mt-6 border-[#01514E]/15" />
          <p className="mt-6 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">
            <span className="font-semibold text-[#01514E]">{ui.s02.criticalStrong}</span>
            {ui.s02.criticalRest}
          </p>
        </div>
      </SectionShell>

      {/* 03 Review building permits */}
      <section className={cn(DARK, "py-16 md:py-24")}>
          <div className="container mx-auto max-w-6xl px-6 md:px-10">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,13rem)_1fr]">
              <div className="relative lg:sticky lg:top-28 lg:self-start">
                <span className="absolute -left-3 top-0 hidden h-full w-px bg-white/25 lg:block" aria-hidden />
                <p className="font-serif text-4xl font-bold text-white md:text-5xl">03</p>
                <p className="mt-3 max-w-[11rem] text-[11px] font-semibold normal-case leading-snug tracking-[0.22em] text-white/70">
                  {ui.s03.sidebar}
                </p>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-white md:text-3xl lg:text-[2.25rem]">
                  {ui.s03.h2}
                </h2>
                <div className="mt-6 space-y-5 text-base font-light leading-relaxed text-white/85 md:text-lg">
                  <p>{ui.s03.p1}</p>
                  <p>{ui.s03.p2}</p>
                </div>
                <hr className="mt-10 border-[#dbe8a3]/35" />
                <h3 className="mt-10 font-serif text-lg font-bold text-white md:text-xl">{ui.s03.checklistH3}</h3>
                <ul className="mt-6 list-disc space-y-3 pl-5 text-sm font-light leading-relaxed text-white/85 marker:text-[#dbe8a3] md:text-base">
                  {BUILDING_PERMIT_CHECKS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-6 text-sm font-light leading-relaxed text-white/85 md:text-base">
                  {ui.s03.checklistFooter}
                </p>
                <hr className="mt-10 border-[#dbe8a3]/35" />
                <p className="mt-6 text-sm font-light leading-relaxed text-white/85 md:text-base">
                  <span className="font-semibold text-[#dbe8a3]">{ui.s03.timelineStrong}</span>
                  {ui.s03.end}
                </p>
                <hr className="mt-10 border-[#dbe8a3]/35" />
              </div>
            </div>
          </div>
      </section>

      {/* 04 Investigate ownership history */}
      <SectionShell num="04" sidebarTitle={ui.s04.sidebar} sidebarNormalCase>
        <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-[#01514E] md:text-3xl lg:text-[2.25rem]">
          {ui.s04.h2}
        </h2>
        <p className="mt-6 text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">
          {ui.s04.lead}
        </p>
        <hr className="mt-10 border-[#01514E]/15" />
        <ul className="mt-10 list-none space-y-8 p-0">
          {OWNERSHIP_HISTORY_ITEMS.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-[#b8e29d]" aria-hidden />
              <div>
                <p className="font-semibold text-[#01514E]">{item.title}</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <hr className="mt-10 border-[#01514E]/15" />
        <p className="mt-8 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">
          <span className="font-semibold text-[#01514E]">{ui.s04.timelineStrong}</span>
          {ui.s04.timelineRest}
        </p>
      </SectionShell>


      {/* 05 Conduct site inspection */}
      <SectionShell num="05" sidebarTitle={ui.s05.sidebar} dark darkLimeAccent sidebarNormalCase>
        <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-white md:text-3xl lg:text-[2.25rem]">
          {ui.s05.h2}
        </h2>
        <p className="mt-6 text-base font-light leading-relaxed text-white/90 md:text-lg">
          {ui.s05.lead}
        </p>
        <div className={cn(GUIDE_GREEN_PANEL, "mt-10 rounded-[20px] p-6 md:mt-12 md:p-8 lg:p-10")}>
          <ul className="list-none space-y-8 p-0">
            {SITE_INSPECTION_ITEMS.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-[#0d4542]" aria-hidden />
                <div>
                  <p className="font-semibold text-[#0d4542]">{item.title}</p>
                  <p className="mt-2 text-sm font-light leading-relaxed text-[#0d4542]/90 md:text-base">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className={cn(DARK_PANEL, "mt-8 rounded-xl border border-white/12 px-5 py-4 md:px-6 md:py-5")}>
          <p className="text-sm font-light leading-relaxed text-white md:text-base">
            <span className="font-semibold">{ui.s05.timelineStrong}</span>
            {ui.s05.timelineRest}
          </p>
        </div>
      </SectionShell>

      {/* 06 Understand tax obligations */}
      <SectionShell num="06" sidebarTitle={ui.s06.sidebar} dark darkLimeAccent sidebarNormalCase>
        <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-white md:text-3xl lg:text-[2.25rem]">
          {ui.s06.h2}
        </h2>
        <p className="mt-6 text-base font-light leading-relaxed text-white/90 md:text-lg">
          {ui.s06.lead}
        </p>
        <div className="mt-10 overflow-x-auto rounded-xl">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className={GUIDE_GREEN_PANEL}>
                <th className="border border-[#0d4542]/20 px-4 py-3.5 font-semibold text-[#0d4542] first:rounded-tl-xl">
                  {ui.s06.tableTax}
                </th>
                <th className="border border-[#0d4542]/20 px-4 py-3.5 font-semibold text-[#0d4542]">{ui.s06.tableRate}</th>
                <th className="border border-[#0d4542]/20 px-4 py-3.5 font-semibold text-[#0d4542]">{ui.s06.tableWho}</th>
                <th className="border border-[#0d4542]/20 px-4 py-3.5 font-semibold text-[#0d4542] last:rounded-tr-xl">
                  {ui.s06.tableNotes}
                </th>
              </tr>
            </thead>
            <tbody>
              {TAX_OBLIGATION_ROWS.map((row, i) => (
                <tr key={row.tax} className="bg-white">
                  <td
                    className={cn(
                      "border border-[#0d4542]/15 px-4 py-3.5 font-medium text-[#0d4542]",
                      i === TAX_OBLIGATION_ROWS.length - 1 && "rounded-bl-xl",
                    )}
                  >
                    {row.tax}
                  </td>
                  <td className="border border-[#0d4542]/15 px-4 py-3.5 font-light text-[#0d4542]/90">{row.rate}</td>
                  <td className="border border-[#0d4542]/15 px-4 py-3.5 font-light text-[#0d4542]/90">{row.who}</td>
                  <td
                    className={cn(
                      "border border-[#0d4542]/15 px-4 py-3.5 font-light text-[#0d4542]/90",
                      i === TAX_OBLIGATION_ROWS.length - 1 && "rounded-br-xl",
                    )}
                  >
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 rounded-xl border border-[#dbe8a3]/55 px-5 py-4 text-center md:px-6 md:py-5">
          <p className="text-sm font-light leading-relaxed text-white md:text-base">
            {ui.s06.disclaimer}
          </p>
        </div>
      </SectionShell>

      {/* 07 Engage the right professionals */}
      <SectionShell
        num="07"
        sidebarTitle={ui.s07.sidebar}
        limeSidebarAccent
        sidebarNormalCase
      >
        <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-[#01514E] md:text-3xl lg:text-[2.25rem]">
          {ui.s07.h2}
        </h2>
        <p className="mt-6 text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">
          {ui.s07.lead}
        </p>
        <hr className="mt-10 border-[#01514E]/15" />
        <ul className="mt-10 list-none space-y-8 p-0">
          {PROFESSIONALS_ITEMS.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#b8e29d]" aria-hidden />
              <div>
                <p className="font-semibold text-[#01514E]">{item.title}</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <hr className="mt-10 border-[#01514E]/15" />
        <p className="mt-8 text-sm font-semibold leading-relaxed text-[#01514E] md:text-base">
          {ui.s07.footerStrong}
        </p>
      </SectionShell>

      {/* 08 Coastal panorama */}
      <section className="w-full" aria-label={ui.panoramaAria}>
        <img
          src={SITE_MEDIA.legalGuidePanorama}
          alt={ui.panoramaAlt}
          width={LEGAL_GUIDE_PANORAMA_WIDTH}
          height={LEGAL_GUIDE_PANORAMA_HEIGHT}
          className="block aspect-[822/248] h-auto w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </section>

      {/* 09 Red flags */}
      <section className={cn(DARK, "py-16 md:py-24")}>
        <div className="container mx-auto max-w-6xl px-6 md:px-10">
          <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-[#dbe8a3] md:text-3xl lg:text-[2.25rem]">
            {ui.s09.h2}
          </h2>
          <p className="mt-6 max-w-4xl text-base font-light leading-relaxed text-white/85 md:text-lg">
            {ui.s09.lead}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:gap-6">
            {RED_FLAG_ITEMS.map((item) => (
              <article
                key={item.num}
                className="rounded-2xl border border-[#dbe8a3]/45 p-6 md:p-7"
              >
                <p className="font-serif text-4xl font-light tabular-nums leading-none text-[#dbe8a3] md:text-[2.75rem]">
                  {item.num}
                </p>
                <h3 className="mt-5 font-semibold leading-snug text-white md:text-[1.05rem]">{item.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-white/85 md:text-base">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Due diligence timeline */}
      <section className={cn(DARK, "py-16 md:py-24")}>
        <div className="container mx-auto max-w-6xl px-6 md:px-10">
          <h2 className="font-serif text-2xl font-bold tracking-[0.04em] text-[#dbe8a3] md:text-3xl lg:text-[2.25rem]">
            {ui.s10.h2}
          </h2>
          <p className="mt-6 max-w-4xl text-base font-light leading-relaxed text-white/85 md:text-lg">
            {ui.s10.lead}
          </p>
          <div className="mt-10 border-t border-white/20">
            {DUE_DILIGENCE_TIMELINE_ROWS.map((row) => (
              <div
                key={row.label}
                className={cn(
                  "flex flex-col gap-2 border-b border-white/20 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-6",
                  row.total && "font-semibold",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-[0.18em] text-white/90 md:text-sm",
                    row.total && "text-white",
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-[0.18em] text-white/90 sm:text-right md:text-sm",
                    row.total && "text-white",
                  )}
                >
                  {row.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11 Checklist & CTA — cream (matches intro under hero) */}
      <section className={cn(CREAM, "py-16 md:py-24")}>
        <div className="container mx-auto max-w-6xl px-6 md:px-10">
          <div className="space-y-5 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">
            <p>{ui.s11.p1}</p>
            <p>{ui.s11.p2}</p>
          </div>

          <div
            className={cn(
              GUIDE_GREEN_PANEL,
              "mt-10 flex flex-col gap-6 rounded-2xl p-6 md:flex-row md:items-center md:gap-8 md:p-8",
            )}
          >
            <div className="flex shrink-0 items-center gap-5 md:gap-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#01514E] md:h-14 md:w-14">
                <Check className="h-6 w-6 text-white md:h-7 md:w-7" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="hidden h-10 w-px bg-[#01514E]/20 md:block" aria-hidden />
              <h3 className="font-serif text-xl font-bold text-[#01514E] md:text-2xl">{ui.s11.checklistIntro}</h3>
            </div>
            <p className="text-sm font-light leading-relaxed text-[#01514E]/90 md:border-l md:border-[#01514E]/20 md:pl-8 md:text-base">
              {ui.s11.checklistLead}
            </p>
          </div>

          <div className={cn(GUIDE_GREEN_PANEL, "mt-4 rounded-2xl p-6 md:p-8 lg:p-10")}>
            <ul className="list-none space-y-4 p-0">
              {DUE_DILIGENCE_CHECKLIST_ITEMS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-[#01514E]/35 bg-[#fdfbf7]/60"
                    aria-hidden
                  />
                  <span className="text-sm font-light leading-relaxed text-[#01514E] md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <h2 className="mt-12 font-serif text-2xl font-bold tracking-[0.04em] text-[#01514E] md:mt-14 md:text-3xl lg:text-[2.25rem]">
            {ui.s11.closingH2}
          </h2>
          <div className="mt-6 space-y-5 text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">
            <p>
              {ui.s11.closingP1Before}
              <strong className="font-semibold text-[#01514E]">{ui.s11.closingP1Strong}</strong>
            </p>
            <p>
              {ui.s11.closingP2Prefix}
              <strong className="font-semibold text-[#01514E]">{ui.s11.closingP2Strong1}</strong>
              {ui.s11.closingP2Mid}
              <strong className="font-semibold text-[#01514E]">{ui.s11.closingP2Strong2}</strong>
              {ui.s11.closingP2Suffix}
            </p>
            <p>
              {ui.s11.closingP3}
              <strong className="font-semibold text-[#01514E]">{ui.s11.closingP3Strong}</strong>
              {ui.s11.closingP3End}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#01514E] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#01514E] transition-colors hover:bg-[#01514E] hover:text-white"
            >
              {ui.s11.ctaTeam}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href="/legal-services"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#01514E] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#01514E] transition-colors hover:bg-[#01514E] hover:text-white"
            >
              {ui.s11.ctaLegal}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
