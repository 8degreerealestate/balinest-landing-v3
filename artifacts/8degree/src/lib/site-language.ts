import { useEffect, useState } from "react";

export const LANGUAGE_STORAGE_KEY = "8degree.language";

export type SiteLanguage = "id" | "en" | "fr" | "zh" | "tr";

export const LANGUAGE_OPTIONS: Array<{ code: SiteLanguage; label: string }> = [
  { code: "id", label: "Indonesia" },
  { code: "en", label: "English" },
  { code: "fr", label: "France" },
  { code: "zh", label: "Chinese" },
  { code: "tr", label: "Turkish" },
];

export const UI_COPY: Record<
  SiteLanguage,
  {
    properties: string;
    portfolio: string;
    invest: string;
    aboutUs: string;
    journal: string;
    enquire: string;
    services: string;
    guides: string;
    learnMore: string;
    language: string;
    currency: string;
    openMenu: string;
    closeMenu: string;
    propertySection: string;
    companySection: string;
    realEstateForSale: string;
    realEstateForSaleDesc: string;
    longTermRentals: string;
    longTermRentalsDesc: string;
    buyersAgent: string;
    buyersAgentDesc: string;
    sellersAgent: string;
    sellersAgentDesc: string;
    legalGuide: string;
    legalGuideDesc: string;
    locationGuide: string;
    locationGuideDesc: string;
    investmentGuide: string;
    investmentGuideDesc: string;
  }
