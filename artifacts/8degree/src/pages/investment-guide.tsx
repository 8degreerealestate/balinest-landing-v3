import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Home,
  Map,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { InvestmentGuideReportForm } from "@/components/investment-guide/InvestmentGuideReportForm";
import { SITE_MEDIA } from "@/lib/site-assets";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/lib/utils";

const INVEST_COPY: Record<SiteLanguage, Record<string, string>> = {
  en: {
    heroKicker: "Investment Guide",
    heroTitle: "Bali Property Investment Guide",
    heroSub:
      "Everything international investors need to know before buying property in Bali — from ownership structures to real ROI expectations.",
  },
  id: {
    heroKicker: "Panduan investasi",
    heroTitle: "Panduan investasi properti Bali",
    heroSub:
      "Semua yang perlu diketahui investor internasional sebelum membeli properti di Bali — dari struktur kepemilikan hingga ekspektasi ROI riil.",
  },
  fr: {
    heroKicker: "Guide d’investissement",
    heroTitle: "Guide d’investissement immobilier à Bali",
    heroSub:
      "L’essentiel pour les investisseurs internationaux avant d’acheter à Bali : structures de propriété, fiscalité et attentes de rendement réalistes.",
  },
  zh: {
    heroKicker: "投资指南",
    heroTitle: "巴厘岛房产投资指南",
    heroSub:
      "国际投资者在巴厘岛购房前需要了解的内容——从产权结构到真实 ROI 预期。",
  },
  tr: {
    heroKicker: "Yatırım rehberi",
    heroTitle: "Bali gayrimenkul yatırım rehberi",
    heroSub:
      "Bali’de mülk satın almadan önce uluslararası yatırımcıların bilmesi gerekenler — mülkiyet yapılarından gerçekçi getiri beklentisine.",
  },
};

const INVEST_CREAM = "bg-[#fdfbf7]";
const INVEST_DARK = "#0d4542";
const INVEST_DARK_BG = "bg-[#0d4542]";

/** Wide panorama strip — display crop ~804×114; source image 688×384. */
const INVEST_PANORAMA_WIDTH = 688;
const INVEST_PANORAMA_HEIGHT = 384;
const INVEST_LIME = "#b8e29d";
const INVEST_CARD_BORDER = "border-2 border-[#5a9a4a]";

const FOREIGN_OWNERSHIP_ROWS = [
  {
    title: "Leasehold (Hak Sewa)",
    description: "The most common structure, typically 25–30 years with extension options.",
  },
  {
    title: "Hak Pakai (Right to Use)",
    description:
      "Available for foreigners with residency permits, allowing long-term residential ownership.",
  },
  {
    title: "HGB via PT PMA",
    description: "A structure used for commercial investment through a foreign-owned company.",
  },
] as const;

const INVEST_MARKET_OVERLAY = "BALI IS NO LONGER JUST A HOLIDAY DESTINATION";

const MARKET_DRIVER_CARDS = [
  { num: "01", label: "International Tourism" },
  { num: "02", label: "Domestic Tourism" },
  { num: "03", label: "Population Growth" },
] as const;

const MARKET_STATS_2025 = [
  { value: "6.95 million", label: "international visitors" },
  { value: "9.28 million", label: "domestic visitors" },
  { value: "16+ million", label: "total annual visitors" },
  { value: "4.4 million", label: "residents" },
] as const;

const EXAMPLE_INVESTMENT_METRICS = [
  { label: "Purchase Price:", value: "$500,000" },
  { label: "Average Nightly Rate:", value: "$330" },
  { label: "Occupancy:", value: "60%" },
  { label: "Annual Revenue:", value: "~$75,240" },
] as const;

const ROI_DRIVER_CARDS: {
  num: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    num: "01",
    title: "Location",
    description: "High-demand areas like Canggu, Uluwatu, and Ubud perform best",
    icon: Map,
  },
  {
    num: "02",
    title: "Design & Concept",
    description: "Unique, lifestyle-focused villas outperform generic builds",
    icon: Home,
  },
  {
    num: "03",
    title: "Amenities",
    description: "Pools, outdoor living, wellness features, concierge services",
    icon: Sparkles,
  },
  {
    num: "04",
    title: "Management",
    description: "Pricing, marketing, and operations are critical",
    icon: BarChart3,
  },
];

