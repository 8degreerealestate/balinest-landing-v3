import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { truncateForMeta } from "@/lib/site-seo";
import { SITE_MEDIA } from "@/lib/site-assets";
import { INVEST_PAGE_COPY } from "@/lib/invest-page-i18n";
import { useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/lib/utils";
import { IncLogo } from "@/components/invest/IncLogo";
import { InvestInvitationForm } from "@/components/invest/InvestInvitationForm";

const INVEST_CREAM = "bg-[#fdfbf7]";
const INVEST_INVITATION_BG = "#f4f1ea";
const INVEST_DARK = "#0d4542";
const INVEST_DARK_DEEP = "#082f2d";
const INVEST_LIME = "#b8e29d";

function InvestPageHeroImage({ className }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);

  return (
    <img
      src={useFallback ? SITE_MEDIA.heroStill : SITE_MEDIA.investIncHero}
      alt=""
      className={className}
      loading="eager"
      decoding="async"
      onError={() => setUseFallback(true)}
    />
  );
}

const INVITATION_SECTION_ID = "invest-invitation";

function scrollToInvitationForm() {
  document.getElementById(INVITATION_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Invest() {
  const language = useSiteLanguage();
  const copy = INVEST_PAGE_COPY[language];

  useEffect(() => {
    if (window.location.hash !== `#${INVITATION_SECTION_ID}`) return;
    const timer = window.setTimeout(() => scrollToInvitationForm(), 100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#082f2d]">
      <Seo
        title={copy.seoTitle}
        description={truncateForMeta(copy.seoDescription)}
        path="/invest"
      />

      {/* Hero — full-bleed image + breathe (same pattern as other pages) */}
      <section
        className="relative flex min-h-[min(88dvh,820px)] w-full flex-col overflow-hidden pt-[calc(env(safe-area-inset-top,0px)+5.25rem)] md:pt-[calc(env(safe-area-inset-top,0px)+5.75rem)]"
        aria-label={copy.heroAria}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <InvestPageHeroImage className="hero-image-breathe h-full w-full object-cover object-center" />
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#082f2d]/75 via-[#0d4542]/50 to-black/55"
            aria-hidden
          />
        </div>

        {/* In-hero bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 border-b border-white/10"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 md:px-10 md:py-6">
            <p className="shrink-0 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-white/45 md:text-[11px]">
              {copy.byInvitation}
            </p>
            <div className="flex min-w-0 items-center gap-4 md:gap-5">
              <img
                src="/brand/8degree-logotype-white-transparent.png"
                alt="8 Degree"
                className="h-6 w-auto max-w-[min(100%,11rem)] shrink-0 object-contain md:h-7"
                width={190}
                height={28}
              />
              <span className="shrink-0 text-base font-light leading-none text-white/45 md:text-lg" aria-hidden>
                ×
              </span>
              <IncLogo className="shrink-0" />
            </div>
          </div>
        </motion.div>

        {/* Copy */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-12 lg:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-sans text-[10px] font-semibold uppercase tracking-[0.32em] md:text-[11px]"
            style={{ color: INVEST_LIME }}
          >
            {copy.heroKicker}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="mt-6 max-w-3xl font-serif text-[2rem] font-bold leading-[1.12] tracking-[0.02em] text-white md:mt-8 md:text-[2.65rem] lg:text-[3.15rem] lg:leading-[1.1]"
          >
            {copy.heroLine1Before}
            <em className="font-bold italic" style={{ color: INVEST_LIME }}>
              {copy.heroLine1Em}
            </em>
            {copy.heroLine1After}
            <br />
            {copy.heroLine2}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="mt-6 max-w-lg font-sans text-sm font-light leading-relaxed text-white/88 md:mt-8 md:text-base md:leading-[1.7]"
          >
            {copy.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="mt-10 md:mt-12"
          >
            <button
              type="button"
              onClick={scrollToInvitationForm}
              className={cn(
                "group inline-flex items-center gap-3 px-7 py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] transition-[filter,transform]",
                "hover:brightness-[1.03] active:scale-[0.99]",
              )}
              style={{ backgroundColor: INVEST_LIME, color: INVEST_DARK }}
            >
              {copy.ctaBrief}
              <ArrowRight
                className="size-4 stroke-[2] transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 01 — What is INC */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-3xl"
        >
          <p
            className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: INVEST_DARK }}
          >
            {copy.s01Kicker}
          </p>
          <h2 className="mt-6 font-serif text-[2rem] font-normal leading-[1.15] tracking-[0.01em] text-[#1c1917] md:mt-8 md:text-[2.35rem] lg:text-[2.65rem]">
            {copy.s01TitleBefore}
            <em className="font-bold italic" style={{ color: INVEST_DARK }}>
              {copy.s01TitleEm}
            </em>
            {copy.s01TitleAfter}
          </h2>
          <ul className="mt-10 border-t md:mt-12" style={{ borderColor: `${INVEST_DARK}22` }}>
            {copy.whatIsInc.map((item) => (
              <li key={item} className="border-b" style={{ borderColor: `${INVEST_DARK}18` }}>
                <div
                  className={cn(
                    "group -mx-1 flex gap-4 border border-transparent px-4 py-5 transition-[transform,border-color,box-shadow] duration-300 ease-out md:-mx-2 md:px-5 md:py-6",
                    "hover:-translate-y-0.5 hover:border-[#0d4542] hover:shadow-[0_8px_28px_rgba(13,69,66,0.08)]",
                  )}
                >
                  <span
                    className="mt-2.5 h-px w-5 shrink-0 bg-[#0d4542]/35 transition-colors duration-300 group-hover:bg-[#0d4542] md:mt-3 md:w-6"
                    aria-hidden
                  />
                  <span className="font-sans text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.65]">
                    {item}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* 02 — Where we build */}
      <section
        className="px-6 py-16 md:py-20 lg:py-24"
        style={{ backgroundColor: INVEST_DARK_DEEP }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl"
        >
          <p
            className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: INVEST_LIME }}
          >
            {copy.s02Kicker}
          </p>
          <h2 className="mt-6 font-serif text-[2rem] font-normal leading-[1.15] tracking-[0.01em] text-white md:mt-8 md:text-[2.35rem] lg:text-[2.65rem]">
            {copy.s02TitleBefore}
            <em className="font-bold italic" style={{ color: INVEST_LIME }}>
              {copy.s02TitleEm}
            </em>
            {copy.s02TitleAfter}
          </h2>

          <ul className="mt-10 grid grid-cols-1 gap-4 overflow-visible sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-5">
            {copy.whereWeBuild.map((field, index) => (
              <motion.li
                key={field.title}
                className="h-full"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <article
                  className={cn(
                    "group relative z-0 flex h-full min-h-[200px] flex-col rounded-sm px-6 py-7 md:min-h-[220px] md:px-7 md:py-8",
                    "ring-1 ring-inset ring-transparent transition-[transform,box-shadow,ring-color] duration-300 ease-out",
                    "hover:z-10 hover:-translate-y-1 hover:ring-[#b8e29d] hover:shadow-[0_0_0_1px_#b8e29d,0_12px_40px_rgba(8,47,45,0.55)]",
                  )}
                  style={{ backgroundColor: INVEST_DARK }}
                >
                  <p
                    className="font-serif text-sm font-normal md:text-base"
                    style={{ color: INVEST_LIME }}
                  >
                    {field.numeral}
                  </p>
                  <h3 className="mt-4 font-serif text-xl font-normal text-white md:text-[1.35rem]">
                    {field.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm font-light leading-relaxed text-white/50 md:mt-4 md:text-[0.9375rem] md:leading-[1.65]">
                    {field.description}
                  </p>
                </article>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* 03 — How we work */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-3xl"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em]">
            <span className="text-[#1c1917]/35">{copy.s03KickerMuted}</span>{" "}
            <span style={{ color: INVEST_DARK }}>{copy.s03Kicker}</span>
          </p>
          <h2 className="mt-6 font-serif text-[2rem] font-normal leading-[1.15] tracking-[0.01em] text-[#1c1917] md:mt-8 md:text-[2.35rem] lg:text-[2.65rem]">
            {copy.s03TitleBefore}
            <em className="font-bold italic" style={{ color: INVEST_DARK }}>
              {copy.s03TitleEm}
            </em>
            {copy.s03TitleAfter}
          </h2>
          <ul className="mt-10 border-t md:mt-12" style={{ borderColor: `${INVEST_DARK}22` }}>
            {copy.howWeWork.map((item) => (
              <li key={item} className="border-b" style={{ borderColor: `${INVEST_DARK}18` }}>
                <div
                  className={cn(
                    "group -mx-1 flex gap-4 border border-transparent px-4 py-5 transition-[transform,border-color,box-shadow] duration-300 ease-out md:-mx-2 md:px-5 md:py-6",
                    "hover:-translate-y-0.5 hover:border-[#0d4542] hover:shadow-[0_8px_28px_rgba(13,69,66,0.08)]",
                  )}
                >
                  <span
                    className="mt-2.5 h-px w-5 shrink-0 bg-[#0d4542]/35 transition-colors duration-300 group-hover:bg-[#0d4542] md:mt-3 md:w-6"
                    aria-hidden
                  />
                  <span className="font-sans text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.65]">
                    {item}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
      {/* 04 — Why investors partner with INC */}
      <section
        className="px-6 py-16 md:py-20 lg:py-24"
        style={{ backgroundColor: INVEST_DARK_DEEP }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-3xl"
        >
          <p
            className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: INVEST_LIME }}
          >
            {copy.s04Kicker}
          </p>
          <h2 className="mt-6 font-serif text-[2rem] font-normal leading-[1.15] tracking-[0.01em] text-white md:mt-8 md:text-[2.35rem] lg:text-[2.65rem]">
            {copy.s04TitleBefore}
            <em className="font-bold italic" style={{ color: INVEST_LIME }}>
              {copy.s04TitleEm}
            </em>
            {copy.s04TitleAfter}
          </h2>
          <ul className="mt-10 border-t border-white/12 md:mt-12">
            {copy.whyInvestors.map((item) => (
              <li key={item} className="border-b border-white/10">
                <div
                  className={cn(
                    "group -mx-1 flex gap-4 border border-transparent px-4 py-5 transition-[transform,border-color,box-shadow] duration-300 ease-out md:-mx-2 md:px-5 md:py-6",
                    "hover:-translate-y-0.5 hover:border-[#b8e29d] hover:shadow-[0_8px_28px_rgba(8,47,45,0.4)]",
                  )}
                >
                  <span
                    className="mt-2.5 h-px w-5 shrink-0 bg-[#b8e29d]/35 transition-colors duration-300 group-hover:bg-[#b8e29d] md:mt-3 md:w-6"
                    aria-hidden
                  />
                  <span className="font-sans text-sm font-light leading-relaxed text-white/75 md:text-base md:leading-[1.65]">
                    {item}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
      {/* 05 — Where your capital goes */}
      <section className={cn(INVEST_CREAM, "px-6 py-16 md:py-20 lg:py-24")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-3xl"
        >
          <p
            className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: INVEST_DARK }}
          >
            {copy.s05Kicker}
          </p>
          <h2 className="mt-6 font-serif text-[2rem] font-normal leading-[1.15] tracking-[0.01em] text-[#1c1917] md:mt-8 md:text-[2.35rem] lg:text-[2.65rem]">
            {copy.s05TitleBefore}
            <em className="font-bold italic" style={{ color: INVEST_DARK }}>
              {copy.s05TitleEm}
            </em>
            {copy.s05TitleAfter}
          </h2>
          <ul className="mt-10 border-t md:mt-12" style={{ borderColor: `${INVEST_DARK}22` }}>
            {copy.whereCapital.map((item) => (
              <li key={item} className="border-b" style={{ borderColor: `${INVEST_DARK}18` }}>
                <div
                  className={cn(
                    "group -mx-1 flex gap-4 border border-transparent px-4 py-5 transition-[transform,border-color,box-shadow] duration-300 ease-out md:-mx-2 md:px-5 md:py-6",
                    "hover:-translate-y-0.5 hover:border-[#0d4542] hover:shadow-[0_8px_28px_rgba(13,69,66,0.08)]",
                  )}
                >
                  <span
                    className="mt-2.5 h-px w-5 shrink-0 bg-[#0d4542]/35 transition-colors duration-300 group-hover:bg-[#0d4542] md:mt-3 md:w-6"
                    aria-hidden
                  />
                  <span className="font-sans text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.65]">
                    {item}
                  </span>
                </div>
              </li>
            ))}
            <li className="border-b" style={{ borderColor: `${INVEST_DARK}18` }}>
              <div
                className={cn(
                  "group -mx-1 flex gap-4 border border-transparent px-4 py-5 transition-[transform,border-color,box-shadow] duration-300 ease-out md:-mx-2 md:px-5 md:py-6",
                  "hover:-translate-y-0.5 hover:border-[#0d4542] hover:shadow-[0_8px_28px_rgba(13,69,66,0.08)]",
                )}
              >
                <span
                  className="mt-2.5 h-px w-5 shrink-0 bg-[#0d4542]/35 transition-colors duration-300 group-hover:bg-[#0d4542] md:mt-3 md:w-6"
                  aria-hidden
                />
                <span className="flex flex-wrap items-center gap-x-2 gap-y-2 font-sans text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.65]">
                  {copy.minimumCheckLabel}{" "}
                  <span
                    className="inline-block px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-white md:text-sm"
                    style={{ backgroundColor: INVEST_DARK }}
                  >
                    USD 50,000
                  </span>
                </span>
              </div>
            </li>
          </ul>
        </motion.div>
      </section>

      {/* 06 — The invitation */}
      <section
        id={INVITATION_SECTION_ID}
        className="scroll-mt-24 px-6 py-16 md:py-20 lg:pb-28 lg:pt-24"
        style={{ backgroundColor: INVEST_INVITATION_BG }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div>
              <p
                className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: INVEST_DARK }}
              >
                {copy.s06Kicker}
              </p>
              <h2 className="mt-6 font-serif text-[2rem] font-normal leading-[1.15] tracking-[0.01em] text-[#1c1917] md:mt-8 md:text-[2.35rem] lg:text-[2.65rem]">
                {copy.s06TitleBefore}
                <em className="font-bold italic" style={{ color: INVEST_DARK }}>
                  {copy.s06TitleEm}
                </em>
                {copy.s06TitleAfter}
              </h2>
              <div className="mt-8 space-y-5 font-sans text-sm font-light leading-relaxed text-[#1c1917]/70 md:mt-10 md:text-base md:leading-[1.7]">
                <p>{copy.invitationP1}</p>
                <p>{copy.invitationP2}</p>
              </div>
              <div className="mt-10 md:mt-12">
                <p className="font-serif text-xl font-normal italic text-[#1c1917] md:text-2xl">Robert Minasov</p>
                <p className="mt-2 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#1c1917]/45 md:text-[11px]">
                  {copy.signatureRole}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#0d4542]/12 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(13,69,66,0.16)] md:p-6">
              <InvestInvitationForm />
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