> = {
  en: {
    properties: "Properties",
    portfolio: "Portfolio",
    invest: "Invest",
    aboutUs: "About Us",
    journal: "Journal",
    enquire: "Enquire",
    services: "Services",
    guides: "Guides",
    learnMore: "Learn more",
    language: "Language",
    currency: "Currency",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    propertySection: "Property",
    realEstateForSale: "Real estate for sale",
    realEstateForSaleDesc:
      "Browse developments and listings across Bali—curated for buyers seeking quality, clarity, and strategic fit.",
    longTermRentals: "Long term rentals",
    longTermRentalsDesc:
      "Explore villa and home rentals for extended stays—ideal for relocation, remote work, or seasonal living in Bali.",
    buyersAgent: "Buyer's Agent",
    buyersAgentDesc:
      "With our exclusive buyer service, you gain privileged access to Bali's most sought-after properties and structured guidance throughout the acquisition process.",
    sellersAgent: "Seller's Agent",
    sellersAgentDesc:
      "We build targeted marketing strategies, professional presentation, and smart distribution so your property stands out and reaches qualified buyers faster.",
    legalGuide: "Legal Guide",
    legalGuideDesc:
      "Understand legal structure, ownership pathways, and due diligence checkpoints before acquiring property in Bali.",
    locationGuide: "Location Guide",
    locationGuideDesc:
      "Compare Bali areas by lifestyle, rental demand, and long-term growth potential to match your strategy.",
    investmentGuide: "Investment Guide",
    investmentGuideDesc:
      "Get the practical framework for yields, risk evaluation, financing, and execution for Bali property investment.",
  },
  id: {
    properties: "Properti",
    portfolio: "Portofolio",
    invest: "Investasi",
    aboutUs: "Tentang Kami",
    journal: "Jurnal",
    enquire: "Hubungi",
    services: "Layanan",
    guides: "Panduan",
    learnMore: "Pelajari lebih lanjut",
    language: "Bahasa",
    currency: "Mata Uang",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    propertySection: "Properti",
    companySection: "Perusahaan",
    realEstateForSale: "Properti dijual",
    realEstateForSaleDesc:
      "Jelajahi pengembangan dan listing di Bali—terkurasi untuk pembeli yang mengutamakan kualitas, kejelasan, dan kesesuaian strategis.",
    longTermRentals: "Sewa jangka panjang",
    longTermRentalsDesc:
      "Temukan sewa villa dan rumah untuk tinggal lebih lama—cocok untuk relokasi, kerja remote, atau musiman di Bali.",
    buyersAgent: "Agen Pembeli",
    buyersAgentDesc:
      "Layanan pembeli eksklusif kami memberi akses istimewa ke properti paling dicari di Bali dan panduan terstruktur sepanjang proses akuisisi.",
    sellersAgent: "Agen Penjual",
    sellersAgentDesc:
      "Kami membangun strategi pemasaran terarah, presentasi profesional, dan distribusi cerdas agar properti Anda menonjol dan menjangkau pembeli berkualitas lebih cepat.",
    legalGuide: "Panduan Hukum",
    legalGuideDesc:
      "Pahami struktur hukum, jalur kepemilikan, dan titik due diligence sebelum membeli properti di Bali.",
    locationGuide: "Panduan Lokasi",
    locationGuideDesc:
      "Bandingkan area Bali berdasarkan gaya hidup, permintaan sewa, dan potensi pertumbuhan jangka panjang.",
    investmentGuide: "Panduan Investasi",
    investmentGuideDesc:
      "Kerangka praktis untuk yield, evaluasi risiko, pembiayaan, dan eksekusi investasi properti Bali.",
  },
  fr: {
    properties: "Proprietes",
    portfolio: "Portefeuille",
    invest: "Investir",
    aboutUs: "A propos",
    journal: "Journal",
    enquire: "Demande",
    services: "Services",
    guides: "Guides",
    learnMore: "En savoir plus",
    language: "Langue",
    currency: "Devise",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    propertySection: "Propriete",
    companySection: "Entreprise",
    realEstateForSale: "Immobilier a vendre",
    realEstateForSaleDesc:
      "Parcourez projets et annonces a Bali—selectionnes pour des acheteurs exigeant qualite, clarte et coherence strategique.",
    longTermRentals: "Locations longue duree",
    longTermRentalsDesc:
      "Villas et maisons en location longue duree—ideales pour relocation, teletravail ou sejour saisonnier a Bali.",
    buyersAgent: "Agent acheteur",
    buyersAgentDesc:
      "Notre service acheteur exclusif offre un acces privilegie aux biens les plus recherches a Bali et un accompagnement structure.",
    sellersAgent: "Agent vendeur",
    sellersAgentDesc:
      "Marketing cible, presentation professionnelle et distribution intelligente pour atteindre plus vite des acheteurs qualifies.",
    legalGuide: "Guide juridique",
    legalGuideDesc:
      "Structure legale, voies de propriete et points de due diligence avant d'acquerir a Bali.",
    locationGuide: "Guide des zones",
    locationGuideDesc:
      "Comparez les quartiers de Bali selon lifestyle, demande locative et potentiel de croissance.",
    investmentGuide: "Guide investissement",
    investmentGuideDesc:
      "Cadre pratique pour rendements, risques, financement et execution d'investissement immobilier a Bali.",
  },
  zh: {
    properties: "房源",
    portfolio: "项目集",
    invest: "投资",
    aboutUs: "关于我们",
    journal: "博客",
    enquire: "咨询",
    services: "服务",
    guides: "指南",
    learnMore: "了解更多",
    language: "语言",
    currency: "货币",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    propertySection: "房产",
    companySection: "公司",
    realEstateForSale: "在售房产",
    realEstateForSaleDesc: "浏览巴厘岛的开发项目与房源——为追求品质、清晰与战略匹配的买家精选。",
    longTermRentals: "长期租赁",
    longTermRentalsDesc: "探索别墅与住宅长租——适合搬迁、远程办公或季节性居住。",
    buyersAgent: "买方顾问",
    buyersAgentDesc: "独家买方服务，优先接触巴厘岛优质房源，并在收购全程提供结构化指导。",
    sellersAgent: "卖方顾问",
    sellersAgentDesc: "精准营销、专业呈现与智能分发，让您的房产更快触达合格买家。",
    legalGuide: "法律指南",
    legalGuideDesc: "了解产权结构、持有路径及收购前的尽职调查要点。",
    locationGuide: "区域指南",
    locationGuideDesc: "按生活方式、租赁需求与长期增长潜力比较巴厘岛各区域。",
    investmentGuide: "投资指南",
    investmentGuideDesc: "收益、风险评估、融资与执行的实用框架。",
  },
  tr: {
    properties: "Mülkler",
    portfolio: "Portföy",
    invest: "Yatırım",
    aboutUs: "Hakkımızda",
    journal: "Blog",
    enquire: "İletişim",
    services: "Hizmetler",
    guides: "Rehberler",
    learnMore: "Daha fazla",
    language: "Dil",
    currency: "Para birimi",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    propertySection: "Mülk",
    companySection: "Şirket",
    realEstateForSale: "Satılık gayrimenkul",
    realEstateForSaleDesc:
      "Bali genelinde projeler ve ilanlar—kalite, netlik ve stratejik uyum arayan alıcılar için seçilmiş.",
    longTermRentals: "Uzun dönem kiralama",
    longTermRentalsDesc:
      "Uzun süreli konaklama için villa ve ev kiralamaları—taşınma, uzaktan çalışma veya mevsimlik yaşam için.",
    buyersAgent: "Alıcı danışmanı",
    buyersAgentDesc:
      "Özel alıcı hizmetimizle Bali'nin en çok aranan mülklerine ayrıcalıklı erişim ve yapılandırılmış rehberlik.",
    sellersAgent: "Satıcı danışmanı",
    sellersAgentDesc:
      "Hedefli pazarlama, profesyonel sunum ve akıllı dağıtım ile mülkünüz nitelikli alıcılara daha hızlı ulaşır.",
    legalGuide: "Hukuk rehberi",
    legalGuideDesc:
      "Bali'de mülk edinmeden önce hukuki yapı, mülkiyet yolları ve due diligence noktaları.",
    locationGuide: "Bölge rehberi",
    locationGuideDesc:
      "Yaşam tarzı, kira talebi ve uzun vadeli büyüme potansiyeline göre Bali bölgelerini karşılaştırın.",
    investmentGuide: "Yatırım rehberi",
    investmentGuideDesc:
      "Getiri, risk değerlendirmesi, finansman ve uygulama için pratik çerçeve.",
  },
};

export function safeLanguage(value: string | null | undefined): SiteLanguage {
  if (!value) return "en";
  if (value === "ru") return "fr";
  if (value === "id" || value === "en" || value === "fr" || value === "zh" || value === "tr") {
    return value;
  }
  return "en";
}

/** Returns the copy object for the active site language from a per-language dictionary. */
export function useSiteCopy<T>(dict: Record<SiteLanguage, T>): T {
  const language = useSiteLanguage();
  return dict[language];
}

export function useSiteLanguage(defaultLanguage: SiteLanguage = "en") {
  const [language, setLanguage] = useState<SiteLanguage>(defaultLanguage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLanguage(safeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)));

    const onStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) return;
      setLanguage(safeLanguage(event.newValue));
    };

    const onFocus = () => {
      setLanguage(safeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)));
    };
    const onLanguageChange = () => {
      setLanguage(safeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("site-language-change", onLanguageChange as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("site-language-change", onLanguageChange as EventListener);
    };
  }, []);

  return language;
}
