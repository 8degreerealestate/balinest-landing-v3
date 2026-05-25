import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ApiError,
  getInventoryListingQueryKey,
  useCreateEnquiry,
  useGetInventoryListing,
  useListInventoryListings,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  borrowInventoryImages,
  inferLeaseYearsLabel,
  inferListingArea,
  inferListingStatus,
  inventoryGalleryUrls,
  listingPriceLine,
  listingShortBlurb,
  pickInventoryThumbnail,
} from "@/lib/portfolio-listing";
import { pickSimilarInventoryListings } from "@/lib/similar-inventory-listings";
import { buildWhatsappUrl, getContactEmail } from "@/lib/site-contact";
import { Seo } from "@/components/site/Seo";
import {
  canonicalUrl,
  jsonLdGraph,
  organizationJsonLdNode,
  toAbsoluteImageUrl,
  truncateForMeta,
} from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import {
  convertFromUsd,
  CURRENCY_OPTIONS,
  formatCurrency,
  parseUsdNumber,
  setSiteCurrency,
  type SiteCurrency,
  useSiteCurrency,
} from "@/lib/site-currency";
import {
  FeaturedListingCard,
  inventoryRowToFeaturedModel,
  type FeaturedCardModel,
} from "@/components/site/highlighted-listing-card";

/**
 * Brand palette — matches buyer/seller/projects pages.
 *  - paper / cream: warm site background
 *  - ink: body text (#1c1917)
 *  - brand: 8 Degree teal (#01514E) — italic accent + dark sections + buttons
 *  - brandDeep: hover state
 *  - accent: #E0FDAC highlight (used on dark sections for italic emphasis, dot, pill)
 *  - rule: subtle hairline divider
 */
const PALETTE = {
  ink: "#1c1917",
  inkSoft: "rgba(28, 25, 23, 0.72)",
  cream: "#f4f1ea",
  creamWarm: "#ece6d6",
  paper: "#f4f1ea",
  brand: "#01514E",
  brandSoft: "rgba(1, 81, 78, 0.72)",
  brandDeep: "#013d3a",
  accent: "#E0FDAC",
  rule: "rgba(28, 25, 23, 0.12)",
} as const;

/** Brand fonts: Rework for display, Montserrat for body + small labels. */
const FONT_SERIF = "'Rework','Montserrat',sans-serif";
const FONT_SANS = "'Montserrat',system-ui,sans-serif";
const FONT_MONO = "'Montserrat',system-ui,sans-serif";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1613490908578-7804bb61483b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";

const BUDGET_OPTIONS = [
  { value: "under-500k", label: "Under USD 500k" },
  { value: "500k-1m", label: "USD 500k – 1m" },
  { value: "1m-3m", label: "USD 1m – 3m" },
  { value: "3m-plus", label: "USD 3m+" },
] as const;

const GRAIN_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

/**
 * Sample listing used when navigating to `/properties/preview`.
 * Lets us preview the editorial layout without depending on the DB / sheet path.
 */
const PREVIEW_LISTING = {
  id: "preview",
  code: "ANTA",
  sourceUrl: null,
  name: "Villa Ananta",
  redirectUrl: null,
  title: "Villa Ananta",
  imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80",
  imageUrls: [
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80",
    "https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=1400&q=80",
  ],
  ownership: "Leasehold",
  location: "Uluwatu, Bali",
  estimatePriceUsd: "USD 2,800,000",
  deliveryEstimate: "Q4 2026",
  landSizeSqm: "1,240",
  buildingSizeSqm: "820",
  br: "6",
  ba: "7",
  level: "2",
  zoning: "Yellow",
  livingRoom: "Open-plan",
  listingUrl: null,
  description: [
    "Carved into the limestone bluff of Uluwatu's western shoreline, Villa Ananta is a meditation on space, stone, and silence. The architecture draws from the Balinese principle of Tri Hita Karana — harmony between people, nature, and the divine — translated through a contemporary vocabulary of raw travertine, sun-bleached teak, and glass that seems to dissolve at the horizon.",
    "It is not a villa. It is a chapter — a place that asks you to slow down and listen.",
    "Six suites unfold across two levels, each oriented to the sunset. A 22-metre infinity pool anchors the main terrace, while a sunken lounge, open-air cinema, and private spa pavilion complete the estate. Every surface, every joint, every sightline has been considered — then reconsidered.",
    "Designed for those who collect experiences rather than objects, Ananta offers what Bali itself promises: a way of living that is at once deeply rooted and entirely free.",
    "• Infinity Pool — 22-metre heated pool oriented west, finished in hand-laid Balinese sukabumi stone.",
    "• Private Spa Pavilion — Dedicated wellness wing with treatment room, steam, and ice bath; designed with Ubud-based wellness consultants.",
    "• Open-Air Cinema — Sunken garden theatre seating 12, with 4K laser projection and integrated sound.",
    "• Chef's Kitchen — Full Gaggenau outfit plus a secondary prep and service kitchen for staff and events.",
    "• Staff Quarters — Separate residence for a live-in team of four, including private entrance and amenities.",
    "• Smart Home — KNX-integrated climate, lighting, security and audio, managed via a single tablet interface.",
  ].join("\n\n"),
  channel: "website" as const,
  sortOrder: 0,
  createdAt: "",
  updatedAt: "",
  featured: true,
  visibility: "active" as const,
  saleStatus: "available" as const,
  postedAt: "",
};

/** Looks like an HTML/Express error body, not a clean message — hide it from end users. */
function isHtmlOrServerNoise(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.trim();
  return /<\!?[a-z]|<\/[a-z]|Failed query:|HTTP\s+\d{3}/i.test(m);
}

function galleryUrls(listing: {
  imageUrls?: string[] | null;
  imageUrl?: string | null;
}): string[] {
  return inventoryGalleryUrls(listing);
}

/** First short standalone sentence from description, suitable as a tagline / pullquote. */
function firstSentence(description: string, maxLen = 180): string | null {
  if (!description?.trim()) return null;
  const cleaned = description.replace(/\s+/g, " ").trim();
  const m = cleaned.match(/^(.+?[.!?])(\s|$)/);
  const candidate = (m?.[1] || cleaned).trim();
  if (!candidate) return null;
  return candidate.length > maxLen ? `${candidate.slice(0, maxLen - 1)}…` : candidate;
}

/** Pull short pullquote-worthy line (≤120 chars) — falls back to null if nothing clean. */
function firstShortQuote(description: string): string | null {
  if (!description?.trim()) return null;
  const lines = description.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.length >= 24 && line.length <= 140 && /[a-z]/i.test(line)) {
      const ending = /[.!?]$/.test(line) ? line : `${line}.`;
      return ending;
    }
  }
  const fs = firstSentence(description, 140);
  return fs && fs.length <= 140 ? fs : null;
}

/** Extract bullet-style items from description (•, ✓, -, *, emoji bullets). */
function extractBullets(description: string): string[] {
  if (!description?.trim()) return [];
  const lines = description.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const bullets: string[] = [];
  const bulletRe = /^(?:[•·▪◦■□●○✓✔★◆➤➡️→\-*]+|\d+\.|\d+\))\s+/;
  for (const line of lines) {
    if (bulletRe.test(line)) {
      const cleaned = line.replace(bulletRe, "").trim();
      if (cleaned && cleaned.length <= 180) bullets.push(cleaned);
    }
  }
  return bullets.slice(0, 6);
}

/** Split a bullet into a short headline + supporting description for the amenities card. */
function splitAmenity(text: string): { name: string; desc: string } {
  const m = text.match(/^([^:—–-]{2,60})[:—–-]\s*(.+)$/);
  if (m && m[2].trim()) return { name: m[1].trim(), desc: m[2].trim() };
  const sentenceMatch = text.match(/^(.+?[.!?])\s+(.+)$/);
  if (sentenceMatch && sentenceMatch[2].trim().length > 12) {
    return { name: sentenceMatch[1].replace(/[.!?]$/, "").trim(), desc: sentenceMatch[2].trim() };
  }
  if (text.length <= 48) return { name: text, desc: "" };
  return { name: text.slice(0, 48).trim() + "…", desc: text };
}

