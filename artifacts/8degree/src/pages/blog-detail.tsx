import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, User, ArrowLeft } from "lucide-react";
import { useGetBlogPost, useListBlogPosts, getGetBlogPostQueryKey, useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { JOURNAL_PATH, journalPostPath } from "@/lib/journal-paths";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { articleJsonLd, breadcrumbJsonLd, buildSiteGraph } from "@/lib/seo-migration/schema";
import { getStaticJournalPost, loadStaticJournalPosts } from "@/lib/journal-static-fallback";
import {
  onJournalImageError,
  resolveJournalImageUrl,
  rewriteJournalContentHtml,
} from "@/lib/journal-image-url";
import type { BlogPost } from "@workspace/api-client-react";

export default function BlogDetail() {
  const language = useSiteLanguage();
  const t: Record<SiteLanguage, Record<string, string>> = {
    en: { back: "Back to Journal", ready: "Ready to Invest?", guide: "Download Our Investment Guide", yourName: "Your name", email: "Email address", getGuide: "Get the Guide", related: "Further Reading", minRead: "min read" },
    id: { back: "Kembali ke Jurnal", ready: "Siap Berinvestasi?", guide: "Unduh Panduan Investasi", yourName: "Nama Anda", email: "Alamat email", getGuide: "Dapatkan Panduan", related: "Bacaan Lanjutan", minRead: "mnt baca" },
    fr: { back: "Retour au Journal", ready: "Pret a investir?", guide: "Telecharger le Guide", yourName: "Votre nom", email: "Adresse e-mail", getGuide: "Obtenir le Guide", related: "Lectures Complements", minRead: "min lecture" },
    zh: { back: "返回专栏", ready: "准备投资了吗？", guide: "下载投资指南", yourName: "您的姓名", email: "邮箱地址", getGuide: "获取指南", related: "延伸阅读", minRead: "分钟阅读" },
    tr: { back: "Bloga Don", ready: "Yatirima Hazir misiniz?", guide: "Yatirim Rehberini Indir", yourName: "Adiniz", email: "E-posta", getGuide: "Rehberi Al", related: "Daha Fazla Okuma", minRead: "dk okuma" },
  }[language];
  const [, journalParams] = useRoute("/journal/:slug");
  const [, blogParams] = useRoute("/blog/:slug");
  const [, rootParams] = useRoute("/:slug");
  const slug = journalParams?.slug ?? blogParams?.slug ?? rootParams?.slug ?? "";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const createEnquiry = useCreateEnquiry();
  const { toast } = useToast();

  const [staticPost, setStaticPost] = useState<BlogPost | null>(null);
  const [staticReady, setStaticReady] = useState(false);
  const { data: post, isLoading } = useGetBlogPost(slug, {
    query: { enabled: !!slug, queryKey: getGetBlogPostQueryKey(slug) },
  });
  const { data: relatedData } = useListBlogPosts({ limit: 100 });
  const [staticRelated, setStaticRelated] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!slug) return;
    setStaticReady(false);
    void getStaticJournalPost(slug).then((p) => {
      setStaticPost(p);
      setStaticReady(true);
    });
  }, [slug]);

  useEffect(() => {
    if (post) setStaticPost(null);
  }, [post]);

  useEffect(() => {
    if ((relatedData?.posts?.length ?? 0) > 0) return;
    void loadStaticJournalPosts().then(setStaticRelated);
  }, [relatedData?.posts?.length]);

  const rawArticle = post ?? staticPost;
  const article = rawArticle
    ? {
        ...rawArticle,
        featuredImageUrl: resolveJournalImageUrl(rawArticle.featuredImageUrl) ?? rawArticle.featuredImageUrl,
        content: rewriteJournalContentHtml(rawArticle.content),
      }
    : null;
  const related = [...(relatedData?.posts?.length ? relatedData.posts : staticRelated)]
    .map((p) => ({
      ...p,
      featuredImageUrl: resolveJournalImageUrl(p.featuredImageUrl) ?? p.featuredImageUrl,
    }))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const postJsonLd = useMemo(() => {
    if (!article) return null;
    const path = journalPostPath(article.slug);
    return buildSiteGraph([
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Journal", path: JOURNAL_PATH },
        { name: article.title, path },
      ]),
      articleJsonLd({
        title: article.title,
        description: truncateForMeta(article.excerpt),
        path,
        publishedAt: article.publishedAt,
        author: article.author,
        image: article.featuredImageUrl,
      }),
    ]);
  }, [article]);

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    try {
      await createEnquiry.mutateAsync({ data: { name, email, source: "blog_cta" } });
      toast({ title: "You are subscribed", description: "We will keep you informed." });
      setEmail(""); setName("");
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  };

  if (!article && (isLoading || !staticReady)) {
    return (
      <Fragment>
        <Seo
          title="Journal article"
          description="Loading article."
          path={slug ? journalPostPath(slug) : JOURNAL_PATH}
        />
        <div className="min-h-screen bg-background pt-32">
          <div className="container mx-auto max-w-3xl px-6 space-y-4">
            <div className="h-8 bg-muted animate-pulse w-1/3" />
            <div className="h-64 bg-muted animate-pulse" />
            <div className="h-4 bg-muted animate-pulse" />
          </div>
        </div>
      </Fragment>
    );
  }

  if (!article) {
    return (
      <Fragment>
        <Seo
          title="Article not found"
          description="This journal article does not exist or was removed."
          path={slug ? journalPostPath(slug) : JOURNAL_PATH}
          noindex
        />
        <div className="min-h-screen bg-background pt-32 text-center">
          <p className="font-serif text-3xl text-muted-foreground">Article not found</p>
          <Link href={JOURNAL_PATH}><Button className="mt-6 rounded-none">Back to Journal</Button></Link>
        </div>
      </Fragment>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={article.title}
        description={truncateForMeta(article.excerpt)}
        path={journalPostPath(article.slug)}
        image={article.featuredImageUrl}
        type="article"
        jsonLd={postJsonLd}
      />
      {/* Hero */}
      {article.featuredImageUrl && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={onJournalImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        </div>
      )}

      <div className={`container mx-auto max-w-3xl px-6 ${article.featuredImageUrl ? '-mt-24 relative z-10' : 'pt-32'}`}>
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: "Journal", href: JOURNAL_PATH },
            { label: article.title },
          ]}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${article.featuredImageUrl ? 'bg-background p-8 md:p-12 mb-8 border-b border-border' : 'py-12 mb-8 border-b border-border'}`}
        >
          <Link href={JOURNAL_PATH}>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm tracking-wide mb-6">
              <ArrowLeft size={14} /> {t.back}
            </button>
          </Link>
          {article.categoryName && (
            <span className="text-xs tracking-[0.3em] uppercase text-primary">{article.categoryName}</span>
          )}
          <h1 className="font-serif text-3xl md:text-4xl mt-3 mb-5 leading-tight text-primary">{article.title}</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User size={12} /> {article.author}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {article.readingTime} {t.minRead}</span>
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-stone max-w-none mb-16 prose-img:rounded-md prose-img:my-6"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* CTA Block */}
        <div className="bg-foreground text-background p-8 md:p-12 mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">{t.ready}</p>
          <h2 className="font-serif text-2xl mb-4 text-primary">{t.guide}</h2>
          <p className="text-background/70 mb-6 text-sm">Everything you need to know about investing in luxury Bali property. Delivered to your inbox.</p>
          <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder={t.yourName}
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-none bg-background/10 border-background/20 text-background placeholder:text-background/50 flex-1"
              data-testid="input-cta-name"
            />
            <Input
              placeholder={t.email}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-none bg-background/10 border-background/20 text-background placeholder:text-background/50 flex-1"
              data-testid="input-cta-email"
            />
            <Button
              type="submit"
              variant="secondary"
              className="rounded-none tracking-widest uppercase whitespace-nowrap"
              disabled={createEnquiry.isPending}
              data-testid="button-cta-submit"
            >
              {t.getGuide}
            </Button>
          </form>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="border-t border-border pt-12 pb-16">
            <h2 className="font-serif text-2xl mb-8 text-primary">{t.related}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map(p => (
                <Link key={p.slug} href={journalPostPath(p.slug)}>
                  <div className="group cursor-pointer">
                    {p.featuredImageUrl && (
                      <div className="aspect-video overflow-hidden bg-muted mb-3">
                        <img
                          key={p.featuredImageUrl}
                          src={p.featuredImageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={onJournalImageError}
                        />
                      </div>
                    )}
                    <h3 className="font-serif text-sm leading-snug group-hover:text-primary transition-colors">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
