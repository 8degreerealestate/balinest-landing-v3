/** SEO migration records (WordPress → custom site). */

export type SeoAuditEntry = {
  old_url: string;
  path: string;
  seo_title: string | null;
  meta_description: string | null;
  canonical: string | null;
  h1: string | null;
  h2: string[];
  h3: string[];
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  twitter_card: string | null;
  schema_type: string | null;
  schema_json: Record<string, unknown> | null;
  status_code: number;
  indexable: boolean;
  internal_links: string[];
  image_alts: Array<{ src: string; alt: string }>;
  new_url: string | null;
  redirect_required: boolean;
};

export type SeoAuditFile = {
  crawledAt: string;
  sourceSite: string;
  entries: SeoAuditEntry[];
};

export type SeoRedirect = {
  source: string;
  destination: string;
  permanent?: boolean;
};

export type PageSeoRecord = {
  seoTitle: string;
  metaDescription: string;
  canonical: string;
  h1?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
};

export type JournalSeoRecord = PageSeoRecord & {
  slug: string;
  oldPath: string;
  publishedAt?: string;
};

export type MigrationBundle = {
  generatedAt: string;
  redirects: SeoRedirect[];
  pageMetadata: Record<string, PageSeoRecord>;
  journalSeo: Record<string, JournalSeoRecord>;
  sitemapPaths: string[];
};
