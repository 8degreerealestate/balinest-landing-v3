import { Seo } from "@/components/site/Seo";
import { useLocation } from "wouter";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";

type InfoPageContent = {
  title: string;
  description: string;
  body: string[];
};

const PAGE_FALLBACK_TRANSLATION: Record<SiteLanguage, { title: string; description: string; body: string[] }> = {
  en: { title: "Page", description: "Information page.", body: ["This page is available and will be expanded with full content soon."] },
  id: { title: "Halaman", description: "Halaman informasi.", body: ["Halaman ini tersedia dan akan dilengkapi konten lengkap segera."] },
  fr: { title: "Page", description: "Page d'information.", body: ["Cette page est disponible et sera enrichie prochainement."] },
  zh: { title: "页面", description: "信息页面。", body: ["该页面已可用，完整内容将很快补充。"] },
  tr: { title: "Sayfa", description: "Bilgi sayfasi.", body: ["Bu sayfa kullanima acik ve yakinda genisletilecektir."] },
};

const INFO_BY_PATH: Record<string, InfoPageContent> = {
  "/favorite-properties": {
    title: "Favorite Properties",
    description: "Save and revisit your shortlisted Bali properties.",
    body: [
      "Use this section to track listings you are actively comparing.",
      "Our team can also curate and share a private shortlist based on your criteria.",
    ],
  },
  "/frequently-asked-questions": {
    title: "Frequently Asked Questions",
    description: "Answers to common questions about buying and investing in Bali property.",
    body: [
      "Find guidance on ownership, due diligence, taxes, and timelines.",
      "For a specific scenario, contact us and we will advise based on your goals.",
    ],
  },
  "/company-overview": {
    title: "Company Overview",
    description: "Learn about 8 Degree's advisory approach, market focus, and operating model.",
    body: [
      "We combine local market intelligence with investor-first analysis.",
      "Our advisory process focuses on risk clarity, performance, and execution quality.",
    ],
  },
  "/testimony": {
    title: "Testimony",
    description: "Client experiences working with 8 Degree.",
    body: [
      "Read real buyer and investor stories from projects across Bali.",
      "Our team can also provide references on request for relevant property types.",
    ],
  },
  "/legal-services": {
    title: "Legal Services",
    description: "Legal support and structuring for Bali property transactions.",
    body: [
      "We coordinate legal partners for ownership structuring and contract review.",
      "Our process prioritizes compliance, documentation quality, and transaction safety.",
    ],
  },
  "/legal-and-due-diligence": {
    title: "Legal and Due Diligence",
    description: "Legal checks and due diligence workflow before acquisition.",
    body: [
      "Every acquisition should complete legal, zoning, and documentation checks.",
      "We help align legal due diligence with your investment strategy and timeline.",
    ],
  },
  "/data-driven": {
    title: "Data Driven",
    description: "How we use market data and underwriting in property recommendations.",
    body: [
      "Our recommendations are informed by pricing trends, demand patterns, and comparables.",
      "We continuously validate assumptions against current market conditions.",
    ],
  },
  "/bali-property-guide": {
    title: "Bali Property Guide",
    description: "Practical guide for researching and acquiring property in Bali.",
    body: [
      "Explore ownership models, area dynamics, and acquisition best practices.",
      "Use this guide as a framework before shortlisting opportunities.",
    ],
  },
};

export default function InfoPage() {
  const language = useSiteLanguage();
  const [location] = useLocation();
  const page = INFO_BY_PATH[location] ?? PAGE_FALLBACK_TRANSLATION[language];

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <Seo title={page.title} description={page.description} path={location} />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold tracking-[0.04em] text-primary md:text-5xl">{page.title}</h1>
        <p className="mt-4 font-light text-muted-foreground">{page.description}</p>
        <div className="mt-10 space-y-5 font-light leading-relaxed text-foreground/90">
          {page.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
