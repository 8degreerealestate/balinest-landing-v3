import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroMedia } from "@/components/site/HeroMedia";
import { PortfolioShowcase } from "@/components/site/PortfolioShowcase";
import { FeaturedInventoryStrip } from "@/components/site/FeaturedInventoryStrip";
import { PropertySearchPanel } from "@/components/site/PropertySearchPanel";
import { TopAreaImage } from "@/components/site/TopAreaImage";
import { useGetFeaturedProjects, useListBlogPosts } from "@workspace/api-client-react";
import { loadLatestJournalPosts } from "@/lib/journal-static-fallback";
import { journalPostPath } from "@/lib/journal-paths";
import { useLiteMotion } from "@/lib/use-lite-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Seo } from "@/components/site/Seo";
import {
  canonicalUrl,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  truncateForMeta,
} from "@/lib/site-seo";
import { buildSiteGraph, faqPageJsonLd } from "@/lib/seo-migration/schema";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import {
  HOME_ADVANTAGE_BAND,
  HOME_FAQ_BAND,
  HOME_TESTIMONIALS_BAND,
} from "@/lib/home-section-surfaces";
import { HOME_COPY } from "@/lib/i18n/home-copy";

type AdvantageStatRow = { value: string; description: string };

/** Homepage “Our advantage” stats (2×2 grid). */
const ADVANTAGE_STATS: Record<SiteLanguage, AdvantageStatRow[]> = {
  en: [
    { value: "5 Years", description: "in the Bali Market" },
    { value: "10+", description: "Transactions Above IDR 16B in 2025" },
    { value: "10-12%", description: "Proven Portfolio ROI Annually" },
    { value: "Off-Market", description: "Selective Investment Opportunities" },
  ],
  id: [
    { value: "5 Tahun", description: "di pasar Bali" },
    { value: "10+", description: "Transaksi di atas IDR 16B pada 2025" },
    { value: "10-12%", description: "ROI portofolio terbukti per tahun" },
    { value: "Off-market", description: "Peluang investasi selektif" },
  ],
  fr: [
    { value: "5 ans", description: "sur le marche balinais" },
    { value: "10+", description: "Transactions superieures a 16 Mds IDR en 2025" },
    { value: "10-12%", description: "ROI de portefeuille eprouve par an" },
    { value: "Hors marche", description: "Opportunites d'investissement selectives" },
  ],
  zh: [
    { value: "5 年", description: "深耕巴厘岛市场" },
    { value: "10+", description: "2025 年超 160 亿印尼盾成交" },
    { value: "10-12%", description: "经证实的年化组合回报" },
    { value: "非公开市场", description: "精选投资机会" },
  ],
  tr: [
    { value: "5 Yil", description: "Bali pazarinda" },
    { value: "10+", description: "2025'te 16B IDR uzeri islemler" },
    { value: "10-12%", description: "Kanıtlanmış yıllık portföy getirisi" },
    { value: "Off-market", description: "Secici yatirim firsatlari" },
  ],
};

const LATEST_NEWS_COUNT = 3;
const JOURNAL_CARD_IMAGE_FALLBACK = "/site-media/journal-hero.png";

type FaqItem = { id: string; q: string; a: string };

type TestimonialTemplate = { id: string; name: string; quote: string; avatarUrl: string; meta?: string };

