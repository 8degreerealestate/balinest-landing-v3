import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import { useListBlogPosts, useListBlogCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/site/Seo";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { JOURNAL_PATH, journalPostPath } from "@/lib/journal-paths";
import { loadStaticJournalPosts } from "@/lib/journal-static-fallback";
import type { BlogPost } from "@workspace/api-client-react";

export default function Blog() {
  const language = useSiteLanguage();
  const t: Record<SiteLanguage, Record<string, string>> = {
    en: {
      heading: "Insights & Perspectives",
      title: "The Journal",
      heroSub:
        "Market analysis, investment strategy, ownership guidance, and on-the-ground reporting from one of Asia's most dynamic property markets. Our journal covers what serious buyers actually need to know — from zoning shifts and developer due diligence to area deep-dives and emerging investment zones.\n\nRead, watch, and decide with clarity.",
      all: "All",
      empty: "No articles in this category",
      minRead: "min read",
    },
    id: {
      heading: "Insight & Perspektif",
      title: "Jurnal",
      heroSub:
        "Analisis pasar, strategi investasi, panduan kepemilikan, dan pelaporan lapangan dari salah satu pasar properti paling dinamis di Asia. Jurnal kami membahas hal yang benar-benar dibutuhkan pembeli serius — dari perubahan zonasi dan uji tuntas pengembang hingga kajian mendalam kawasan dan zona investasi baru.\n\nBaca, tonton, dan putuskan dengan jelas.",
      all: "Semua",
      empty: "Tidak ada artikel di kategori ini",
      minRead: "mnt baca",
    },
    fr: {
      heading: "Analyses & Perspectives",
      title: "Le Journal",
      heroSub:
        "Analyse de marche, strategie d'investissement, conseils sur la propriete et reportages sur le terrain dans l'un des marches immobiliers les plus dynamiques d'Asie. Notre journal aborde ce dont les acheteurs exigeants ont vraiment besoin — evolutions de zonage, due diligence promoteurs, plongees par quartier et zones emergentes.\n\nLisez, regardez et decidez en toute clarte.",
      all: "Tous",
      empty: "Aucun article dans cette categorie",
      minRead: "min lecture",
    },
    zh: {
      heading: "洞察与观点",
      title: "专栏",
      heroSub:
        "市场分析、投资策略、产权指引与一线报道，聚焦亚洲最具活力的房地产市场之一。专栏深入探讨认真买家真正需要了解的内容——从规划调整、开发商尽调到区域深度解析与新兴投资板块。\n\n阅读、观看，清晰决策。",
      all: "全部",
      empty: "该分类下暂无文章",
      minRead: "分钟阅读",
    },
    tr: {
      heading: "Icgoruler ve Perspektifler",
      title: "Blog",
      heroSub:
        "Pazar analizi, yatirim stratejisi, mulkiyet rehberligi ve Asya'nin en dinamik gayrimenkul pazarlarindan birinde sahadan haberler. Gunlugumuz ciddi alicilarin gercekten bilmesi gerekenleri ele alir — imar degisiklikleri ve gelistirici due diligence'tan bolge derinlemesine incelemelerine ve yukselen yatirim bolgelerine kadar.\n\nOkuyun, izleyin ve net karar verin.",
      all: "Tum",
      empty: "Bu kategoride makale yok",
      minRead: "dk okuma",
    },
  }[language];
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [staticPosts, setStaticPosts] = useState<BlogPost[] | null>(null);
  const { data, isLoading } = useListBlogPosts({ limit: 100 });
  const { data: catData } = useListBlogCategories();

  useEffect(() => {
    void loadStaticJournalPosts().then(setStaticPosts);
  }, []);

  const apiPosts = data?.posts ?? [];
  const sourcePosts = apiPosts.length > 0 ? apiPosts : staticPosts ?? [];
  const posts = [...sourcePosts]
    .filter((p) => !activeCategory || p.categoryName === activeCategory)
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    });
  const showLoading = isLoading && sourcePosts.length === 0;
  const categories =
    catData?.categories ??
    [...new Set(sourcePosts.map((p) => p.categoryName).filter(Boolean))].map((name, i) => ({
      id: i + 1,
      name: name as string,
      slug: (name as string).toLowerCase().replace(/\s+/g, "-"),
    }));

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Journal · Bali property insights"
        description={truncateForMeta(
          "Market analysis, investment strategy, ownership guidance, and on-the-ground reporting from one of Asia's most dynamic property markets.",
        )}
        path={JOURNAL_PATH}
      />
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 min-h-[min(72dvh,720px)] overflow-hidden">
          <div className="absolute inset-0 z-10 bg-black/45" aria-hidden />
          <img
            src="/site-media/journal-hero.png"
            alt=""
            className="hero-image-breathe h-full min-h-[min(72dvh,720px)] w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="relative z-20 mx-auto flex min-h-[min(72dvh,720px)] w-full max-w-6xl flex-col items-center justify-center px-6 py-24 text-center text-white md:py-28">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 w-full text-xs font-medium uppercase tracking-[0.28em] text-white/90"
          >
            {t.heading}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-tight tracking-[0.04em] md:text-6xl"
          >
            {t.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-6 w-full max-w-3xl space-y-4 text-sm font-light leading-relaxed text-white/90 md:text-base"
          >
            {t.heroSub.split("\n\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        {/* Category Filter */}
        <div className="flex gap-3 flex-wrap mb-12">
          <button
            onClick={() => setActiveCategory("")}
            className={`text-xs tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${!activeCategory ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
            data-testid="button-cat-all"
          >
            {t.all}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`text-xs tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${activeCategory === cat.name ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
              data-testid={`button-cat-${cat.slug}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {showLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="h-4 bg-muted animate-pulse w-3/4" />
                <div className="h-4 bg-muted animate-pulse w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="font-serif text-2xl text-primary">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                data-testid={`card-blog-${post.id}`}
              >
                <Link href={journalPostPath(post.slug)}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-video overflow-hidden bg-muted mb-4">
                      {post.featuredImageUrl ? (
                        <img
                          src={post.featuredImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                      )}
                      {post.categoryName && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] tracking-[0.2em] uppercase px-2 py-1">
                          {post.categoryName}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><User size={10} /> {post.author}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {post.readingTime} {t.minRead}</span>
                    </div>
                    <h3 className="font-serif text-xl leading-snug text-primary transition-colors group-hover:text-primary/80 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