const INVEST_MARKET_PARAGRAPHS = [
  "Bali has evolved into one of Southeast Asia’s most dynamic lifestyle-driven property markets. What was once purely a tourism destination is now a global hub for entrepreneurs, remote professionals, and long-stay residents.",
  "This shift has transformed real estate into a hospitality-driven investment market, where performance depends not only on ownership — but on location, concept, and management.",
  "Today, well-positioned properties that combine strong design, guest experience, and professional operations consistently outperform generic developments.",
];

const INVESTMENT_STRATEGY_CARDS = [
  {
    num: "01",
    title: "Income Strategy",
    description: "Purchase a villa and generate revenue through short-term rentals.",
    image: SITE_MEDIA.investStrategyIncome,
    alt: "Luxury Bali villa with a private swimming pool surrounded by palm trees",
  },
  {
    num: "02",
    title: "Lifestyle Strategy",
    description: "Use the property personally while renting it out when not in use.",
    image: SITE_MEDIA.investStrategyLifestyle,
    alt: "Investor on a villa terrace overlooking the coast at golden hour",
  },
  {
    num: "03",
    title: "Growth Strategy",
    description: "Invest in emerging areas for long-term capital appreciation.",
    image: SITE_MEDIA.investStrategyGrowth,
    alt: "Professional working remotely at a luxury open-air villa with infinity pool",
  },
] as const;

const HOW_TO_BUY_STEPS = [
  { num: "01", label: "Define your goals and budget" },
  { num: "02", label: "Shortlist locations and projects" },
  { num: "03", label: "Conduct legal and zoning due diligence" },
  { num: "04", label: "Choose ownership structure" },
  { num: "05", label: "Sign agreements and complete legal transfer" },
  { num: "06", label: "Set up professional management" },
] as const;

const RISKS_DUE_DILIGENCE_BULLETS = [
  "Zoning compliance",
  "Licensing requirements",
  "Market competition",
  "Operational performance",
] as const;

const INVEST_REPORT_CTA = {
  label: "Report download",
  title: "Move from research to decision",
  body: "This guide gives you the framework. The full report gives you the data — visitor statistics, average daily rates, occupancy benchmarks, area-by-area analysis, and the regulatory landscape shaping investment outcomes in 2026.",
} as const;

const INVEST_REPORT_SECTION_BG = "#f4f1ea";

const INVESTOR_MISTAKES_BULLETS: { lead: string; emphasis: string; tail?: string }[] = [
  { lead: "Buying in ", emphasis: "low-demand locations" },
  { lead: "", emphasis: "Ignoring", tail: " zoning and licensing rules" },
  { lead: "Choosing ", emphasis: "inexperienced", tail: " property managers" },
  { lead: "", emphasis: "Underestimating", tail: " operational costs" },
  { lead: "Investing in ", emphasis: "weak or unproven developers" },
];