const TESTIMONIAL_TEMPLATES: TestimonialTemplate[] = [
  {
    id: "testimonial-yun-xuan-yeong",
    name: "Yun Xuan Yeong",
    avatarUrl: "/testimonial-image-1.png",
    quote:
      "The team really knows their stuff when it comes to real estate. They took the time to explain things clearly, answered all my questions, and helped me find the right property that fit our goals.\n\nI never felt pressured, and they were responsive throughout the whole process. If you’re thinking about getting into real estate or just want a solid investment partner, I definitely recommend checking them out.",
  },
  {
    id: "testimonial-anabella-rosalina",
    name: "Anabella Rosalina",
    avatarUrl: "/testimonial-image-2.png",
    quote:
      "I had such a great experience with 8 Degree Real Estate! The team is highly professional, friendly, and genuinely passionate about helping clients find the perfect property in Bali. Their attention to detail, transparency, and knowledge of the market made the whole process smooth and stress-free. I would definitely recommend 8 Degree to anyone looking for a villa or investment property in Bali!",
  },
  {
    id: "testimonial-caroline-peterson",
    name: "Caroline Peterson",
    avatarUrl: "/testimonial-image-3.png",
    quote:
      "I had an amazing experience with 8 Degree Real Estate. The team was very professional and clear throughout the entire process, making everything smooth from start to finish!",
  },
  {
    id: "testimonial-er-xiang-guan",
    name: "ER Xiang Guan",
    avatarUrl: "/testimonial-image-4.png",
    quote:
      "Professional staff. Giving good advice and recommendation, good vibes and easy to communicate. I highly recommend it.",
  },
  {
    id: "testimonial-pt-bakhitah-samya-yumna",
    name: "PT Bakhitah Samya Yumna",
    avatarUrl: "/testimonial-image-5.png",
    quote:
      "A very pleasant and satisfying experience provided by the 8 Degree team during the process of finding land for my business. Thank you for the great service, guys!",
  },
  {
    id: "testimonial-design-jiechen",
    name: "Design JieChen",
    avatarUrl: "/testimonial-image-6.png",
    quote:
      "Professional services and nice kindly advice always. Recommend for the team! Especially Maya.",
  },
  {
    id: "testimonial-kemal-kahraman",
    name: "Kemal Kahraman",
    avatarUrl: "/testimonial-image-7.png",
    quote:
      "They are the most professional real estate company I have worked with and met so far. They were very helpful throughout the entire process and handled everything in a highly professional manner. I would also like to give special thanks to Maya.",
  },
];

