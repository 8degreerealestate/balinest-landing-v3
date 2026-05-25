import { useState } from "react";
import { motion } from "framer-motion";
import { UserSearch } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { BuyerAgentAssistanceForm } from "@/components/site/BuyerAgentAssistanceForm";
import { SITE_MEDIA } from "@/lib/site-assets";
import { truncateForMeta } from "@/lib/site-seo";
import { useSiteCopy } from "@/lib/site-language";
import { BUYER_AGENT_COPY } from "@/lib/i18n/buyer-agent";

const CREAM = "bg-[#f4f1ea]";
/** Pricing & terms band — slightly cooler off-white (#F9F9F7). */
const PRICING_SECTION_BG = "bg-[#F9F9F7]";

function FallbackImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <img
      src={useFallback ? SITE_MEDIA.heroStill : src}
      alt={alt}
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

/** Split text/image rows: text and image enter from opposite sides together. */
const SPLIT_VIEWPORT = { once: true as const, margin: "-60px" as const };
const SPLIT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SPLIT_DURATION = 1.05;
const splitFromLeft = {
  initial: { opacity: 0, x: -52 },
  whileInView: { opacity: 1, x: 0 },
  viewport: SPLIT_VIEWPORT,
  transition: { duration: SPLIT_DURATION, ease: SPLIT_EASE },
};
const splitFromRight = {
  initial: { opacity: 0, x: 52 },
  whileInView: { opacity: 1, x: 0 },
  viewport: SPLIT_VIEWPORT,
  transition: { duration: SPLIT_DURATION, ease: SPLIT_EASE },
};

