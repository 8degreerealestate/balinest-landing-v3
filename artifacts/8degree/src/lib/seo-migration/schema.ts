import { canonicalUrl, jsonLdGraph, organizationJsonLdNode, SITE_NAME, toAbsoluteImageUrl } from "@/lib/site-seo";

export function localBusinessJsonLdNode(): Record<string, unknown> {
  return {
    "@type": "RealEstateAgent",
    "@id": `${canonicalUrl("/")}#organization`,
    name: SITE_NAME,
    url: canonicalUrl("/"),
    areaServed: { "@type": "AdministrativeArea", name: "Bali, Indonesia" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bali",
      addressCountry: "ID",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  author?: string | null;
  image?: string | null;
}): Record<string, unknown> {
  const image = toAbsoluteImageUrl(input.image);
  return {
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    datePublished: input.publishedAt ?? undefined,
    dateModified: input.modifiedAt ?? input.publishedAt ?? undefined,
    author: input.author ? { "@type": "Person", name: input.author } : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: canonicalUrl("/brand/8degree-logotype-white-transparent.png") },
    },
    ...(image ? { image: [image] } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl(input.path) },
  };
}

export function faqPageJsonLd(items: Array<{ question: string; answer: string }>): Record<string, unknown> | null {
  if (items.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildSiteGraph(extra: Record<string, unknown>[] = []): Record<string, unknown> {
  return jsonLdGraph([organizationJsonLdNode(), localBusinessJsonLdNode(), ...extra]);
}