const FAQ_ITEMS: Record<SiteLanguage, FaqItem[]> = {
  en: [
    {
      id: "faq-leasehold-freehold",
      q: "What’s the difference between leasehold and freehold?",
      a: "Freehold is full ownership of the property with no time limit. It’s available to Indonesian citizens and can also be accessed by foreigners through a PT PMA structure.\n\nLeasehold gives you the right to use and control a property for a fixed period, with possible extension options. It’s the most common and straightforward option for foreign buyers in Bali.",
    },
    {
      id: "faq-need-to-be-in-bali",
      q: "Do I need to be in Bali to buy?",
      a: "No, you can view properties remotely and sign via legal authorization if needed.\n\nWhat is the buying process?\nYou choose a property, send an LOI, we run due diligence, then proceed with deposit, contract signing, and handover through a notary.",
    },
    {
      id: "faq-good-investment",
      q: "Is Bali property a good investment?",
      a: "It can be, if the location, build quality, and legal structure are right. We give realistic numbers based on the current market.",
    },
    {
      id: "faq-rent-it-out",
      q: "Can I rent the property out?",
      a: "Yes. Many buyers combine personal use and rental income. Professional management can handle everything end-to-end.",
    },
    {
      id: "faq-mortgage-foreigner",
      q: "Can I get a mortgage as a foreigner?",
      a: "Most purchases are cash or developer installments. Financing options for foreigners are limited.",
    },
  ],
  id: [
    {
      id: "faq-leasehold-freehold",
      q: "Apa perbedaan leasehold dan freehold?",
      a: "Freehold adalah kepemilikan penuh properti tanpa batas waktu. Tersedia untuk warga negara Indonesia dan juga dapat diakses oleh orang asing melalui struktur PT PMA.\n\nLeasehold memberi Anda hak menggunakan dan mengendalikan properti untuk periode tertentu, dengan opsi perpanjangan yang mungkin. Ini adalah opsi paling umum dan paling mudah bagi pembeli asing di Bali.",
    },
    {
      id: "faq-need-to-be-in-bali",
      q: "Apakah saya harus berada di Bali untuk membeli?",
      a: "Tidak, Anda dapat melihat properti dari jarak jauh dan menandatangani melalui kuasa hukum jika diperlukan.\n\nBagaimana proses pembeliannya?\nAnda memilih properti, mengirim LOI, kami menjalankan due diligence, lalu melanjutkan dengan deposit, penandatanganan kontrak, dan serah terima melalui notaris.",
    },
    {
      id: "faq-good-investment",
      q: "Apakah properti di Bali investasi yang baik?",
      a: "Bisa, jika lokasi, kualitas bangunan, dan struktur hukumnya tepat. Kami memberikan angka yang realistis berdasarkan kondisi pasar saat ini.",
    },
    {
      id: "faq-rent-it-out",
      q: "Bisakah saya menyewakan properti?",
      a: "Ya. Banyak pembeli menggabungkan penggunaan pribadi dan pendapatan sewa. Manajemen profesional dapat menangani semuanya dari awal hingga akhir.",
    },
    {
      id: "faq-mortgage-foreigner",
      q: "Bisakah saya mendapatkan KPR sebagai orang asing?",
      a: "Sebagian besar pembelian dilakukan tunai atau cicilan ke developer. Opsi pembiayaan untuk orang asing terbatas.",
    },
  ],
  fr: [
    {
      id: "faq-leasehold-freehold",
      q: "Quelle est la différence entre leasehold et freehold ?",
      a: "Le freehold est la pleine propriété du bien, sans limite de durée. Il est accessible aux citoyens indonésiens et peut aussi l'être aux étrangers via une structure PT PMA.\n\nLe leasehold vous donne le droit d'utiliser et de contrôler un bien pour une période fixe, avec des options de prolongation possibles. C'est l'option la plus courante et la plus simple pour les acheteurs étrangers à Bali.",
    },
    {
      id: "faq-need-to-be-in-bali",
      q: "Dois-je être à Bali pour acheter ?",
      a: "Non, vous pouvez visiter les biens à distance et signer par procuration si nécessaire.\n\nQuel est le processus d'achat ?\nVous choisissez un bien, envoyez une LOI, nous réalisons la due diligence, puis nous procédons à l'acompte, à la signature du contrat et à la remise des clés via un notaire.",
    },
    {
      id: "faq-good-investment",
      q: "L'immobilier à Bali est-il un bon investissement ?",
      a: "Oui, si l'emplacement, la qualité de construction et la structure juridique sont adaptés. Nous fournissons des chiffres réalistes basés sur le marché actuel.",
    },
    {
      id: "faq-rent-it-out",
      q: "Puis-je louer le bien ?",
      a: "Oui. De nombreux acheteurs combinent usage personnel et revenus locatifs. Une gestion professionnelle peut tout prendre en charge de bout en bout.",
    },
    {
      id: "faq-mortgage-foreigner",
      q: "Puis-je obtenir un prêt immobilier en tant qu'étranger ?",
      a: "La plupart des achats se font comptant ou via des versements au promoteur. Les options de financement pour les étrangers restent limitées.",
    },
  ],
  zh: [
    {
      id: "faq-leasehold-freehold",
      q: "租赁权（leasehold）与永久产权（freehold）有何区别？",
      a: "永久产权是对房产的完全所有权，没有时间限制。印尼公民可直接持有，外国人也可通过 PT PMA 结构获得。\n\n租赁权允许您在固定期限内使用和管控房产，并可能享有续期选项。这是外国买家在巴厘岛最常见、也最直接的持有方式。",
    },
    {
      id: "faq-need-to-be-in-bali",
      q: "购买房产是否必须人在巴厘岛？",
      a: "不必。您可以远程看房，并在需要时通过法律授权签署文件。\n\n购买流程是怎样的？\n您选定房产、提交意向书（LOI），我们进行尽职调查，然后通过公证人完成定金、签约与交房。",
    },
    {
      id: "faq-good-investment",
      q: "巴厘岛房产是好的投资吗？",
      a: "在区位、建筑质量和法律结构都合适的前提下，可以是。我们会根据当前市场给出务实的数字预期。",
    },
    {
      id: "faq-rent-it-out",
      q: "可以把房产出租吗？",
      a: "可以。许多买家会兼顾自住与租金收入。专业物业管理可端到端打理一切。",
    },
    {
      id: "faq-mortgage-foreigner",
      q: "外国人可以申请房贷吗？",
      a: "多数交易为全款或向开发商分期付款。面向外国人的融资选择较为有限。",
    },
  ],
  tr: [
    {
      id: "faq-leasehold-freehold",
      q: "Leasehold ile freehold arasındaki fark nedir?",
      a: "Freehold, süre sınırı olmayan tam mülkiyettir. Endonezya vatandaşları için geçerlidir; yabancılar PT PMA yapısı üzerinden de erişebilir.\n\nLeasehold, belirli bir süre için mülkü kullanma ve yönetme hakkı verir; uzatma seçenekleri mümkün olabilir. Bali'de yabancı alıcılar için en yaygın ve en pratik yoldur.",
    },
    {
      id: "faq-need-to-be-in-bali",
      q: "Satın almak için Bali'de olmam gerekir mi?",
      a: "Hayır. Mülkleri uzaktan inceleyebilir, gerekirse vekalet ile imzalayabilirsiniz.\n\nSatın alma süreci nasıl işler?\nBir mülk seçersiniz, LOI gönderirsiniz, due diligence yaparız; ardından depozito, sözleşme imzası ve noter aracılığıyla teslim sürecine geçilir.",
    },
    {
      id: "faq-good-investment",
      q: "Bali emlakı iyi bir yatırım mı?",
      a: "Konum, yapı kalitesi ve hukuki yapı doğruysa olabilir. Güncel piyasaya dayalı gerçekçi rakamlar sunuyoruz.",
    },
    {
      id: "faq-rent-it-out",
      q: "Mülkü kiraya verebilir miyim?",
      a: "Evet. Birçok alıcı kişisel kullanım ile kira gelirini birleştirir. Profesyonel yönetim süreci uçtan uca üstlenebilir.",
    },
    {
      id: "faq-mortgage-foreigner",
      q: "Yabancı olarak ipotek alabilir miyim?",
      a: "Satın alımların çoğu nakit veya geliştirici taksitleriyle yapılır. Yabancılar için finansman seçenekleri sınırlıdır.",
    },
  ],
};