function MultilineTitle({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={line} className={className}>
          {i > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </>
  );
}

export default function BuyerAgentPage() {
  const t = useSiteCopy(BUYER_AGENT_COPY);

  return (
    <div className="min-h-screen bg-[#f4f1ea] font-sans text-[#0a2f2c] antialiased">
      <Seo title={t.seoTitle} description={truncateForMeta(t.seoDescription)} path="/buyer-agents" />

      {/* Hero */}
      <section className="relative min-h-[min(88dvh,720px)] w-full overflow-hidden">
        <FallbackImage
          src={SITE_MEDIA.buyerAgentHero}
          alt="Tropical villa at dusk with pool"
          className="hero-image-breathe absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25" aria-hidden />
        <div className="relative z-10 flex min-h-[min(88dvh,720px)] flex-col justify-end px-6 pb-16 pt-32 md:px-12 md:pb-24">
          <div className="container mx-auto max-w-6xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl font-serif text-3xl font-bold uppercase leading-[1.12] tracking-[0.06em] text-white md:text-5xl lg:text-[3.25rem]"
            >
              <MultilineTitle text={t.heroTitle} />
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className={`${CREAM} overflow-x-hidden px-6 py-16 md:px-12 md:py-24 lg:px-0 lg:py-24 lg:pl-12 xl:pl-16 lg:pr-0`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,min(100%,40rem))_1fr] lg:items-stretch lg:gap-10 xl:gap-14">
          <motion.div className="lg:max-w-xl xl:max-w-2xl" {...splitFromLeft}>
            <h2 className="font-serif text-2xl font-bold uppercase leading-tight tracking-[0.05em] text-[#01514E] md:text-4xl">
              <MultilineTitle text={t.introTitle} />
            </h2>
            <div className="mt-8 space-y-5 font-sans text-base font-light leading-relaxed text-[#1c1917]/90 md:text-lg">
              {t.introParagraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="relative -mx-6 min-h-[220px] w-[calc(100%+3rem)] overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 md:-mx-12 md:w-[calc(100%+6rem)] lg:mx-0 lg:h-full lg:min-h-0 lg:w-full lg:rounded-l-lg lg:rounded-r-none lg:shadow-lg"
            {...splitFromRight}
          >
            <FallbackImage
              src={SITE_MEDIA.buyerAgentIntroInterior}
              alt="Modern villa living space with sculptural staircase and view to pool and tropical garden"
              className="aspect-[21/10] h-full w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:min-h-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Who is this for */}
      <section className="bg-[#faf8f4] px-6 py-12 md:px-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col items-center text-center md:mb-8">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#01514E] text-[#01514E]">
              <UserSearch className="h-7 w-7" strokeWidth={1.25} />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.06em] text-[#01514E] md:text-3xl">
              {t.whoForTitle}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3 md:gap-6 lg:gap-8">
            {t.whoFor.map((text, i) => (
              <div key={text} className="relative px-2 text-center">
                <span
                  className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 font-serif text-[5.5rem] font-bold leading-none text-[#01514E]/[0.07] md:text-[6.5rem]"
                  aria-hidden
                >
                  {String(i + 1)}
                </span>
                <p className="relative z-10 pt-7 font-sans text-sm font-light leading-snug text-[#1c1917]/90 md:pt-8 md:text-base md:leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included — table */}
      <section className={`${CREAM} overflow-x-hidden px-6 py-16 md:px-12 md:py-24 lg:px-0 lg:py-24 lg:pl-0 lg:pr-12 xl:pr-16`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,min(100%,36rem))] lg:items-stretch lg:gap-10 xl:gap-12">
          <motion.div
            className="relative order-2 -mx-6 min-h-[280px] w-[calc(100%+3rem)] overflow-hidden rounded-lg shadow-md ring-1 ring-black/5 md:-mx-12 md:w-[calc(100%+6rem)] lg:order-1 lg:mx-0 lg:h-full lg:min-h-0 lg:w-full lg:rounded-l-none lg:rounded-r-lg lg:shadow-md"
            {...splitFromLeft}
          >
            <FallbackImage
              src={SITE_MEDIA.buyerAgentDining}
              alt="Open-plan dining area with a long wooden table and tropical garden views"
              className="h-full min-h-[280px] w-full object-cover lg:absolute lg:inset-0 lg:min-h-full"
            />
          </motion.div>
          <motion.div className="order-1 lg:order-2 lg:max-w-xl xl:max-w-2xl" {...splitFromRight}>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.06em] text-[#01514E] md:text-3xl">
              {t.stagesTitle}
            </h2>
            <p className="mt-5 font-sans text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">
              {t.stagesIntro}
            </p>
            <div className="mt-6 overflow-x-auto rounded-lg border border-[#01514E]/25 shadow-sm lg:mt-5">
              <table className="w-full min-w-[320px] border-collapse text-left font-sans text-sm text-white">
                <thead>
                  <tr className="bg-[#01514E]">
                    <th className="w-[32%] px-4 py-3 font-semibold tracking-wide md:w-[28%]">{t.stageCol}</th>
                    <th className="px-4 py-3 font-semibold tracking-wide">{t.whatYouGetCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.stages.map((row, i) => (
                    <tr key={row.stage} className={i % 2 === 0 ? "bg-[#0a3d3a]" : "bg-[#0d4542]"}>
                      <td className="px-4 py-3.5 font-semibold">{row.stage}</td>
                      <td className="px-4 py-3.5 text-white/95">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-[#faf8f4] px-6 py-16 md:px-12 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-xl font-bold uppercase leading-snug tracking-[0.05em] text-[#01514E] md:text-3xl">
            {t.compareTitle}
          </h2>
          <div className="mt-10 overflow-x-auto rounded-lg border border-[#01514E]/20 shadow-sm">
            <table className="w-full min-w-[560px] border-collapse text-left font-sans text-sm text-white">
              <thead>
                <tr className="bg-[#01514E]">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">{t.compareFeature}</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">{t.compareBuyer}</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">{t.compareSeller}</th>
                </tr>
              </thead>
              <tbody>
                {t.compareRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-[#0a3d3a]" : "bg-[#0d4542]"}>
                    <td className="border-t border-white/10 px-4 py-3.5 font-medium text-white">{row.feature}</td>
                    <td className="border-t border-white/10 px-4 py-3.5 text-white/90">{row.buyer}</td>
                    <td className="border-t border-white/10 px-4 py-3.5 text-white/90">{row.seller}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What's included — detail */}
      <section className={`${CREAM} overflow-x-hidden px-6 py-16 md:px-12 md:py-24 lg:px-0 lg:py-24 lg:pl-12 xl:pl-16 lg:pr-0`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,min(100%,36rem))_1fr] lg:items-stretch lg:gap-10 xl:gap-12">
          <motion.div className="lg:max-w-xl xl:max-w-2xl" {...splitFromLeft}>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.06em] text-[#01514E] md:text-3xl">
              {t.includedDetailTitle}
            </h2>
            <ul className="mt-5 space-y-5 md:mt-6 md:space-y-5 lg:mt-5 lg:space-y-4">
              {t.includedDetail.map((item) => (
                <li key={item.title}>
                  <h3 className="font-serif text-lg font-bold text-[#01514E] md:text-xl">{item.title}</h3>
                  <p className="mt-1.5 font-sans text-base font-light leading-snug text-[#1c1917]/88 md:leading-relaxed">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="relative -mx-6 min-h-[280px] w-[calc(100%+3rem)] overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 md:-mx-12 md:w-[calc(100%+6rem)] lg:mx-0 lg:h-full lg:min-h-0 lg:w-full lg:rounded-l-lg lg:rounded-r-none lg:shadow-lg"
            {...splitFromRight}
          >
            <FallbackImage
              src={SITE_MEDIA.buyerAgentVillaExterior}
              alt="Modern dark-rendered home with full-height glass doors set in tropical garden"
              className="aspect-[3/4] h-full w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:min-h-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Pricing & terms */}
      <section className={`${PRICING_SECTION_BG} overflow-x-hidden px-6 py-16 md:px-12 md:py-24 lg:px-0 lg:py-24 lg:pl-0 lg:pr-12 xl:pr-16`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,min(100%,36rem))] lg:items-center lg:gap-12 xl:gap-16">
          <motion.div
            className="relative order-2 -mx-6 min-h-[220px] w-[calc(100%+3rem)] overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 md:-mx-12 md:w-[calc(100%+6rem)] lg:order-1 lg:mx-0 lg:min-h-[320px] lg:w-full lg:max-h-[min(520px,65vh)] lg:rounded-l-none lg:rounded-r-lg lg:shadow-lg"
            {...splitFromLeft}
          >
            <FallbackImage
              src={SITE_MEDIA.buyerAgentKitchen}
              alt="Minimal black home at dusk with warm interior light, path, and tropical trees"
              className="aspect-[16/10] h-full w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:min-h-[320px] lg:max-h-[min(520px,65vh)]"
            />
          </motion.div>
          <motion.div className="order-1 lg:order-2 lg:max-w-xl xl:max-w-2xl" {...splitFromRight}>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.08em] text-[#01514E] md:text-3xl">
              {t.pricingTitle}
            </h2>
            <ul className="mt-8 list-disc space-y-4 pl-5 font-sans text-base font-light leading-relaxed text-[#1c1917]/88 marker:text-[#01514E]">
              {t.pricingBullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Enquiry */}
      <section id="apply" className={`${CREAM} scroll-mt-24 px-6 py-10 md:px-12 md:py-14`}>
        <div className="container mx-auto max-w-4xl">
          <div className="mb-5 text-center">
            <h2 className="font-serif text-2xl font-bold uppercase leading-tight tracking-[0.04em] text-[#01514E] md:text-4xl lg:text-[2.35rem]">
              <MultilineTitle text={t.ctaTitle} />
            </h2>
            <p className="mt-4 font-sans text-lg font-medium text-[#01514E]/95 md:text-xl">{t.ctaSub1}</p>
            <p className="mx-auto mt-3 max-w-xl font-sans text-base font-light leading-relaxed text-[#1c1917]/85 md:mt-4">
              {t.ctaSub2}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-[#01514E]/12 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(1,81,78,0.16)] md:p-6"
          >
            <BuyerAgentAssistanceForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