export default function ListingDetail() {
  const language = useSiteLanguage();
  const currency = useSiteCurrency();
  const t: Record<string, string> = {
    en: {
      listing: "Listing",
      featured: "Flagship Collection",
      story: "The Story",
      gallery: "The Estate",
      numbers: "The Details",
      estate: "The Estate",
      cta: "Private Viewings by Appointment",
      ctaSubmit: "Request full dossier",
      ctaWhatsapp: "Chat on WhatsApp",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      land: "Land Size",
      built: "Building Size",
      tenure: "Ownership",
      price: "Price",
      delivery: "Development Status",
      ownership: "Ownership",
      lease: "Lease",
      code: "Reference",
      formTitle: "Begin the conversation",
      formSub:
        "Our team will respond personally within one business day to discuss this property in detail.",
      submit: "Send enquiry",
      submitting: "Sending…",
      back: "Back to portfolio",
      invalid: "Invalid property link",
      notAvailable: "This property is not available",
      notFound: "Property not found",
      loading: "Loading property details and gallery.",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      country: "Country",
      message: "Message",
      budget: "Budget range",
      selectBudget: "Select budget",
      view: "View",
      viewOriginal: "View original listing",
      requestedListing: "Requested listing",
      perform: "A property that <em>performs.</em>",
      considered: "Every <em>detail</em>, considered.",
      noFixedTerm: "No fixed term",
      home: "Home",
      property: "Property",
      investment: "Investment",
      seeMore: "See More",
      close: "Close",
      previous: "Previous",
      next: "Next",
      location: "Location",
      level: "Level",
      zoning: "Zoning",
      livingRoom: "Living Room",
      whatsappAgent: "WhatsApp Agent",
      emailAgent: "Email to Agent",
      nearby: "Nearby",
      nearbySub: "Explore what's around this property",
      shopping: "Shopping",
      cafes: "Cafes",
      landmarks: "Landmarks",
      similarTitle: "Similar properties",
      similarSub: "Explore similar properties and find one that suits your needs",
      exclusive: "Exclusive",
      years: "Years",
    },
    id: {
      listing: "Listing",
      featured: "Koleksi Andalan",
      story: "Cerita",
      gallery: "Properti",
      numbers: "Detail",
      estate: "Properti",
      cta: "Kunjungan Privat dengan Janji",
      ctaSubmit: "Minta dosir lengkap",
      ctaWhatsapp: "Chat WhatsApp",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      land: "Luas Tanah",
      built: "Luas Bangunan",
      tenure: "Kepemilikan",
      price: "Harga",
      delivery: "Status Pembangunan",
      ownership: "Status",
      lease: "Masa Sewa",
      code: "Kode",
      formTitle: "Mulai percakapan",
      formSub: "Tim kami akan merespons dalam satu hari kerja.",
      submit: "Kirim pertanyaan",
      submitting: "Mengirim…",
      back: "Kembali ke portofolio",
      invalid: "Tautan properti tidak valid",
      notAvailable: "Properti ini tidak tersedia",
      notFound: "Properti tidak ditemukan",
      loading: "Memuat detail dan galeri.",
      name: "Nama lengkap",
      email: "Email",
      phone: "Telepon",
      country: "Negara",
      message: "Pesan",
      budget: "Rentang anggaran",
      selectBudget: "Pilih anggaran",
      view: "View",
      viewOriginal: "Lihat listing asli",
      requestedListing: "Properti yang diminati",
      perform: "Properti yang <em>berkinerja.</em>",
      considered: "Setiap <em>detail</em>, diperhatikan.",
      noFixedTerm: "Tanpa jangka",
      home: "Beranda",
      property: "Properti",
      investment: "Investasi",
      seeMore: "Lihat lainnya",
      close: "Tutup",
      previous: "Sebelumnya",
      next: "Berikutnya",
      location: "Lokasi",
      level: "Lantai",
      zoning: "Zonasi",
      livingRoom: "Ruang Tamu",
      whatsappAgent: "WhatsApp Agen",
      emailAgent: "Email ke Agen",
      nearby: "Sekitar",
      nearbySub: "Jelajahi sekitar properti ini",
      shopping: "Belanja",
      cafes: "Kafe",
      landmarks: "Landmark",
      similarTitle: "Properti serupa",
      similarSub: "Jelajahi properti serupa dan temukan yang sesuai untuk Anda",
      exclusive: "Eksklusif",
      years: "Tahun",
    },
    fr: {
      listing: "Annonce",
      featured: "Collection Phare",
      story: "L'Histoire",
      gallery: "Le Domaine",
      numbers: "Les Details",
      estate: "Le Domaine",
      cta: "Visites Privees sur Rendez-vous",
      ctaSubmit: "Demander le dossier complet",
      ctaWhatsapp: "Discuter sur WhatsApp",
      bedrooms: "Chambres",
      bathrooms: "Salles de bain",
      land: "Surface du Terrain",
      built: "Surface Batie",
      tenure: "Propriete",
      price: "Prix",
      delivery: "Statut du Projet",
      ownership: "Statut",
      lease: "Bail",
      code: "Reference",
      formTitle: "Commencer la conversation",
      formSub: "Notre equipe vous repondra sous un jour ouvre.",
      submit: "Envoyer la demande",
      submitting: "Envoi…",
      back: "Retour au portefeuille",
      invalid: "Lien du bien invalide",
      notAvailable: "Ce bien n'est pas disponible",
      notFound: "Bien introuvable",
      loading: "Chargement des details et de la galerie.",
      name: "Nom complet",
      email: "E-mail",
      phone: "Telephone",
      country: "Pays",
      message: "Message",
      budget: "Fourchette de budget",
      selectBudget: "Choisir un budget",
      view: "Vue",
      viewOriginal: "Voir l'annonce originale",
      requestedListing: "Bien demande",
      perform: "Un bien qui <em>performe.</em>",
      considered: "Chaque <em>detail</em>, considere.",
      noFixedTerm: "Sans terme",
      home: "Accueil",
      property: "Proprietes",
      investment: "Investissement",
      seeMore: "Voir plus",
      close: "Fermer",
      previous: "Precedent",
      next: "Suivant",
      location: "Emplacement",
      level: "Niveau",
      zoning: "Zonage",
      livingRoom: "Salon",
      whatsappAgent: "WhatsApp Agent",
      emailAgent: "Email a l'agent",
      nearby: "A proximite",
      nearbySub: "Decouvrez les environs",
      shopping: "Commerces",
      cafes: "Cafes",
      landmarks: "Points d'interet",
      similarTitle: "Proprietes similaires",
      similarSub: "Decouvrez des biens similaires qui correspondent a vos envies",
      exclusive: "Exclusif",
      years: "Ans",
    },
    zh: {
      listing: "房源",
      featured: "旗舰系列",
      story: "故事",
      gallery: "房产",
      numbers: "细节",
      estate: "房产",
      cta: "预约私人参观",
      ctaSubmit: "索取完整资料",
      ctaWhatsapp: "WhatsApp 联系",
      bedrooms: "卧室",
      bathrooms: "浴室",
      land: "土地面积",
      built: "建筑面积",
      tenure: "产权",
      price: "价格",
      delivery: "开发状态",
      ownership: "状态",
      lease: "租期",
      code: "编号",
      formTitle: "开始对话",
      formSub: "我们将在一个工作日内回复。",
      submit: "提交咨询",
      submitting: "发送中…",
      back: "返回项目列表",
      invalid: "无效房源链接",
      notAvailable: "该房源不可用",
      notFound: "未找到房源",
      loading: "正在加载详情和图库。",
      name: "姓名",
      email: "邮箱",
      phone: "电话",
      country: "国家",
      message: "留言",
      budget: "预算范围",
      selectBudget: "选择预算",
      view: "视图",
      viewOriginal: "查看原始房源",
      requestedListing: "意向房源",
      perform: "<em>表现</em>出色的房产。",
      considered: "每一个<em>细节</em>，皆经考量。",
      noFixedTerm: "无固定期限",
      home: "首页",
      property: "房产",
      investment: "投资",
      seeMore: "查看更多",
      close: "关闭",
      previous: "上一张",
      next: "下一张",
      location: "位置",
      level: "楼层",
      zoning: "分区",
      livingRoom: "客厅",
      whatsappAgent: "WhatsApp 顾问",
      emailAgent: "邮件联系顾问",
      nearby: "周边",
      nearbySub: "探索物业周边",
      shopping: "购物",
      cafes: "咖啡馆",
      landmarks: "地标",
      similarTitle: "类似房源",
      similarSub: "探索类似房源，找到最适合您的一处",
      exclusive: "独家",
      years: "年",
    },
    tr: {
      listing: "Ilan",
      featured: "Bayrak Koleksiyon",
      story: "Hikaye",
      gallery: "Mulk",
      numbers: "Detaylar",
      estate: "Mulk",
      cta: "Randevu ile Ozel Gezi",
      ctaSubmit: "Tam dosyayi iste",
      ctaWhatsapp: "WhatsApp sohbet",
      bedrooms: "Yatak Odasi",
      bathrooms: "Banyo",
      land: "Arsa Boyutu",
      built: "Bina Boyutu",
      tenure: "Mulkiyet",
      price: "Fiyat",
      delivery: "Gelisim Durumu",
      ownership: "Durum",
      lease: "Kira Suresi",
      code: "Kod",
      formTitle: "Konusmaya basla",
      formSub: "Ekibimiz bir is gunu icinde donus yapacaktir.",
      submit: "Talebi gonder",
      submitting: "Gonderiliyor…",
      back: "Portfoye don",
      invalid: "Gecersiz ilan baglantisi",
      notAvailable: "Bu ilan mevcut degil",
      notFound: "Ilan bulunamadi",
      loading: "Detaylar ve galeri yukleniyor.",
      name: "Ad Soyad",
      email: "E-posta",
      phone: "Telefon",
      country: "Ulke",
      message: "Mesaj",
      budget: "Butce araligi",
      selectBudget: "Butce sec",
      view: "Goruntu",
      viewOriginal: "Orijinal ilani ac",
      requestedListing: "Talep edilen ilan",
      perform: "<em>Performans</em> gosteren mulk.",
      considered: "Her <em>detay</em>, dusunulmus.",
      noFixedTerm: "Suresiz",
      home: "Ana sayfa",
      property: "Mulkler",
      investment: "Yatirim",
      seeMore: "Daha fazla",
      close: "Kapat",
      previous: "Onceki",
      next: "Sonraki",
      location: "Konum",
      level: "Kat",
      zoning: "Imar",
      livingRoom: "Oturma Odasi",
      whatsappAgent: "WhatsApp Danisman",
      emailAgent: "Danismana E-posta",
      nearby: "Yakinda",
      nearbySub: "Cevreyi kesfedin",
      shopping: "Alisveris",
      cafes: "Kafeler",
      landmarks: "Onemli Yerler",
      similarTitle: "Benzer mulkler",
      similarSub: "Size uygun benzer mulkleri kesfedin",
      exclusive: "Ozel",
      years: "Yil",
    },
  }[language];

  const [, params] = useRoute("/properties/:code");
  const code = (params?.code ?? "").trim();
  const isPreview = code.toLowerCase() === "preview";

  const { data, isLoading: apiLoading, isError, error } = useGetInventoryListing(code, {
    query: {
      enabled: Boolean(code) && !isPreview,
      queryKey: getInventoryListingQueryKey(code),
    },
  });
  const { data: inventoryListData } = useListInventoryListings(
    { channel: "website", limit: 500, offset: 0 },
    { query: { enabled: Boolean(code) && !isPreview } },
  );
  const createEnquiry = useCreateEnquiry();
  const { toast } = useToast();

  const listing = isPreview ? PREVIEW_LISTING : data?.listing;
  const isLoading = !isPreview && apiLoading;

  const listingJsonLd = useMemo(() => {
    if (!listing) return null;
    const images = galleryUrls(listing)
      .map((u) => toAbsoluteImageUrl(u))
      .filter((u): u is string => Boolean(u));
    return jsonLdGraph([
      organizationJsonLdNode(),
      {
        "@type": "Residence",
        name: listing.title || listing.code,
        description: truncateForMeta(listingShortBlurb(listing.description) || listing.title),
        url: canonicalUrl(`/properties/${encodeURIComponent(listing.code)}`),
        ...(images.length ? { image: images } : {}),
      },
    ]);
  }, [listing]);

  const isUnavailable = Boolean(
    listing &&
      (listing.visibility === "draft" ||
        listing.saleStatus === "sold" ||
        listing.channel !== "website"),
  );

  const form = useForm({
    defaultValues: { name: "", email: "", phone: "", country: "", budgetRange: "", message: "" },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [code]);

  /**
   * Full deduped image list — drives the hero grid and the lightbox.
   * Computed before any early returns so the hooks below stay stable across renders.
   */
  const allImages = useMemo(() => {
    if (!listing) return [];
    const urls = inventoryGalleryUrls(listing);
    if (urls.length > 0) return urls;
    return [FALLBACK_HERO];
  }, [listing]);

  const [heroIndex, setHeroIndex] = useState(0);

  /** Lightbox state — null = closed; number = current index in `allImages`. */
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = () => setLightboxIndex(null);
  const lightboxPrev = () =>
    setLightboxIndex((i) => (i === null ? i : Math.max(0, i - 1)));
  const lightboxNext = () =>
    setLightboxIndex((i) => (i === null ? i : Math.min(allImages.length - 1, i + 1)));

  const heroPrev = useCallback(() => {
    setHeroIndex((i) => Math.max(0, i - 1));
  }, []);

  const heroNext = useCallback(() => {
    setHeroIndex((i) => Math.min(allImages.length - 1, i + 1));
  }, [allImages.length]);

  useEffect(() => {
    setHeroIndex(0);
  }, [code, allImages.length]);

  const [dismissedSimilarCodes, setDismissedSimilarCodes] = useState(() => new Set<string>());
  useEffect(() => {
    setDismissedSimilarCodes(new Set());
  }, [code]);

  const dismissSimilarListing = useCallback((similarCode: string) => {
    setDismissedSimilarCodes((prev) => {
      if (prev.has(similarCode)) return prev;
      const next = new Set(prev);
      next.add(similarCode);
      return next;
    });
  }, []);

  const similarCards = useMemo((): FeaturedCardModel[] => {
    if (isPreview) {
      return SIMILAR_LISTINGS_DEFAULT.map((s, idx) => similarToFeaturedModel(s, currency));
    }
    if (!listing || !inventoryListData?.listings?.length) return [];

    const pool = inventoryListData.listings;
    const picks = pickSimilarInventoryListings(listing, pool, 12).filter(
      (row) => !dismissedSimilarCodes.has(row.code),
    );

    return picks
      .filter((row) => pickInventoryThumbnail(borrowInventoryImages(row, pool)))
      .slice(0, 3)
      .map((row, idx) => inventoryRowToFeaturedModel(borrowInventoryImages(row, pool), idx));
  }, [isPreview, listing, inventoryListData, currency, dismissedSimilarCodes]);

  // Keyboard nav (Esc / ← / →) + body scroll lock while the lightbox is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") lightboxPrev();
        else if (e.key === "ArrowRight") lightboxNext();
        return;
      }
      if (allImages.length <= 1) return;
      if (e.key === "ArrowLeft") heroPrev();
      else if (e.key === "ArrowRight") heroNext();
    };
    document.addEventListener("keydown", onKey);
    if (lightboxIndex === null) {
      return () => document.removeEventListener("keydown", onKey);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, allImages.length, heroPrev, heroNext, lightboxPrev, lightboxNext]);

  // Auto-scroll the active thumbnail into view inside the lightbox strip.
  const thumbsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (lightboxIndex === null || !thumbsRef.current) return;
    const active = thumbsRef.current.querySelector<HTMLElement>(
      `[data-thumb-idx="${lightboxIndex}"]`,
    );
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [lightboxIndex]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!listing) return;
    try {
      await createEnquiry.mutateAsync({
        data: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || null,
          country: values.country.trim() || null,
          budgetRange: values.budgetRange || null,
          message:
            (values.message.trim() ? `${values.message.trim()}\n\n` : "") +
            `${t.requestedListing}: ${listing.code} · ${listing.title}`,
          interestedProjectId: null,
          source: "listing_detail",
        },
      });
      toast({ title: t.submit, description: "We will be in touch within 24 hours." });
      form.reset();
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  });

  if (!code) {
    return (
      <Fragment>
        <Seo title={t.invalid} description="This property URL is not valid." path="/projects" noindex />
        <ErrorState title={t.invalid} backLabel={t.back} />
      </Fragment>
    );
  }

  if (isLoading) {
    return (
      <Fragment>
        <Seo title={t.listing} description={t.loading} path={`/properties/${encodeURIComponent(code)}`} />
        <div className="min-h-screen pt-32" style={{ backgroundColor: PALETTE.paper }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8 h-12 w-48 animate-pulse rounded bg-black/5" />
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div className="space-y-6">
                <div className="h-6 w-2/3 animate-pulse rounded bg-black/5" />
                <div className="h-32 w-full animate-pulse rounded bg-black/5" />
              </div>
              <div className="h-[55vh] min-h-[320px] animate-pulse rounded bg-black/5" />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  if (listing && isUnavailable) {
    return (
      <Fragment>
        <Seo
          title={listing.title || listing.code}
          description={t.notAvailable}
          path={`/properties/${encodeURIComponent(code)}`}
          noindex
        />
        <ErrorState
          title={t.notAvailable}
          subtitle="It may be reserved, sold, or not published on our public site."
          backLabel={t.back}
        />
      </Fragment>
    );
  }

  if (!listing) {
    const is404 = isError && error instanceof ApiError && (error.status === 404 || error.status === 400);
    const rawMessage = isError && error instanceof Error ? error.message : "";
    const cleanSubtitle = isHtmlOrServerNoise(rawMessage)
      ? "Our inventory service is temporarily unavailable. Please try again shortly, or browse the rest of the portfolio."
      : rawMessage || "Check the link or return to the portfolio.";
    return (
      <Fragment>
        <Seo
          title={t.notFound}
          description="We could not find this listing."
          path={`/properties/${encodeURIComponent(code)}`}
          noindex
        />
        <ErrorState
          title={is404 ? t.notFound : isError ? "Could not load this property" : t.notFound}
          subtitle={is404 ? "Check the link or return to the portfolio." : cleanSubtitle}
          backLabel={t.back}
          extra={
            <p
              className="mx-auto mt-3 max-w-md text-xs"
              style={{ fontFamily: FONT_MONO, color: PALETTE.brandSoft, opacity: 0.55, letterSpacing: "0.06em" }}
            >
              Tip: open{" "}
              <Link href="/properties/preview">
                <span style={{ textDecoration: "underline", textUnderlineOffset: 4 }}>
                  /properties/preview
                </span>
              </Link>{" "}
              to view the layout with sample data.
            </p>
          }
        />
      </Fragment>
    );
  }

  const area = inferListingArea(listing.title, listing.description);
  const priceLine = listing.estimatePriceUsd?.trim() || listingPriceLine(listing.description);
  const ownership = listing.ownership?.trim() || inferListingStatus(listing.description) || "—";
  const leaseLabel = inferLeaseYearsLabel(listing.description);
  const primaryImage = allImages[heroIndex] ?? allImages[0] ?? null;
  const description = listing.description?.trim() ?? "";
  const pullquote = firstShortQuote(description);
  const bullets = extractBullets(description);
  const amenities = bullets.slice(0, 6).map((b) => splitAmenity(b));
  const paragraphs = description
    ? description.split(/\n\n+/).filter((p) => p.trim() && !/^([•·▪◦■□●○✓✔★◆➤➡️→\-*]+\s|\d+\.\s)/.test(p.trim())).map((p) => p.trim())
    : [];
  const whatsappHref = buildWhatsappUrl(
    `Hi, I'm interested in ${listing.title} (${listing.code})`,
  );
  const heroSlideCount = allImages.length;
  const safeHeroIndex = heroSlideCount > 0 ? Math.min(heroIndex, heroSlideCount - 1) : 0;

  // `level`, `zoning`, and `livingRoom` aren't typed on the API listing — read via a narrow cast.
  const levelVal = (listing as { level?: string }).level?.trim() || "—";
  const zoningVal = (listing as { zoning?: string }).zoning?.trim() || "—";
  const livingRoomVal = (listing as { livingRoom?: string }).livingRoom?.trim() || "—";

  // Price card mirrors the navbar currency selector. We assume `priceLine`
  // is the canonical USD figure (per `listing.estimatePriceUsd`) and convert
  // on the fly. If the source value isn't parseable we fall back to the raw
  // string so we never show a broken state.
  const priceUsd = parseUsdNumber(priceLine);
  const priceDisplay = priceUsd != null
    ? formatCurrency(convertFromUsd(priceUsd, currency), currency)
    : (priceLine || "—");

  /** 10 stat cards rendered as a 2×5 grid (icon + label + value). */
  const stats: { label: string; value: React.ReactNode; icon: React.ReactNode }[] = [
    {
      label: t.bedrooms,
      value: listing.br?.trim() || "—",
      icon: <StatIcon name="bed" />,
    },
    {
      label: t.bathrooms,
      value: listing.ba?.trim() || "—",
      icon: <StatIcon name="bath" />,
    },
    {
      label: t.land,
      value: numberWithUnit(listing.landSizeSqm, "m²"),
      icon: <StatIcon name="land" />,
    },
    {
      label: t.built,
      value: numberWithUnit(listing.buildingSizeSqm, "m²"),
      icon: <StatIcon name="building" />,
    },
    {
      label: t.level,
      value: levelVal,
      icon: <StatIcon name="stairs" />,
    },
    {
      label: t.tenure,
      value:
        ownership && ownership !== "—" ? (
          <span>
            {ownership}
            {leaseLabel ? (
              <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 500, opacity: 0.7 }}>
                {leaseLabel}
              </span>
            ) : null}
          </span>
        ) : (
          "—"
        ),
      icon: <StatIcon name="tenure" />,
    },
    {
      label: t.delivery,
      value: listing.deliveryEstimate?.trim() || "—",
      icon: <StatIcon name="calendar" />,
    },
    {
      label: t.zoning,
      value: zoningVal,
      icon: <StatIcon name="zoning" />,
    },
    {
      label: t.location,
      value: (listing.location?.trim() || area) ?? "—",
      icon: <StatIcon name="pin" />,
    },
    {
      label: t.livingRoom,
      value: livingRoomVal,
      icon: <StatIcon name="sofa" />,
    },
  ];

  // Details section data — derived to mirror the "investment" block of the design.
  const details: { label: string; value: string; note?: string }[] = [
    leaseLabel ? { label: t.lease, value: leaseLabel, note: ownership } : null,
    listing.deliveryEstimate ? { label: t.delivery, value: listing.deliveryEstimate } : null,
    { label: t.ownership, value: ownership === "—" ? "Private" : ownership },
    { label: t.code, value: listing.code },
  ].filter((x): x is { label: string; value: string; note?: string } => Boolean(x));

  return (
    <div
      // NOTE: `overflow-x-clip` (not `overflow-x-hidden`). `overflow-x: hidden`
      // makes this element a scroll container, which silently breaks
      // `position: sticky` on any descendant (the sidebar in the location
      // section). `overflow-x: clip` clips horizontal overflow without
      // creating a scroll container, so sticky resolves against the viewport.
      className="relative overflow-x-clip"
      style={{
        backgroundColor: PALETTE.paper,
        color: PALETTE.brand,
        fontFamily: FONT_SANS,
        backgroundImage:
          "radial-gradient(ellipse at top right, rgba(1, 81, 78, 0.05), transparent 60%), radial-gradient(ellipse at bottom left, rgba(1, 81, 78, 0.04), transparent 55%)",
      }}
    >
      <Seo
        title={listing.title || listing.code}
        description={truncateForMeta(listingShortBlurb(listing.description) || `${area}. ${priceLine}`)}
        path={`/properties/${encodeURIComponent(listing.code)}`}
        image={primaryImage}
        jsonLd={listingJsonLd}
      />

      {/* Film grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[5]"
        style={{
          opacity: 0.08,
          backgroundImage: GRAIN_DATA_URI,
          mixBlendMode: "multiply",
        }}
      />

      {/* HERO: full-bleed photo carousel with prev/next arrows ================== */}
      <header className="relative z-[2] w-full overflow-hidden bg-[#e8e2da]">
        <div className="relative h-[min(75vh,880px)] min-h-[400px] w-full">
          {allImages.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className={`absolute inset-0 h-full w-full cursor-zoom-in transition-opacity duration-500 ${
                i === safeHeroIndex ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-label={`${listing.code} — ${i + 1} / ${heroSlideCount}`}
              tabIndex={i === safeHeroIndex ? 0 : -1}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </button>
          ))}
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/30 via-transparent to-black/40"
            aria-hidden
          />

          <div className="absolute left-0 right-0 top-0 z-[3]">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-6 md:px-12">
              <Link href="/projects">
                <span className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-white/90 transition-colors hover:text-white">
                  <ArrowLeft size={14} strokeWidth={1.5} aria-hidden />
                  {t.back}
                </span>
              </Link>
              {heroSlideCount > 0 ? (
                <span
                  className="rounded-full bg-black/35 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-white/95 backdrop-blur-sm"
                  aria-live="polite"
                >
                  {safeHeroIndex + 1} / {heroSlideCount}
                </span>
              ) : null}
            </div>
          </div>

          {heroSlideCount > 1 ? (
            <>
              <button
                type="button"
                onClick={heroPrev}
                disabled={safeHeroIndex === 0}
                aria-label={t.previous}
                className="absolute left-3 top-1/2 z-[4] inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1c1917] shadow-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 md:left-6 md:h-12 md:w-12"
              >
                <ChevronLeft size={22} strokeWidth={1.75} aria-hidden />
              </button>
              <button
                type="button"
                onClick={heroNext}
                disabled={safeHeroIndex >= heroSlideCount - 1}
                aria-label={t.next}
                className="absolute right-3 top-1/2 z-[4] inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1c1917] shadow-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 md:right-6 md:h-12 md:w-12"
              >
                <ChevronRight size={22} strokeWidth={1.75} aria-hidden />
              </button>
              <div className="absolute bottom-6 left-1/2 z-[4] flex -translate-x-1/2 gap-2">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${listing.code} — ${i + 1}`}
                    aria-current={i === safeHeroIndex ? "true" : undefined}
                    onClick={() => setHeroIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === safeHeroIndex ? "w-8 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </header>

      <section className="relative z-[2] mx-auto max-w-[1500px] px-6 pb-10 pt-10 md:px-12 md:pb-12 lg:pb-14">
        {(() => {
          const titleStr = (listing.title || listing.code || "").trim();
          const parts = titleStr.split(/\s+/);
          const head = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
          const tail = parts[parts.length - 1] || "";
          return (
            <h1
              className="line-clamp-3 break-words font-serif font-light leading-[1.05] tracking-[-0.02em] text-[clamp(1.75rem,5vw,3rem)]"
              style={{
                fontFamily: FONT_SERIF,
                color: PALETTE.brand,
                fontWeight: 300,
              }}
            >
              {head ? (
                <>
                  {head}{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 300 }}>{tail}</em>
                </>
              ) : (
                <em style={{ fontStyle: "italic", fontWeight: 300 }}>{tail}</em>
              )}
            </h1>
          );
        })()}

        <nav
          aria-label="Breadcrumb"
          className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1"
          style={{ fontFamily: FONT_SANS, fontSize: 13, color: PALETTE.brandSoft }}
        >
          <Link href="/" className="transition-opacity hover:opacity-100" style={{ opacity: 0.75 }}>
            {t.home}
          </Link>
          <BreadcrumbChevron />
          <Link href="/projects" className="transition-opacity hover:opacity-100" style={{ opacity: 0.75 }}>
            {t.property}
          </Link>
          {area && area !== "—" ? (
            <>
              <BreadcrumbChevron />
              <Link href="/projects" className="transition-opacity hover:opacity-100" style={{ opacity: 0.75 }}>
                {area}
              </Link>
            </>
          ) : null}
          <BreadcrumbChevron />
          <span className="max-w-[60vw] truncate" style={{ color: PALETTE.brand, fontWeight: 500 }}>
            {listing.code}
          </span>
        </nav>
      </section>

      {/* STORY: SectionLabel title, body fills width minus 3cm side margins  */}
      <section className="page-container page-gutter pb-16 pt-2 md:pb-20 lg:pb-24">
        <SectionLabel className="font-bold">{t.story}</SectionLabel>

        <div className="mt-6 md:mt-8">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <Fragment key={i}>
                <p
                  className="lp-narrative-para"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 16,
                    lineHeight: 1.85,
                    color: PALETTE.brandSoft,
                    textAlign: "justify",
                    hyphens: "auto",
                    marginBottom: 22,
                  }}
                >
                  {p}
                </p>
                {i === 0 && pullquote ? (
                  <blockquote
                    className="mx-auto my-10 py-4 text-center"
                    style={{
                      fontFamily: FONT_SERIF,
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: "clamp(20px, 2vw, 26px)",
                      lineHeight: 1.45,
                      color: PALETTE.brand,
                      maxWidth: 620,
                    }}
                  >
                    &ldquo;{pullquote}&rdquo;
                  </blockquote>
                ) : null}
              </Fragment>
            ))
          ) : (
            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: 16,
                lineHeight: 1.85,
                color: PALETTE.brandSoft,
                textAlign: "justify",
              }}
            >
              Contact us for full specifications and availability for this property.
            </p>
          )}
        </div>
      </section>

      {/* STATS: 2×5 icon card grid — brand teal section bg, white cards ===== */}
      <section
        className="px-6 py-10 md:px-12 md:py-14"
        style={{
          borderTop: `1px solid ${PALETTE.rule}`,
          borderBottom: `1px solid ${PALETTE.rule}`,
          backgroundColor: PALETTE.brand,
        }}
      >
        <div className="mx-auto grid max-w-[1500px] auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-5 md:gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 md:gap-3"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 14,
                padding: "12px 14px",
                boxShadow:
                  "0 1px 2px rgba(28,25,23,0.04), 0 2px 6px -2px rgba(28,25,23,0.04)",
                color: PALETTE.brand,
                fontFamily: FONT_SANS,
              }}
            >
              <span
                aria-hidden
                className="inline-flex shrink-0 items-center justify-center"
                style={{ width: 30, height: 30, color: PALETTE.brand }}
              >
                {s.icon}
              </span>
              <div className="flex min-w-0 flex-col">
                <span
                  className="truncate"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: PALETTE.brand,
                    opacity: 0.65,
                    letterSpacing: "0.01em",
                  }}
                >
                  {s.label}
                </span>
                <span
                  className="truncate"
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: PALETTE.brand,
                    lineHeight: 1.25,
                  }}
                  title={typeof s.value === "string" ? s.value : undefined}
                >
                  {s.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOCATION MAP + ACTION SIDEBAR ===================================== */}
      {(() => {
        const locationLabel = (listing.location?.trim() || area || "Bali").toString();
        const mapQuery = `${locationLabel}, Bali`;
        const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
        const mailtoHref = `mailto:${getContactEmail()}?subject=${encodeURIComponent(
          `${t.requestedListing}: ${listing.code} · ${listing.title || ""}`,
        )}`;
        const cardShadow =
          "0 1px 2px rgba(28,25,23,0.04), 0 12px 28px -16px rgba(28,25,23,0.12)";
        return (
          <section className="px-6 py-6 md:px-12 md:py-8">
            <div className="mx-auto grid max-w-[1300px] items-start gap-3 md:gap-4 lg:grid-cols-[1.7fr_1fr]">
              {/* LEFT COLUMN — Map card + Nearby card stacked */}
              <div className="flex flex-col gap-3 md:gap-4">
                {/* Map card */}
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${PALETTE.rule}`,
                    boxShadow: cardShadow,
                  }}
                >
                  <div
                    className="px-4 pt-3 pb-1.5 md:px-5"
                    style={{
                      fontFamily: FONT_SERIF,
                      fontSize: 15,
                      fontWeight: 500,
                      color: PALETTE.brand,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t.location}
                  </div>
                  <div className="relative w-full" style={{ aspectRatio: "16 / 8" }}>
                    <iframe
                      title={`Map of ${locationLabel}`}
                      src={mapSrc}
                      className="absolute inset-0 h-full w-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Nearby card */}
                <NearbyCard data={NEARBY_DEFAULT} t={t} />
              </div>

              {/* RIGHT COLUMN — Action sidebar (sticky on lg+) */}
              <div className="lg:sticky lg:top-24">
                <div
                  className="flex flex-col rounded-2xl p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${PALETTE.rule}`,
                    boxShadow: cardShadow,
                    color: PALETTE.brand,
                  }}
                >
                {/* Location + code row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1">
                    <span
                      aria-hidden
                      className="inline-flex shrink-0 items-center justify-center"
                      style={{ width: 14, height: 14, color: PALETTE.brand }}
                    >
                      <StatIcon name="pin" />
                    </span>
                    <span
                      className="truncate"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 12,
                        fontWeight: 600,
                        color: PALETTE.brand,
                      }}
                    >
                      {locationLabel}
                    </span>
                  </div>
                  <span
                    className="shrink-0"
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: PALETTE.brand,
                    }}
                  >
                    {listing.code}
                  </span>
                </div>

                <div
                  className="my-2.5"
                  style={{ borderTop: `1px solid ${PALETTE.rule}` }}
                />

                {/* Price + tenure row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 10.5,
                          fontWeight: 500,
                          color: PALETTE.brand,
                          opacity: 0.7,
                        }}
                      >
                        {t.price}
                      </span>
                      {/* Currency pill — mirrors navbar selection */}
                      <label className="relative inline-flex">
                        <span className="sr-only">Currency</span>
                        <select
                          value={currency}
                          onChange={(e) =>
                            setSiteCurrency(e.target.value as SiteCurrency)
                          }
                          className="appearance-none rounded-full pl-1.5 pr-4 py-0 text-[10px] font-semibold uppercase tracking-wide focus:outline-none focus:ring-2"
                          style={{
                            fontFamily: FONT_SANS,
                            backgroundColor: PALETTE.brandSoft + "12",
                            color: PALETTE.brand,
                            border: `1px solid ${PALETTE.rule}`,
                          }}
                        >
                          {CURRENCY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <svg
                          aria-hidden
                          viewBox="0 0 20 20"
                          width="8"
                          height="8"
                          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2"
                          style={{ color: PALETTE.brand }}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </label>
                    </div>
                    <div
                      className="mt-0.5 truncate"
                      style={{
                        fontFamily: FONT_SERIF,
                        fontSize: "clamp(16px, 2vw, 20px)",
                        fontWeight: 600,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        color: PALETTE.brand,
                      }}
                    >
                      {priceDisplay}
                    </div>
                  </div>
                  {ownership && ownership !== "—" ? (
                    <div className="shrink-0 text-right">
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontSize: 10.5,
                          fontWeight: 500,
                          color: PALETTE.brand,
                          opacity: 0.7,
                        }}
                      >
                        {ownership}
                      </div>
                      {leaseLabel ? (
                        <div
                          className="mt-0.5"
                          style={{
                            fontFamily: FONT_SERIF,
                            fontSize: 14,
                            fontWeight: 600,
                            lineHeight: 1.1,
                            color: PALETTE.brand,
                          }}
                        >
                          {leaseLabel}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {/* Action buttons */}
                <div className="mt-3 flex flex-col gap-1.5">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-[11.5px] font-semibold transition-opacity"
                    style={{
                      fontFamily: FONT_SANS,
                      backgroundColor: "#25D366",
                      color: "#ffffff",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="currentColor"
                    >
                      <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0C5.37 0 .04 5.33.04 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.25-1.64a11.94 11.94 0 0 0 5.75 1.46h.01c6.62 0 11.95-5.33 11.95-11.95 0-3.19-1.24-6.19-3.44-8.39ZM12 21.79h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.71.97.99-3.61-.23-.37a9.85 9.85 0 0 1-1.5-5.24c0-5.45 4.43-9.88 9.89-9.88a9.85 9.85 0 0 1 9.88 9.89c0 5.45-4.43 9.82-9.94 9.82Zm5.65-7.36c-.31-.16-1.83-.9-2.11-1-.28-.1-.49-.16-.7.16-.21.31-.81 1-1 1.21-.18.21-.37.23-.69.08-.31-.16-1.31-.48-2.5-1.54-.92-.82-1.55-1.84-1.73-2.15-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.7-1.7-.96-2.32-.25-.6-.51-.52-.7-.53l-.6-.01c-.21 0-.55.08-.83.39-.28.31-1.09 1.07-1.09 2.61 0 1.54 1.12 3.03 1.28 3.24.16.21 2.21 3.38 5.36 4.74.75.33 1.33.52 1.79.66.75.24 1.44.21 1.98.13.6-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.28-.21-.6-.37Z" />
                    </svg>
                    {t.whatsappAgent}
                  </a>

                  <a
                    href={mailtoHref}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-[11.5px] font-semibold transition-colors"
                    style={{
                      fontFamily: FONT_SANS,
                      backgroundColor: PALETTE.brand,
                      color: PALETTE.cream,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = PALETTE.brandDeep)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = PALETTE.brand)
                    }
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    {t.emailAgent}
                  </a>
                </div>
              </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* SIMILAR LISTINGS — real inventory from Google Sheet, matched by area / beds / price */}
      {similarCards.length > 0 ? (
        <section className="pt-10 pb-14 md:pt-12 md:pb-20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10">
            <div className="mb-10 mx-auto max-w-2xl text-center md:mb-14">
              <h2 className="font-serif text-3xl font-bold uppercase tracking-[0.06em] text-primary md:text-4xl lg:text-[2.35rem]">
                {t.similarTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#1c1917]/70 md:text-base">
                {t.similarSub}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {similarCards.map((model, idx) => (
                <FeaturedListingCard
                  key={`${model.id}-${idx}`}
                  model={model}
                  idx={idx}
                  onImageUnavailable={isPreview ? undefined : dismissSimilarListing}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* LIGHTBOX ========================================================= */}
      {lightboxIndex !== null && allImages[lightboxIndex] ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            // Translucent cream veil so the page is still visible underneath…
            backgroundColor: "rgba(244, 241, 234, 0.55)",
            // …then heavily blurred for a frosted-glass feel.
            backdropFilter: "blur(28px) saturate(150%)",
            WebkitBackdropFilter: "blur(28px) saturate(150%)",
            fontFamily: FONT_SANS,
            color: PALETTE.brand,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={listing.title || listing.code}
          onClick={(e) => {
            // Click on the blurred backdrop (not on the image / buttons) closes.
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Top bar */}
          <div className="flex shrink-0 items-center justify-between px-5 py-4 md:px-7">
            <span
              className="truncate"
              style={{
                color: PALETTE.brand,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.01em",
                maxWidth: "70%",
              }}
            >
              {listing.title || listing.code}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label={t.close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/10"
              style={{ color: PALETTE.brand }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Image + arrows */}
          <div
            className="relative flex flex-1 items-center justify-center px-3 md:px-16"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
          >
            <button
              type="button"
              onClick={lightboxPrev}
              disabled={lightboxIndex === 0}
              aria-label={t.previous}
              className="absolute left-2 z-[2] inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-25 md:left-6"
              style={{ color: PALETTE.brand, backgroundColor: "rgba(244, 241, 234, 0.55)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <img
              src={allImages[lightboxIndex]}
              alt={`${listing.title || listing.code} — ${lightboxIndex + 1} / ${allImages.length}`}
              className="max-h-[72vh] max-w-full select-none object-contain"
              style={{
                borderRadius: 6,
                // Subtle soft shadow so the image stands off the blurry backdrop.
                boxShadow: "0 30px 80px -20px rgba(28, 25, 23, 0.35), 0 8px 24px -8px rgba(28, 25, 23, 0.18)",
              }}
              draggable={false}
            />
            <button
              type="button"
              onClick={lightboxNext}
              disabled={lightboxIndex >= allImages.length - 1}
              aria-label={t.next}
              className="absolute right-2 z-[2] inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-25 md:right-6"
              style={{ color: PALETTE.brand, backgroundColor: "rgba(244, 241, 234, 0.55)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Counter + thumbnail strip */}
          <div className="shrink-0 px-5 pb-5 pt-2 md:px-7">
            <div
              className="mb-2"
              style={{
                color: PALETTE.brand,
                opacity: 0.7,
                fontSize: 13,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {lightboxIndex + 1} / {allImages.length}
            </div>
            <div
              ref={thumbsRef}
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "thin" }}
            >
              {allImages.map((url, i) => {
                const isActive = i === lightboxIndex;
                return (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    data-thumb-idx={i}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`${i + 1} / ${allImages.length}`}
                    aria-current={isActive ? "true" : undefined}
                    className="relative shrink-0 overflow-hidden transition-opacity"
                    style={{
                      width: 96,
                      height: 64,
                      borderRadius: 6,
                      outline: isActive ? `2px solid ${PALETTE.brand}` : "2px solid transparent",
                      outlineOffset: 0,
                      opacity: isActive ? 1 : 0.55,
                    }}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Page-scoped styles for animations, dropcap, input theming */}
      <style>{`
        @keyframes lp-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.3); } }
        @keyframes lp-slowZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        .lp-narrative-para:first-of-type::first-letter {
          font-family: ${FONT_SERIF};
          font-size: 64px;
          float: left;
          line-height: .85;
          margin: 6px 12px 0 -2px;
          color: ${PALETTE.brand};
          font-style: italic;
        }
        .lp-input {
          height: 48px;
          font-family: ${FONT_SANS};
          font-size: 14px;
          color: ${PALETTE.brand};
          background: rgba(255,255,255,0.65);
          border: 1px solid ${PALETTE.rule};
          border-radius: 2px;
          padding: 0 14px;
          box-shadow: none;
        }
        textarea.lp-input { padding: 12px 14px; }
        .lp-input::placeholder { color: rgba(43,40,32,0.4); }
        .lp-input:focus-visible {
          outline: none;
          border-color: ${PALETTE.brand};
          box-shadow: 0 0 0 3px rgba(1, 81, 78, 0.14);
        }
        .lp-btn {
          height: 56px;
          padding: 0 28px;
          font-family: ${FONT_SANS};
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 2px;
          transition: all .3s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .lp-btn-primary:hover {
          background: ${PALETTE.brandDeep} !important;
          border-color: ${PALETTE.brandDeep} !important;
          color: ${PALETTE.cream} !important;
          transform: translateY(-1px);
        }
        .lp-btn-ghost:hover {
          background: ${PALETTE.brand} !important;
          border-color: ${PALETTE.brand} !important;
          color: ${PALETTE.cream} !important;
        }
      `}</style>
    </div>
  );
}

/**
 * Render a numeric value followed by its unit, with the unit smaller/lighter.
 * Falls back to an em-dash when the value is missing.
 */
function numberWithUnit(raw: string | undefined | null, unit: string): React.ReactNode {
  const cleaned = (raw ?? "").trim();
  if (!cleaned) return "—";
  // Strip any unit the value already includes (e.g. "1240 m²" -> "1240").
  const num = cleaned.replace(new RegExp(`\\s*${unit}.*$`, "i"), "");
  return (
    <span className="inline-flex items-baseline">
      {num}
      <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 500, opacity: 0.75 }}>{unit}</span>
    </span>
  );
}

/**
 * Line-art icons used in the stats card row. `name` selects the glyph.
 * All icons share the same stroke style so the row reads as a system.
 */
function StatIcon({
  name,
}: {
  name:
    | "bed"
    | "bath"
    | "land"
    | "building"
    | "tenure"
    | "calendar"
    | "pin"
    | "price"
    | "stairs"
    | "zoning"
    | "sofa";
}) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "bed":
      return (
        <svg {...common}>
          <path d="M3 18v-5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5" />
          <path d="M3 18v2M21 18v2M3 14h18" />
          <rect x="7" y="10.5" width="4" height="2" rx="0.5" />
        </svg>
      );
    case "bath":
      return (
        <svg {...common}>
          <path d="M5 12V6a2 2 0 0 1 4 0v.5" />
          <circle cx="9" cy="8" r="1.4" />
          <path d="M3 12h18" />
          <path d="M5 12v2a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-2" />
          <path d="M7 18l-1 3M17 18l1 3" />
        </svg>
      );
    case "land":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <path d="M8 4v3M16 4v3M4 8h3M4 16h3M17 17l3 3" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9" />
          <path d="M3 11l9-7 9 7" />
          <path d="M10 21v-5h4v5" />
        </svg>
      );
    case "tenure":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 3v4M16 3v4" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "price":
      return (
        <svg {...common}>
          <path d="M12 2v20" />
          <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "stairs":
      return (
        <svg {...common}>
          <path d="M3 21h4v-4h4v-4h4v-4h4v-4h2" />
          <path d="M3 21v-1" />
        </svg>
      );
    case "zoning":
      return (
        <svg {...common}>
          <path d="M12 3l-5 7h3v4h-2l-3 5h14l-3-5h-2v-4h3z" />
          <line x1="12" y1="19" x2="12" y2="21" />
        </svg>
      );
    case "sofa":
      return (
        <svg {...common}>
          <path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4H4z" />
          <path d="M4 13V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <path d="M7 11V8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
          <path d="M4 17v2M20 17v2" />
        </svg>
      );
  }
}

function BreadcrumbChevron() {
  return (
    <svg
      aria-hidden
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.5, flexShrink: 0 }}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

type NearbyKey = "shopping" | "cafes" | "landmarks";

interface NearbyPlace {
  name: string;
  /** Distance in metres from the property. */
  distance: number;
}

/** Indicative POI data — universal Bali staples that work for most listings.
 * Easy to swap for a real Google Places call later (the prop signature only
 * needs `Record<NearbyKey, NearbyPlace[]>`). */
const NEARBY_DEFAULT: Record<NearbyKey, NearbyPlace[]> = {
  shopping: [
    { name: "Indomaret", distance: 418 },
    { name: "Alfamart", distance: 498 },
    { name: "Alfamart", distance: 564 },
    { name: "Pepito", distance: 762 },
  ],
  cafes: [
    { name: "Crate Cafe", distance: 320 },
    { name: "Milk & Madu", distance: 540 },
    { name: "Sisterfields", distance: 620 },
    { name: "Revolver Espresso", distance: 780 },
    { name: "The Loft", distance: 850 },
    { name: "Cafe Vida", distance: 920 },
    { name: "Watercress", distance: 1100 },
    { name: "Cafe Organic", distance: 1250 },
  ],
  landmarks: [
    { name: "Pererenan Beach", distance: 650 },
  ],
};

/**
 * Similar-properties data shape. Minimal seed shape; rendered with the shared
 * homepage `FeaturedListingCard` so the look matches the rest of the site.
 * Swap for a real "GET /properties?area=…&limit=3" call without rewiring.
 */
interface SimilarSeed {
  id: string;
  code: string;
  href: string;
  title: string;
  imageUrl: string;
  area: string;
  /** Indicative USD price; converted at render time to the selected currency. */
  priceUsd: number;
  ownership: string;
  bedrooms: string;
  buildingSqm: string | null;
  landSqm: string | null;
  leaseYears: string | null;
  featured: boolean;
  categoryLabel: string;
  showGreatDeal: boolean;
}

/** Indicative similar-listings used for the preview route. */
const SIMILAR_LISTINGS_DEFAULT: SimilarSeed[] = [
  {
    id: "sim-1",
    code: "OPUM015",
    href: "/properties/preview",
    title: "6 Bedroom Villa in Umalas with Modern Luxury Tropical Design",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    area: "Umalas",
    priceUsd: 2_450_000,
    ownership: "Leasehold",
    bedrooms: "6",
    buildingSqm: "700",
    landSqm: "450",
    leaseYears: "30 Years",
    featured: true,
    categoryLabel: "Residential",
    showGreatDeal: false,
  },
  {
    id: "sim-2",
    code: "OPUM037",
    href: "/properties/preview",
    title: "Ocean-View Estate in Uluwatu with Infinity Pool",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    area: "Uluwatu",
    priceUsd: 3_200_000,
    ownership: "Freehold",
    bedrooms: "5",
    buildingSqm: "850",
    landSqm: "520",
    leaseYears: null,
    featured: true,
    categoryLabel: "Investment",
    showGreatDeal: false,
  },
  {
    id: "sim-3",
    code: "OPUM052",
    href: "/properties/preview",
    title: "Designer Villa Walking Distance to Pererenan Beach",
    imageUrl: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=1200&q=80",
    area: "Pererenan",
    priceUsd: 1_890_000,
    ownership: "Leasehold",
    bedrooms: "4",
    buildingSqm: "550",
    landSqm: "380",
    leaseYears: "25 Years",
    featured: false,
    categoryLabel: "Residential",
    showGreatDeal: true,
  },
];

/** Project a SimilarSeed into the homepage card's model with a currency-aware price. */
function similarToFeaturedModel(s: SimilarSeed, currency: SiteCurrency): FeaturedCardModel {
  return {
    id: s.id,
    href: s.href,
    code: s.code,
    title: s.title,
    imageUrl: s.imageUrl,
    imageAlt: s.title,
    area: s.area,
    priceDisplay: formatCurrency(convertFromUsd(s.priceUsd, currency), currency),
    ownership: s.ownership,
    bedrooms: s.bedrooms,
    buildingSqm: s.buildingSqm,
    landSqm: s.landSqm,
    leaseYears: s.leaseYears,
    featured: s.featured,
    categoryLabel: s.categoryLabel,
    showGreatDeal: s.showGreatDeal,
    externalListingUrl: null,
  };
}

function NearbyCategoryIcon({ name }: { name: NearbyKey | "store" | "coffee" | "landmark" }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "shopping":
    case "store":
      return (
        <svg {...common}>
          <path d="M3 9h18l-1.5 11a1 1 0 0 1-1 .9H5.5a1 1 0 0 1-1-.9L3 9Z" />
          <path d="M8 9V6a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "cafes":
    case "coffee":
      return (
        <svg {...common}>
          <path d="M4 8h14v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
          <path d="M18 10h2a2 2 0 0 1 0 4h-2" />
          <path d="M8 3v2M12 3v2" />
        </svg>
      );
    case "landmarks":
    case "landmark":
      return (
        <svg {...common}>
          <path d="M5 21V9l7-5 7 5v12" />
          <path d="M9 21v-6h6v6" />
          <path d="M10 11h.01M14 11h.01" />
        </svg>
      );
  }
}

/** Formats metres as "418 m" below 1000m and "1.2 km" above. */
function formatDistance(metres: number): string {
  if (metres < 1000) return `${metres} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

function NearbyCard({
  data,
  t,
}: {
  data: Record<NearbyKey, NearbyPlace[]>;
  t: Record<string, string>;
}) {
  const [active, setActive] = useState<NearbyKey>("shopping");
  const categories: { key: NearbyKey; label: string }[] = [
    { key: "shopping", label: t.shopping },
    { key: "cafes", label: t.cafes },
    { key: "landmarks", label: t.landmarks },
  ];
  const places = data[active] ?? [];
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: "#ffffff",
        border: `1px solid ${PALETTE.rule}`,
        boxShadow:
          "0 1px 2px rgba(28,25,23,0.04), 0 12px 28px -16px rgba(28,25,23,0.12)",
        color: PALETTE.brand,
      }}
    >
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: PALETTE.brand,
          lineHeight: 1.1,
        }}
      >
        {t.nearby}
      </div>
      <div
        className="mt-0.5"
        style={{
          fontFamily: FONT_SANS,
          fontSize: 10.5,
          color: PALETTE.brand,
          opacity: 0.7,
        }}
      >
        {t.nearbySub}
      </div>

      {/* Category pills */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {categories.map((c) => {
          const isActive = c.key === active;
          const count = data[c.key]?.length ?? 0;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c.key)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold transition-colors"
              style={{
                fontFamily: FONT_SANS,
                backgroundColor: isActive ? PALETTE.brand : "rgba(1, 81, 78, 0.06)",
                color: isActive ? PALETTE.cream : PALETTE.brand,
                border: `1px solid ${isActive ? PALETTE.brand : PALETTE.rule}`,
              }}
            >
              <NearbyCategoryIcon name={c.key} />
              <span>{c.label}</span>
              <span
                className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                style={{
                  backgroundColor: isActive ? "rgba(244, 241, 234, 0.18)" : "#ffffff",
                  color: isActive ? PALETTE.cream : PALETTE.brand,
                  border: isActive ? "none" : `1px solid ${PALETTE.rule}`,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Place grid */}
      {places.length === 0 ? (
        <div
          className="mt-3"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            color: PALETTE.brand,
            opacity: 0.6,
          }}
        >
          —
        </div>
      ) : (
        <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
          {places.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex items-center gap-2 rounded-xl px-2.5 py-1.5"
              style={{
                backgroundColor: "rgba(1, 81, 78, 0.02)",
                border: `1px solid ${PALETTE.rule}`,
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "rgba(1, 81, 78, 0.08)",
                  color: PALETTE.brand,
                }}
              >
                <NearbyCategoryIcon name={active} />
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="truncate"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: PALETTE.brand,
                    lineHeight: 1.15,
                  }}
                >
                  {p.name}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 10,
                    color: PALETTE.brand,
                    opacity: 0.6,
                  }}
                >
                  {t[active]}
                </div>
              </div>
              <span
                className="inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-0 text-[9.5px] font-semibold"
                style={{
                  fontFamily: FONT_SANS,
                  backgroundColor: PALETTE.brand,
                  color: PALETTE.cream,
                }}
              >
                {formatDistance(p.distance)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionLabel({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 uppercase ${className ?? ""}`}
      style={{
        fontFamily: FONT_MONO,
        fontSize: 11,
        letterSpacing: "0.2em",
        color: PALETTE.brand,
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 32,
          height: 1,
          backgroundColor: PALETTE.brand,
          opacity: tone === "dark" ? 0.9 : 1,
        }}
      />
      <span>{children}</span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label
      className="mb-2 block uppercase"
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.22em",
        color: PALETTE.brandSoft,
        opacity: 0.75,
      }}
    >
      {children}
    </Label>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel>
        {label}
        {required ? <span style={{ color: PALETTE.brand, marginLeft: 4 }}>*</span> : null}
      </FieldLabel>
      {children}
    </div>
  );
}

function ErrorState({
  title,
  subtitle,
  backLabel,
  extra,
}: {
  title: string;
  subtitle?: string;
  backLabel: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen px-6 pt-32 text-center"
      style={{ backgroundColor: PALETTE.paper, color: PALETTE.brand, fontFamily: FONT_SANS }}
    >
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 36,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          color: PALETTE.brand,
          fontVariationSettings: '"opsz" 96',
        }}
      >
        {title}
      </p>
      {subtitle ? (
        <p
          className="mx-auto mt-4 max-w-md"
          style={{ fontFamily: FONT_SANS, fontSize: 14, color: PALETTE.brandSoft, opacity: 0.7 }}
        >
          {subtitle}
        </p>
      ) : null}
      {extra}
      <Link href="/projects">
        <Button
          className="mt-8 h-12 rounded-none px-6"
          style={{ backgroundColor: PALETTE.brand, color: PALETTE.cream, letterSpacing: "0.14em" }}
        >
          ← {backLabel}
        </Button>
      </Link>
    </div>
  );
}