export default function Home() {
  const language = useSiteLanguage();
  const t = HOME_COPY[language];
  const { data: featuredProjectsData } = useGetFeaturedProjects();
  const {
    data: blogData,
    isPending: blogPending,
    isFetching: blogFetching,
    isError: blogError,
  } = useListBlogPosts({ limit: 100 });
  const [staticLatestNews, setStaticLatestNews] = useState<
    { id: string; tag: string; title: string; imageUrl: string; href: string }[] | null
  >(null);

  useEffect(() => {
    const apiCount = blogData?.posts?.length ?? 0;
    if (!blogPending && !blogFetching && (blogError || apiCount === 0)) {
      void loadLatestJournalPosts(LATEST_NEWS_COUNT).then((posts) => {
        setStaticLatestNews(
          posts.map((post) => ({
            id: String(post.id),
            tag: post.categoryName ?? "Journal",
            title: post.title,
            imageUrl: post.featuredImageUrl ?? JOURNAL_CARD_IMAGE_FALLBACK,
            href: journalPostPath(post.slug),
          })),
        );
      });
    } else if (apiCount > 0) {
      setStaticLatestNews(null);
    }
  }, [blogData?.posts?.length, blogError, blogPending, blogFetching]);

  const latestNewsCards = useMemo(() => {
    if (staticLatestNews?.length) return staticLatestNews;
    const posts = blogData?.posts ?? [];
    return [...posts]
      .filter((p) => p.published !== false)
      .sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
      )
      .slice(0, LATEST_NEWS_COUNT)
      .map((post) => ({
        id: String(post.id),
        tag: post.categoryName ?? "Journal",
        title: post.title,
        imageUrl: post.featuredImageUrl ?? JOURNAL_CARD_IMAGE_FALLBACK,
        href: journalPostPath(post.slug),
      }));
  }, [staticLatestNews, blogData?.posts]);

  const latestNewsLoading = (blogPending || blogFetching) && latestNewsCards.length === 0;

  const faqItems = (FAQ_ITEMS[language]?.length ? FAQ_ITEMS[language] : FAQ_ITEMS.en) satisfies FaqItem[];
  const homeJsonLd = useMemo(() => {
    const faqNode = faqPageJsonLd(
      faqItems.map((item) => ({
        question: item.q,
        answer: item.a.replace(/\n\n/g, " "),
      })),
    );
    return buildSiteGraph([
      { "@type": "WebSite", name: SITE_NAME, url: canonicalUrl("/") },
      ...(faqNode ? [faqNode] : []),
    ]);
  }, [faqItems]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqItems[0]?.id ?? null);

  useEffect(() => {
    const items = FAQ_ITEMS[language]?.length ? FAQ_ITEMS[language] : FAQ_ITEMS.en;
    setOpenFaqId(items[0]?.id ?? null);
  }, [language]);

  const liteMotion = useLiteMotion();

  const searchLabels = {
    searchHeadline: t.searchHeadline,
    propertyType: t.propertyType,
    area: t.area,
    bedrooms: t.bedrooms,
    ownership: t.ownership,
    priceRange: t.priceRange,
    devStatus: t.devStatus,
    propertyCode: t.propertyCode,
    search: t.search,
  };

  return (
    <div className="w-full min-w-0">
      <Seo
        title="Luxury Bali real estate & strategic developments"
        description={truncateForMeta(DEFAULT_DESCRIPTION)}
        path="/"
        jsonLd={homeJsonLd}
      />
      {/* Hero Section */}
      <section className="relative flex h-[100dvh] min-h-[600px] items-center justify-center overflow-x-clip overflow-y-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <HeroMedia />
        </div>
        
        <div className="container relative z-20 mx-auto min-w-0 max-w-full px-4 text-center text-white sm:px-6">
          <motion.h1 
            initial={{ opacity: 0, y: liteMotion ? 12 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: liteMotion ? 0.45 : 1, delay: liteMotion ? 0.05 : 0.2 }}
            className="mx-auto mb-6 max-w-5xl text-center font-serif text-4xl font-bold leading-[1.1] tracking-[0.04em] md:text-6xl md:leading-[1.08] lg:text-7xl lg:leading-[1.06]"
          >
            <span className="block text-balance">{t.heroLine1}</span>
            <span className="block text-balance">{t.heroLine2}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: liteMotion ? 12 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: liteMotion ? 0.45 : 1, delay: liteMotion ? 0.1 : 0.4 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/90 font-light"
          >
            {t.heroSub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: liteMotion ? 12 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: liteMotion ? 0.45 : 1, delay: liteMotion ? 0.15 : 0.6 }}
            className="flex items-center justify-center"
          >
            <Link href="/investment-guide">
              <Button size="lg" variant="outline" className="rounded-none tracking-widest uppercase w-full sm:w-auto h-14 px-8 border-white text-white hover:bg-white hover:text-black">
                {t.investGuide}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <PropertySearchPanel labels={searchLabels} />

      {featuredProjectsData?.projects && featuredProjectsData.projects.length > 0 ? (
        <PortfolioShowcase projects={featuredProjectsData.projects} />
      ) : null}

      <FeaturedInventoryStrip title={t.highlighted} subtitle={t.highlightedSub} viewAllLabel={t.viewAll} />

      {/* Why Invest - Site Overview — text from left, image from right (same timing) */}
      <section className="py-24 text-foreground" style={{ backgroundColor: HOME_ADVANTAGE_BAND }}>
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="text-left"
              initial={{ opacity: 0, x: liteMotion ? 0 : -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: liteMotion ? 0.45 : 1.1, delay: 0, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="mb-6 text-center font-serif text-3xl font-bold uppercase tracking-[0.08em] text-primary md:text-5xl">
                {t.advantage}
              </h2>
              <p className="mb-8 font-light leading-relaxed text-muted-foreground">
                {t.advantageBody}
              </p>

              <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-9">
                {ADVANTAGE_STATS[language].map((row, idx) => (
                  <div key={`${language}-advantage-stat-${idx}`} className="min-w-0">
                    <div className="mb-2 font-serif text-4xl font-light tracking-[0.04em] text-primary">{row.value}</div>
                    <p className="text-pretty font-light leading-relaxed text-muted-foreground">
                      {row.description}
                    </p>
                  </div>
                ))}
              </div>

              <Link href="/about">
                <Button variant="outline" className="h-12 rounded-none px-8 uppercase tracking-widest text-primary">
                  {t.philosophy}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: liteMotion ? 0 : 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: liteMotion ? 0.45 : 1.1, delay: 0, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square overflow-hidden"
            >
              <TopAreaImage alt="8 Degree · Bali property advisory" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest News — journal cards (image + bottom overlay) + primary CTA */}
      <section className="py-24 bg-background">
        <div className="container px-6 mx-auto">
          <div className="mb-10">
            <h2 className="text-center font-serif text-3xl font-bold uppercase tracking-[0.08em] text-primary md:text-5xl">{t.latestNews}</h2>
            <p className="mt-6 w-full text-center font-light leading-relaxed text-muted-foreground">{t.latestNewsSub}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {latestNewsLoading
              ? Array.from({ length: LATEST_NEWS_COUNT }, (_, i) => (
                  <div
                    key={`news-skeleton-${i}`}
                    className="aspect-[16/10] animate-pulse rounded-2xl bg-muted"
                    aria-hidden
                  />
                ))
              : latestNewsCards.map((card) => (
                  <Link key={card.id} href={card.href} className="group block">
                    <article className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                      <img
                        src={card.imageUrl}
                        alt=""
                        role="presentation"
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-transparent" aria-hidden />
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                        <p className="flex items-start gap-2 text-left text-[11px] font-medium uppercase leading-snug tracking-[0.14em] text-white/90">
                          <Tag className="mt-0.5 size-3.5 shrink-0 opacity-90" aria-hidden />
                          <span>{card.tag}</span>
                        </p>
                        <h3 className="mt-3 text-left font-sans text-lg font-bold leading-snug tracking-tight text-white md:text-xl">
                          {card.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/journal">
              <Button className="h-12 rounded-none bg-primary px-10 tracking-widest text-primary-foreground uppercase hover:bg-primary/90">
                {t.viewJournal}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24" style={{ backgroundColor: HOME_TESTIMONIALS_BAND }}>
        <div className="container px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-serif text-3xl font-bold uppercase tracking-[0.08em] text-primary md:text-5xl">{t.clientVoices}</h2>
            <p className="text-muted-foreground">{t.clientVoicesSub}</p>
          </div>

          <Carousel opts={{ align: "center", loop: true }} className="mx-auto w-full max-w-4xl px-1 sm:px-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <CarouselPrevious
                className="static h-10 w-10 shrink-0 translate-x-0 translate-y-0 border-primary/40 bg-background text-primary shadow-sm hover:bg-primary/10 disabled:opacity-40"
                aria-label="Previous testimonial"
              />
              <div className="min-w-0 flex-1">
                <CarouselContent className="-ml-0">
                  {TESTIMONIAL_TEMPLATES.map((row) => (
                    <CarouselItem key={row.id} className="basis-full pl-0">
                      <div className="h-full rounded-2xl border border-border bg-background p-6 sm:p-8">
                        <div className="flex items-center gap-4">
                          <img
                            src={row.avatarUrl}
                            alt={row.name}
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{row.name}</div>
                            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary/80">
                              Client testimony
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4 text-sm font-light leading-relaxed text-muted-foreground">
                          {row.quote.split("\n\n").map((para) => (
                            <p key={para}>{para}</p>
                          ))}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
              <CarouselNext
                className="static h-10 w-10 shrink-0 translate-x-0 translate-y-0 border-primary/40 bg-background text-primary shadow-sm hover:bg-primary/10 disabled:opacity-40"
                aria-label="Next testimonial"
              />
            </div>
          </Carousel>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ backgroundColor: HOME_FAQ_BAND }}>
        <div className="container px-6 mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-bold uppercase tracking-[0.08em] text-primary md:text-5xl">{t.faq}</h2>
          <div className="mt-10">
            {faqItems.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id} className="border-b border-primary/30">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId((prev) => (prev === item.id ? null : item.id))}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-sans text-base font-semibold tracking-[0.02em] text-primary md:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={[
                        "size-5 shrink-0 text-primary transition-transform duration-300",
                        isOpen ? "rotate-180" : "rotate-0",
                      ].join(" ")}
                      aria-hidden
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: liteMotion ? 0.2 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-7 pr-10 text-left text-sm font-light leading-relaxed text-muted-foreground md:text-base">
                      {item.a.split("\n\n").map((para) => (
                        <p key={para} className="mt-3 first:mt-0">
                          {para}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section — same stack pattern as hero (container + centered title + max-w-2xl sub + centered CTA) */}
      <section className="bg-background py-24">
        <div className="container relative mx-auto px-6 text-center">
          <h2 className="mx-auto mb-6 max-w-5xl text-center font-serif text-4xl font-bold leading-[1.1] tracking-[0.04em] text-primary md:text-5xl md:leading-[1.08] lg:text-6xl">
            {t.readyTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground md:text-xl">
            {t.readySub}
          </p>
          <div className="flex items-center justify-center">
            <Link href="/contact">
              <Button size="lg" className="h-14 rounded-none bg-primary px-10 tracking-widest uppercase text-white hover:bg-primary/90">
                {t.schedule}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
