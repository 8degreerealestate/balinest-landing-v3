import { useState } from "react";
import { motion } from "framer-motion";
import { CrmInlineForm } from "@/components/site/CrmInlineForm";
import { Seo } from "@/components/site/Seo";
import { SITE_MEDIA } from "@/lib/site-assets";
import { truncateForMeta } from "@/lib/site-seo";
import { cn } from "@/lib/utils";
import { useSiteCopy } from "@/lib/site-language";
import { SELLER_AGENT_COPY } from "@/lib/i18n/seller-agent";

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

export default function SellerAgentPage() {
  const t = useSiteCopy(SELLER_AGENT_COPY);

  return (
    <div className="min-h-screen bg-[#f4f1ea] font-sans text-[#0a2f2c] antialiased">
      <Seo title={t.seoTitle} description={truncateForMeta(t.seoDescription)} path="/seller-agents" />

      {/* Hero */}
      <section className="relative min-h-[min(70dvh,640px)] w-full overflow-hidden">
        <FallbackImage
          src={SITE_MEDIA.sellerAgentHero}
          alt="Open-plan living and kitchen with warm wood tones and natural light"
          className="hero-image-breathe absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25" />
        <div className="relative z-10 flex min-h-[min(70dvh,640px)] flex-col justify-end px-6 pb-14 pt-28 md:px-12 md:pb-20">
          <div className="container mx-auto max-w-6xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl font-serif text-3xl font-bold uppercase leading-[1.12] tracking-[0.06em] text-white md:text-5xl lg:text-[3rem]"
            >
              <span className="block">{t.heroLine1}</span>
              <span className="mt-1 block md:mt-1.5">{t.heroLine2}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/90 md:text-base"
            >
              {t.heroSub}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Partnership intro + pillars */}
      <section className="bg-[#F9F9F7] px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="mx-auto max-w-4xl text-center text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">
              {t.intro}
            </p>
          </motion.div>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10 lg:gap-12">
            {t.pillars.map((col, i) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#01514E] md:text-sm">
                  {col.title}
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-[#1c1917]/85 md:text-base">{col.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership application */}
      <section id="apply" className="scroll-mt-24 bg-[#f4f1ea] px-6 py-10 md:px-12 md:py-14">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#01514E]">{t.applyLabel}</p>
            <h2 className="mt-2 font-serif text-2xl font-bold uppercase leading-tight tracking-[0.05em] text-[#01514E] md:text-3xl">
              {t.applyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-light leading-relaxed text-[#1c1917]/75 md:text-base">
              {t.applySub}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-[#01514E]/12 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(1,81,78,0.16)] md:p-6"
          >
            <CrmInlineForm form="seller-agent" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