function InvestHeroImage({ className }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <img
      src={useFallback ? SITE_MEDIA.heroStill : SITE_MEDIA.investHero}
      alt="Modern luxury two-storey villa at twilight with pool, glass façade, and warm interior light against a deep blue sky"
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

function InvestMarketImage({ className }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <img
      src={useFallback ? SITE_MEDIA.heroStill : SITE_MEDIA.investMarket}
      alt="Man in a light suit on a luxury villa deck beside an infinity pool overlooking the ocean at golden hour"
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

function InvestReturnsImage({ className }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <img
      src={useFallback ? SITE_MEDIA.heroStill : SITE_MEDIA.investReturns}
      alt="Luxury Bali villa at dusk with illuminated pavilions, pool, and candlelit dining on the terrace"
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

export default function InvestmentGuide() {
  const language = useSiteLanguage();
  const t = INVEST_COPY[language];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Bali Property Investment Guide"
        description={truncateForMeta(
          "Investment guide: ownership structures, ROI expectations, risks, and how to buy property in Bali — for international investors.",
        )}
        path="/investment-guide"
      />
      {/* Hero — full-bleed image + breathe (same pattern as legal-guide) */}
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden min-h-[min(72dvh,680px)]">
          <InvestHeroImage className="hero-image-breathe h-full min-h-[min(72dvh,680px)] w-full object-cover object-center" />
          <div className="absolute inset-0 z-10 bg-black/40" aria-hidden />
        </div>
        <div className="relative z-20 mx-auto flex min-h-[min(72dvh,680px)] w-full max-w-6xl flex-col items-center justify-center px-6 py-20 text-center text-white translate-y-[6dvh] md:translate-y-[8dvh] lg:translate-y-[9dvh] md:px-12 md:py-24">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90">{t.heroKicker}</p>
          <h1 className="max-w-4xl font-serif text-3xl font-bold leading-[1.12] tracking-[0.03em] md:text-4xl lg:text-[2.55rem]">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/90 md:mt-6 md:text-base lg:text-lg">
            {t.heroSub}
          </p>
        </div>
      </section>

      {/* Bali lifestyle market */}
      <section className={`${INVEST_CREAM} px-6 py-16 md:py-20 lg:py-24`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square w-full overflow-hidden rounded-[20px]"
          >
            <InvestMarketImage className="h-full w-full object-cover object-center" />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d4542]/80 via-[#0d4542]/25 to-transparent"
              aria-hidden
            />
            <p className="absolute left-0 top-0 max-w-[min(100%,18rem)] p-6 font-sans text-xl font-bold uppercase leading-[1.15] tracking-[0.04em] text-white md:max-w-[20rem] md:p-8 md:text-[1.65rem] lg:text-[1.75rem]">
              {INVEST_MARKET_OVERLAY}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="space-y-5 font-sans text-base font-light leading-relaxed text-[#1c1917]/88 md:space-y-6 md:text-[1.05rem] md:leading-[1.75]"
          >
            {INVEST_MARKET_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Market drivers & returns */}
      <section className={cn(INVEST_CREAM, "overflow-x-hidden px-6 pb-16 md:pb-20 lg:pb-24 pt-4 md:pt-6 lg:pr-0")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl"
        >
          {/* What drives Bali's property market */}
          <div className="text-center">
            <h2
              className="font-sans text-lg font-bold uppercase leading-snug tracking-[0.06em] md:text-xl"
              style={{ color: INVEST_DARK }}
            >
              What drives Bali&apos;s property market
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl font-sans text-sm font-light leading-relaxed md:text-base"
              style={{ color: INVEST_DARK }}
            >
              Bali&apos;s real estate demand is supported by three major forces:
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-10 grid gap-4 sm:grid-cols-3 md:mt-12 md:gap-5"
          >
            {MARKET_DRIVER_CARDS.map((card) => (
              <div
                key={card.num}
                className={cn(INVEST_DARK_BG, "flex min-h-[140px] flex-col justify-between rounded-[20px] px-6 py-7 md:min-h-[160px] md:px-7 md:py-8")}
              >
                <span className="font-sans text-sm font-medium tracking-wide text-[#b8d4b0]/90">{card.num}</span>
                <p className="font-sans text-base font-medium leading-snug text-white md:text-[1.05rem]">{card.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-12 md:mt-14"
          >
            <p className="font-sans text-sm font-semibold md:text-base" style={{ color: INVEST_DARK }}>
              In 2025 alone:
            </p>
            <div className="mt-4 grid grid-cols-1 border-y border-[#0d4542]/20 sm:grid-cols-2 md:grid-cols-4">
              {MARKET_STATS_2025.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn(
                    "flex flex-col justify-center px-4 py-6 md:px-6 md:py-8",
                    i < MARKET_STATS_2025.length - 1 && "border-b border-[#0d4542]/20 sm:border-b-0",
                    i % 2 === 0 && "sm:border-r sm:border-[#0d4542]/20",
                    i < 2 && "sm:border-b sm:border-[#0d4542]/20 md:border-b-0",
                    i < MARKET_STATS_2025.length - 1 && "md:border-r md:border-[#0d4542]/20",
                  )}
                >
                  <p className="font-sans text-xl font-bold leading-tight md:text-2xl lg:text-[1.65rem]" style={{ color: INVEST_DARK }}>
                    {stat.value}
                  </p>
                  <p className="mt-1.5 font-sans text-xs font-light leading-snug md:text-sm" style={{ color: `${INVEST_DARK}cc` }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="mx-auto mt-8 max-w-3xl text-center font-sans text-sm font-light leading-relaxed md:mt-10 md:text-base"
              style={{ color: `${INVEST_DARK}dd` }}
            >
              This scale creates one of the strongest hospitality ecosystems in Southeast Asia — directly supporting rental
              demand and long-term property value.
            </p>
          </motion.div>
        </motion.div>

        {/* What returns can you expect — image flush to viewport right */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-20 lg:mt-24"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,min(100%,40rem))_1fr] lg:items-stretch lg:gap-0">
            <div
              className="flex flex-col border-y py-8 md:py-10 lg:max-w-xl xl:max-w-2xl"
              style={{ borderColor: `${INVEST_DARK}33` }}
            >
              <h2
                className="font-sans text-lg font-bold uppercase leading-snug tracking-[0.05em] md:text-xl"
                style={{ color: INVEST_DARK }}
              >
                What returns can you expect from Bali property?
              </h2>
              <p
                className="mt-4 font-sans text-sm font-light leading-relaxed md:text-base md:leading-[1.7]"
                style={{ color: `${INVEST_DARK}dd` }}
              >
                While returns vary depending on execution, a well-located and professionally managed villa can generate
                strong income.
              </p>
              <div className="my-8 h-px w-full md:my-10" style={{ backgroundColor: `${INVEST_DARK}33` }} aria-hidden />
              <div className="flex items-start gap-3">
                <span
                  className={cn(INVEST_DARK_BG, "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-serif text-[11px] font-bold italic text-white")}
                  aria-hidden
                >
                  i
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-semibold md:text-base" style={{ color: INVEST_DARK }}>
                    Example Investment (3-Bedroom Villa):
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:gap-x-8 md:gap-y-7">
                    {EXAMPLE_INVESTMENT_METRICS.map((row) => (
                      <div key={row.label}>
                        <p className="font-sans text-xs font-light md:text-sm" style={{ color: `${INVEST_DARK}aa` }}>
                          {row.label}
                        </p>
                        <p className="mt-1 font-sans text-xl font-bold md:text-2xl" style={{ color: INVEST_DARK }}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 md:mt-10">
                    <p className="font-sans text-xs font-light md:text-sm" style={{ color: `${INVEST_DARK}aa` }}>
                      Net ROI:
                    </p>
                    <p className="mt-1 font-sans text-xl font-bold md:text-2xl" style={{ color: INVEST_DARK }}>
                      8%–11% annually
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative -mx-6 min-h-[min(320px,55vw)] w-[calc(100%+3rem)] overflow-hidden rounded-[20px] md:-mx-12 md:min-h-[min(380px,50vw)] md:w-[calc(100%+6rem)] lg:mx-0 lg:min-h-[min(520px,52vh)] lg:h-full lg:w-full lg:rounded-l-[20px] lg:rounded-r-none"
            >
              <InvestReturnsImage className="h-full min-h-[min(320px,55vw)] w-full object-cover object-center lg:absolute lg:inset-0 lg:min-h-full" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* What drives ROI */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl"
        >
          <h2
            className="text-center font-sans text-lg font-bold uppercase tracking-[0.06em] md:text-xl"
            style={{ color: INVEST_DARK }}
          >
            What drives ROI
          </h2>
          <motion.div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-5">
            {ROI_DRIVER_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className={cn(
                    "flex flex-col items-center rounded-[12px] px-5 py-8 text-center md:px-6 md:py-10",
                    INVEST_CARD_BORDER,
                  )}
                >
                  <Icon
                    className="h-9 w-9 md:h-10 md:w-10"
                    strokeWidth={1.25}
                    style={{ color: INVEST_DARK }}
                    aria-hidden
                  />
                  <span
                    className="mt-5 font-sans text-2xl font-light tracking-wide md:mt-6 md:text-[1.65rem]"
                    style={{ color: `${INVEST_DARK}55` }}
                  >
                    {card.num}
                  </span>
                  <h3
                    className="mt-3 font-sans text-sm font-bold uppercase tracking-[0.08em] md:text-[0.95rem]"
                    style={{ color: INVEST_DARK }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="mt-3 font-sans text-xs font-light leading-relaxed md:text-sm md:leading-[1.55]"
                    style={{ color: `${INVEST_DARK}cc` }}
                  >
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Can foreigners own property in Bali? */}
      <section className={cn(INVEST_DARK_BG, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl"
        >
          <h2 className="font-sans text-lg font-bold uppercase tracking-[0.05em] text-white md:text-xl">
            Can foreigners own property in Bali?
          </h2>
          <p className="mt-4 max-w-3xl font-sans text-sm font-light leading-relaxed text-white/90 md:text-base md:leading-[1.7]">
            Foreigners cannot directly own freehold land in Indonesia, but there are secure and widely used legal
            structures:
          </p>

          <hr className="mt-8 border-0 border-t-2 md:mt-10" style={{ borderColor: INVEST_LIME }} />

          {FOREIGN_OWNERSHIP_ROWS.map((row) => (
            <motion.div key={row.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="grid gap-3 py-6 md:grid-cols-[minmax(0,13rem)_1fr] md:items-start md:gap-10 md:py-8 lg:grid-cols-[minmax(0,15rem)_1fr]">
                <p className="font-sans text-sm font-bold uppercase leading-snug tracking-[0.04em] text-white md:text-[0.95rem]">
                  {row.title}
                </p>
                <p className="font-sans text-sm font-light leading-relaxed text-white/88 md:text-base md:leading-[1.65]">
                  {row.description}
                </p>
              </div>
              <hr className="border-0 border-t-2" style={{ borderColor: INVEST_LIME }} />
            </motion.div>
          ))}

          <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[minmax(0,15rem)_1fr] md:items-end md:gap-10">
            <div className="space-y-3" aria-hidden>
              <div className="h-1 w-20 rounded-full" style={{ backgroundColor: INVEST_LIME }} />
              <div className="h-1 w-12 rounded-full" style={{ backgroundColor: INVEST_LIME }} />
            </div>
            <div>
              <p className="font-sans text-sm font-bold uppercase tracking-[0.06em] text-white">Important</p>
              <p className="mt-3 font-sans text-sm font-light leading-relaxed text-white/88 md:text-base md:leading-[1.65]">
                Nominee structures (using a local name) are{" "}
                <strong className="font-semibold text-white">illegal and unenforceable.</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Advisory meeting — wide banner (crop via aspect ratio, not native 4:3) */}
      <section className="w-full" aria-label="Investment advisory team reviewing market data">
        <img
          src={SITE_MEDIA.investMeeting}
          alt="Professional advisors in a modern Bali office reviewing property investment data on a large display"
          width={802}
          height={322}
          className="block aspect-[802/322] h-auto w-full object-cover object-[center_42%]"
          loading="lazy"
          decoding="async"
        />
      </section>

      {/* 3 main investment strategies */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl"
        >
          <h2
            className="text-center font-sans text-lg font-bold uppercase tracking-[0.06em] md:text-xl"
            style={{ color: INVEST_DARK }}
          >
            3 main investment strategies
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-center font-sans text-sm font-light leading-relaxed md:text-base"
            style={{ color: INVEST_DARK }}
          >
            Bali&apos;s real estate demand is supported by three major forces:
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
            {INVESTMENT_STRATEGY_CARDS.map((card, i) => (
              <motion.article
                key={card.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="flex flex-col overflow-hidden rounded-[14px] ring-1 ring-[#0d4542]/12"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div
                  className={cn(
                    INVEST_DARK_BG,
                    "flex flex-1 flex-col items-center border-t-2 px-5 py-8 text-center md:px-6 md:py-10",
                  )}
                  style={{ borderColor: "rgba(255,255,255,0.35)" }}
                >
                  <span className="font-sans text-3xl font-light leading-none tracking-wide text-white/40 md:text-[2rem]">
                    {card.num}
                  </span>
                  <h3 className="mt-3 font-sans text-sm font-bold uppercase tracking-[0.08em] text-white md:text-[0.95rem]">
                    {card.title}
                  </h3>
                  <p className="mt-3 font-sans text-xs font-light leading-relaxed text-white/90 md:text-sm md:leading-[1.55]">
                    {card.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Common mistakes investors make */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] sm:aspect-square lg:aspect-[4/5]"
          >
            <img
              src={SITE_MEDIA.investMistakes}
              alt="Stressed investor reviewing property plans at a desk in a Bali villa at night"
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="flex flex-col py-2 md:py-4"
          >
            <hr className="border-0 border-t-2" style={{ borderColor: INVEST_DARK }} />
            <h2
              className="mt-6 font-sans text-lg font-bold uppercase leading-snug tracking-[0.05em] md:text-xl"
              style={{ color: INVEST_DARK }}
            >
              Common mistakes investors make
            </h2>
            <p
              className="mt-4 font-sans text-sm font-light leading-relaxed md:text-base md:leading-[1.7]"
              style={{ color: `${INVEST_DARK}dd` }}
            >
              Many first-time investors focus on price but overlook what actually drives performance:
            </p>
            <ul className="mt-6 space-y-3 font-sans text-sm md:text-base" style={{ color: `${INVEST_DARK}dd` }}>
              {INVESTOR_MISTAKES_BULLETS.map((item) => (
                <li key={item.emphasis} className="flex gap-3 leading-relaxed">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: INVEST_DARK }}
                    aria-hidden
                  />
                  <span>
                    {item.lead}
                    <strong className="font-semibold" style={{ color: INVEST_DARK }}>
                      {item.emphasis}
                    </strong>
                    {item.tail}
                  </span>
                </li>
              ))}
            </ul>
            <hr className="mt-8 border-0 border-t-2" style={{ borderColor: INVEST_DARK }} />
            <p className="mt-6 font-sans text-sm font-semibold md:text-base" style={{ color: INVEST_DARK }}>
              In Bali, execution matters more than entry price.
            </p>
            <hr className="mt-6 border-0 border-t-2" style={{ borderColor: INVEST_DARK }} />
          </motion.div>
        </motion.div>
      </section>

      {/* How to buy property in Bali */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div>
              <h2
                className="font-sans text-lg font-bold uppercase leading-snug tracking-[0.05em] md:text-xl"
                style={{ color: INVEST_DARK }}
              >
                How to buy property in Bali
              </h2>
              <p className="mt-2 font-sans text-sm font-light md:text-base" style={{ color: INVEST_DARK }}>
                A simplified process:
              </p>
            </div>
            <p
              className="max-w-md font-sans text-sm font-light leading-relaxed md:text-base lg:pt-1 lg:text-right"
              style={{ color: INVEST_DARK }}
            >
              With the right guidance, the process is structured and secure.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-5">
            {HOW_TO_BUY_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={cn(
                  INVEST_DARK_BG,
                  "flex min-h-[120px] flex-col items-center justify-center rounded-[12px] px-5 py-8 text-center md:min-h-[130px] md:px-6",
                )}
              >
                <span className="font-sans text-2xl font-light leading-none text-white/45 md:text-[1.65rem]">
                  {step.num}
                </span>
                <p className="mt-3 font-sans text-sm font-light leading-snug text-white/95 md:text-[0.95rem] md:leading-relaxed">
                  {step.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Lifestyle panorama — wide strip with subtle green mask */}
      <section className="w-full" aria-label="Luxury Bali villa pool and tropical landscape at sunset">
        <div className="relative aspect-[804/114] w-full overflow-hidden">
          <img
            src={SITE_MEDIA.investPanorama}
            srcSet={`${SITE_MEDIA.investPanorama} 688w`}
            sizes="100vw"
            alt="Luxury Bali villa with swimming pool, lounge deck, and forested hills at golden hour"
            width={INVEST_PANORAMA_WIDTH}
            height={INVEST_PANORAMA_HEIGHT}
            className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#0d4542]/22" aria-hidden />
        </div>
      </section>

      {/* Risks and due diligence */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto grid max-w-6xl gap-10 md:gap-12 lg:grid-cols-3 lg:items-start lg:gap-14 xl:gap-16"
        >
          <h2
            className="font-sans text-lg font-bold uppercase leading-snug tracking-[0.05em] md:text-xl"
            style={{ color: INVEST_DARK }}
          >
            Risks and due diligence
          </h2>
          <p
            className="font-sans text-sm font-semibold leading-relaxed md:text-base md:leading-[1.65]"
            style={{ color: INVEST_DARK }}
          >
            Like any international investment, key risks include:
          </p>
          <div>
            <ul
              className="space-y-2.5 font-sans text-sm font-light leading-relaxed md:text-base md:leading-[1.65]"
              style={{ color: `${INVEST_DARK}cc` }}
            >
              {RISKS_DUE_DILIGENCE_BULLETS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `${INVEST_DARK}99` }}
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p
              className="mt-6 font-sans text-sm font-light leading-relaxed md:mt-7 md:text-base md:leading-[1.65]"
              style={{ color: `${INVEST_DARK}cc` }}
            >
              Working with experienced advisors significantly reduces these risks and improves outcomes.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Report download */}
      <section
        id="report-download"
        className="scroll-mt-24 px-6 py-10 md:px-12 md:py-14"
        style={{ backgroundColor: INVEST_REPORT_SECTION_BG }}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 text-center"
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.28em]"
              style={{ color: INVEST_DARK }}
            >
              {INVEST_REPORT_CTA.label}
            </p>
            <h2
              className="mt-2 font-serif text-2xl font-bold uppercase leading-tight tracking-[0.05em] md:text-3xl"
              style={{ color: INVEST_DARK }}
            >
              {INVEST_REPORT_CTA.title}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-light leading-relaxed text-[#1c1917]/75 md:text-base">
              {INVEST_REPORT_CTA.body}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-[#0d4542]/12 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(13,69,66,0.16)] md:p-6"
          >
            <InvestmentGuideReportForm />
          </motion.div>
        </div>
      </section>

    </div>
  );
}
