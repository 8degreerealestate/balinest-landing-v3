import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TeamPhotos } from "@/components/site/TeamPhotos";
import { SITE_MEDIA } from "@/lib/site-assets";
import { Seo } from "@/components/site/Seo";
import { jsonLdGraph, organizationJsonLdNode, truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/lib/utils";

type AboutOverviewCopy = {
  positionLabel: string;
  positionBefore: string;
  positionEmphasis: string;
  positionAfter: string;
  overviewEyebrow: string;
  precisionTitleBefore: string;
  precisionTitleEm: string;
  precisionBody: readonly [string, string];
  precisionQuote: string;
  practicesTitleBefore: string;
  practicesTitleEm: string;
  practicesBody: string;
  adviseLead: string;
  adviseItems: readonly string[];
  vettingLead: string;
  vettingItems: readonly string[];
};

const ABOUT_OVERVIEW_EN: AboutOverviewCopy = {
  positionLabel: "Position",
  positionBefore: "We are not a mass-market brokerage. ",
  positionEmphasis: "We are a strategic partner",
  positionAfter: " for clients who value clarity, structure, and long-term positioning.",
  overviewEyebrow: "Company overview",
  precisionTitleBefore: "Precision over ",
  precisionTitleEm: "volume.",
  precisionBody: [
    "8 Degree Real Estate is a boutique real estate investment advisory based in Bali. For over four years, we have operated at the intersection of strategic investment and quality living.",
    "With 80+ curated properties and 10+ high-value transactions, we focus on precision—not scale—in every mandate we accept.",
  ],
  precisionQuote: "Fewer options. Higher standards. Clear guidance.",
  practicesTitleBefore: "Two practices, one ",
  practicesTitleEm: "standard.",
  practicesBody:
    "We run parallel advisory tracks for investment-grade acquisitions and residential relocations—one diligence bar, one disclosure standard, and one long-term alignment with how clients actually use Bali property.",
  adviseLead: "We advise clients on:",
  adviseItems: [
    "Investment properties targeting 10–12% portfolio ROI performance.",
    "Residential homes for relocation and long-term living.",
    "High-value transactions above IDR 16 billion.",
    "Select off-market opportunities shared in confidence.",
    "Strategic portfolio positioning within Bali's evolving property landscape.",
  ],
  vettingLead: "Every property is vetted for:",
  vettingItems: [
    "Legal structure — titles, zoning, permits, and ownership clarity.",
    "Build quality — materials, workmanship, and ongoing maintenance load.",
    "Location fundamentals — what the area is becoming, not what it was.",
    "Developer credibility — track record, delivery history, and post-sale conduct.",
    "Long-term value sustainability — the answer to “what does this look like in 2035?”.",
  ],
} as const;

const ABOUT_OVERVIEW_ID: AboutOverviewCopy = {
  positionLabel: "Posisi",
  positionBefore: "Kami bukan broker mass-market. ",
  positionEmphasis: "Kami mitra strategis",
  positionAfter:
    " bagi klien yang menghargai kejelasan, struktur, dan positioning jangka panjang.",
  overviewEyebrow: "Profil perusahaan",
  precisionTitleBefore: "Presisi, bukan ",
  precisionTitleEm: "volume.",
  precisionBody: [
    "8 Degree Real Estate adalah advisory investasi properti butik di Bali. Selama lebih dari empat tahun, kami berada di persimpangan investasi strategis dan kualitas hidup.",
    "Dengan 80+ properti terkurasi dan 10+ transaksi bernilai tinggi, kami fokus pada presisi—bukan skala—pada setiap mandat yang kami terima.",
  ],
  precisionQuote: "Lebih sedikit opsi. Standar lebih tinggi. Panduan lebih jelas.",
  practicesTitleBefore: "Dua praktik, satu ",
  practicesTitleEm: "standar.",
  practicesBody:
    "Kami menjalankan jalur advisory paralel untuk akuisisi kelas investasi dan relokasi residensial—satu standar uji tuntas, satu standar pengungkapan, dan satu keselarasan jangka panjang dengan cara klien benar-benar menggunakan properti di Bali.",
  adviseLead: "Kami mendampingi klien pada:",
  adviseItems: [
    "Properti investasi dengan target ROI portofolio 10–12%.",
    "Hunian untuk relokasi dan hidup jangka panjang.",
    "Transaksi bernilai tinggi di atas IDR 16 miliar.",
    "Peluang off-market terpilih yang dibagikan secara rahasia.",
    "Posisi portofolio strategis dalam lanskap properti Bali yang terus berkembang.",
  ],
  vettingLead: "Setiap properti disaring untuk:",
  vettingItems: [
    "Struktur hukum — sertifikat, zonasi, izin, dan kejelasan kepemilikan.",
    "Kualitas bangunan — material, pengerjaan, dan beban pemeliharaan.",
    "Fundamental lokasi — ke arah mana kawasan ini berkembang, bukan semata masa lalunya.",
    "Kredibilitas pengembang — rekam jejak, histori penyerahan, dan perilaku pasca penjualan.",
    "Keberlanjutan nilai jangka panjang — jawaban atas “seperti apa ini di tahun 2035?”.",
  ],
};

const ABOUT_OVERVIEW_FR: AboutOverviewCopy = {
  positionLabel: "Positionnement",
  positionBefore: "Nous ne sommes pas une agence grand public. ",
  positionEmphasis: "Nous sommes un partenaire stratégique",
  positionAfter:
    " pour les clients qui valorisent la clarté, la structure et un positionnement long terme.",
  overviewEyebrow: "Vue d’ensemble",
  precisionTitleBefore: "La précision plutôt que le ",
  precisionTitleEm: "volume.",
  precisionBody: [
    "8 Degree Real Estate est un cabinet boutique de conseil en investissement immobilier basé à Bali. Depuis plus de quatre ans, nous opérons au croisement de l’investissement stratégique et de la qualité de vie.",
    "Avec plus de 80 biens curatés et plus de 10 transactions à forte valeur, nous privilégions la précision — pas l’échelle — sur chaque mandat.",
  ],
  precisionQuote: "Moins d’options. Des standards plus élevés. Des conseils clairs.",
  practicesTitleBefore: "Deux pratiques, un ",
  practicesTitleEm: "standard.",
  practicesBody:
    "Nous menons en parallèle des mandats d’acquisition pour l’investissement et de relocation résidentielle — une même barre de diligence, de transparence et un alignement long terme sur la façon dont les clients utilisent réellement un bien à Bali.",
  adviseLead: "Nous accompagnons nos clients sur :",
  adviseItems: [
    "Des biens d’investissement visant un ROI portefeuille de 10–12 %.",
    "Des résidences pour relocation et vie long terme.",
    "Des transactions de grande valeur au-delà de 16 milliards IDR.",
    "Des opportunités off-market sélectionnées et confidentielles.",
    "Un positionnement stratégique de portefeuille dans l’écosystème immobilier balinais en évolution.",
  ],
  vettingLead: "Chaque bien est examiné sur :",
  vettingItems: [
    "Structure juridique — titres, zonage, permis et clarté de la propriété.",
    "Qualité de construction — matériaux, exécution et charge de maintenance.",
    "Fondamentaux de l’emplacement — vers quoi la zone évolue, pas seulement son passé.",
    "Crédibilité du promoteur — historique de livraisons et conduite après-vente.",
    "Durabilité de la valeur — la réponse à « à quoi cela ressemble-t-il en 2035 ? ».",
  ],
};

const ABOUT_OVERVIEW_ZH: AboutOverviewCopy = {
  positionLabel: "定位",
  positionBefore: "我们不是大众经纪行。",
  positionEmphasis: "我们是战略伙伴",
  positionAfter: "，服务于重视清晰度、结构化安排与长期布局的客户。",
  overviewEyebrow: "公司概览",
  precisionTitleBefore: "精准胜于",
  precisionTitleEm: "规模。",
  precisionBody: [
    "8 Degree Real Estate 是总部位于巴厘岛的精品房地产投资顾问。四年来，我们一直在战略投资与高品质生活的交汇点开展工作。",
    "凭借 80+ 精选房源与 10+ 高价值交易，我们在每个委托中坚持精准，而非追求体量。",
  ],
  precisionQuote: "更少选择。更高标准。更清晰的指引。",
  practicesTitleBefore: "两条业务线，一个",
  practicesTitleEm: "标准。",
  practicesBody:
    "我们并行提供投资级收购与住宅搬迁顾问服务——同一套尽调门槛、同一套披露标准，并与客户实际使用巴厘岛房产的方式长期对齐。",
  adviseLead: "我们主要为客户提供：",
  adviseItems: [
    "目标投资组合 ROI 约 10–12% 的投资型房产。",
    "用于移居与长期居住的住宅。",
    "超过 IDR 160 亿的高价值交易。",
    "经筛选、保密的 off-market 机会。",
    "在巴厘岛不断演变的房地产市场中的战略组合定位。",
  ],
  vettingLead: "每一处房源都会核查：",
  vettingItems: [
    "法律结构——产权、分区、许可与权属清晰度。",
    "建筑质量——材料、工艺与持续维护成本。",
    "区位基本面——区域正向何处发展，而非仅看过去。",
    "开发商可信度——交付记录与售后行为。",
    "长期价值可持续性——回答“2035 年会是什么样子”。",
  ],
};

const ABOUT_OVERVIEW_TR: AboutOverviewCopy = {
  positionLabel: "Konumlandırma",
  positionBefore: "Biz kitlesel bir aracı değiliz. ",
  positionEmphasis: "Biz stratejik ortağınızız",
  positionAfter:
    " — netlik, yapı ve uzun vadeli konumlandırmayı önemseyen müşteriler için.",
  overviewEyebrow: "Şirket özeti",
  precisionTitleBefore: "Hacim yerine ",
  precisionTitleEm: "keskinlik.",
  precisionBody: [
    "8 Degree Real Estate, Bali merkezli butik bir gayrimenkul yatırım danışmanlığıdır. Dört yılı aşkın süredir stratejik yatırım ile yaşam kalitesinin kesişiminde çalışıyoruz.",
    "80+ seçilmiş ilan ve 10+ yüksek değerli işlemle her mandatta ölçek değil, keskinliğe odaklanıyoruz.",
  ],
  precisionQuote: "Daha az seçenek. Daha yüksek standart. Daha net yönlendirme.",
  practicesTitleBefore: "İki hat, tek ",
  practicesTitleEm: "standart.",
  practicesBody:
    "Yatırım niteliğinde satın almalar ve konut göçü için paralel danışmanlık yürütüyoruz — tek bir özen çizgisi, tek bir şeffaflık standardı ve müşterilerin Bali’deki gayrimenkulü gerçekten nasıl kullandığıyla uzun vadeli uyum.",
  adviseLead: "Müşterilerimize şu konularda eşlik ediyoruz:",
  adviseItems: [
    "10–12% portföy ROI hedefleyen yatırım gayrimenkulleri.",
    "Göç ve uzun süreli yaşam için konutlar.",
    "IDR 16 milyarın üzerindeki yüksek değerli işlemler.",
    "Güvenle paylaşılan seçilmiş off-market fırsatlar.",
    "Bali’nin gelişen gayrimenkul ortamında stratejik portföy konumlandırması.",
  ],
  vettingLead: "Her ilan şunlar için incelenir:",
  vettingItems: [
    "Hukuki yapı — tapu, imar, izinler ve mülkiyet netliği.",
    "İnşaat kalitesi — malzeme, işçilik ve bakım yükü.",
    "Konum temelleri — bölgenin nereye evrildiği, yalnızca geçmişi değil.",
    "Geliştirici güvenilirliği — teslim geçmişi ve satış sonrası davranış.",
    "Uzun vadeli değer sürdürülebilirliği — “2035’te bu nasıl görünür?” sorusunun yanıtı.",
  ],
};

const ABOUT_OVERVIEW_BY_LANG: Record<SiteLanguage, AboutOverviewCopy> = {
  en: ABOUT_OVERVIEW_EN,
  id: ABOUT_OVERVIEW_ID,
  fr: ABOUT_OVERVIEW_FR,
  zh: ABOUT_OVERVIEW_ZH,
  tr: ABOUT_OVERVIEW_TR,
};

type AboutInvestmentLivingCopy = {
  barPhrases: readonly [string, string, string];
  eyebrow: string;
  headline: string;
  sideALabel: string;
  sideATitleBefore: string;
  sideATitleEm: string;
  sideABody: string;
  sideBLabel: string;
  sideBTitleBefore: string;
  sideBTitleEm: string;
  sideBBody: string;
  footerLeft: string;
  footerRight: string;
};

const ABOUT_INVESTMENT_LIVING_EN: AboutInvestmentLivingCopy = {
  barPhrases: ["Fewer options.", "Higher standards.", "Clear guidance."],
  eyebrow: "Investment & living — not one or the other",
  headline: "Some clients come for yield. Others for a home. Often, both.",
  sideALabel: "Side A • Strategy",
  sideATitleBefore: "A property that ",
  sideATitleEm: "performs.",
  sideABody:
    "Underwritten yield. Defensible occupancy. A guest funnel that holds through the soft months. The kind of asset that earns its place on a balance sheet without explanation.",
  sideBLabel: "Side B • Lifestyle",
  sideBTitleBefore: "A residence that ",
  sideBTitleEm: "feels right.",
  sideBBody:
    "The way the light hits the courtyard at 4pm. The kind of place you stop describing and start inhabiting. The home that reflects how you actually want to live in Bali.",
  footerLeft: "A residence that feels right.",
  footerRight: "An asset that performs.",
};

const ABOUT_INVESTMENT_LIVING_ID: AboutInvestmentLivingCopy = {
  barPhrases: ["Lebih sedikit opsi.", "Standar lebih tinggi.", "Panduan lebih jelas."],
  eyebrow: "Investasi & gaya hidup — bukan memilih salah satu",
  headline: "Ada klien yang datang untuk yield. Ada yang mencari rumah. Sering kali, keduanya.",
  sideALabel: "Sisi A • Strategi",
  sideATitleBefore: "Properti yang ",
  sideATitleEm: "berperforma.",
  sideABody:
    "Yield yang terstruktur dan terukur. Okupansi yang bisa dipertanggungjawabkan. Alur tamu yang tetap kokoh di musim sepi. Aset yang layak ada di neraca tanpa banyak penjelasan.",
  sideBLabel: "Sisi B • Gaya hidup",
  sideBTitleBefore: "Hunian yang ",
  sideBTitleEm: "terasa pas.",
  sideBBody:
    "Cahaya di halaman sore hari. Tempat yang tak lagi Anda jelaskan—Anda tinggal di sana. Rumah yang mencerminkan cara Anda sesungguhnya ingin hidup di Bali.",
  footerLeft: "Hunian yang terasa pas.",
  footerRight: "Aset yang berperforma.",
};

const ABOUT_INVESTMENT_LIVING_FR: AboutInvestmentLivingCopy = {
  barPhrases: ["Moins d’options.", "Standards plus élevés.", "Conseils clairs."],
  eyebrow: "Investissement & vie — pas l’un sans l’autre",
  headline: "Certains clients visent le rendement. D’autres un foyer. Souvent les deux.",
  sideALabel: "Face A • Stratégie",
  sideATitleBefore: "Un bien qui ",
  sideATitleEm: "performe.",
  sideABody:
    "Rendement structuré. Occupation défendable. Tunnel client qui tient les mois creux. Un actif qui mérite sa place au bilan sans longues explications.",
  sideBLabel: "Face B • Art de vivre",
  sideBTitleBefore: "Une résidence qui ",
  sideBTitleEm: "vous convient.",
  sideBBody:
    "La lumière sur la cour à 16h. Un lieu que vous cessez de décrire pour commencer à y vivre. La maison qui reflète comment vous voulez réellement habiter Bali.",
  footerLeft: "Une résidence qui vous convient.",
  footerRight: "Un actif qui performe.",
};

const ABOUT_INVESTMENT_LIVING_ZH: AboutInvestmentLivingCopy = {
  barPhrases: ["更少选择。", "更高标准。", "更清晰建议。"],
  eyebrow: "投资与生活——不是二选一",
  headline: "有的客户为收益而来，有的为家而来。很多时候，两者兼得。",
  sideALabel: "A 面 · 策略",
  sideATitleBefore: "能够",
  sideATitleEm: "创造回报的资产。",
  sideABody:
    "经测算的收益、可辩护的入住率、在淡季仍能扛住的客源漏斗。那种无需多言就能在资产负债表上站稳脚跟的资产。",
  sideBLabel: "B 面 · 生活",
  sideBTitleBefore: "让人",
  sideBTitleEm: "真正安心的居所。",
  sideBBody:
    "下午四点庭院里的光线。你不再费力描述、而是自然安住其中的地方。如实反映你想如何在巴厘岛生活的家。",
  footerLeft: "让人真正安心的居所。",
  footerRight: "能够创造回报的资产。",
};

const ABOUT_INVESTMENT_LIVING_TR: AboutInvestmentLivingCopy = {
  barPhrases: ["Daha az seçenek.", "Daha yüksek standart.", "Daha net yönlendirme."],
  eyebrow: "Yatırım ve yaşam — biri diğerinin yerine değil",
  headline: "Bazı müşteriler getiri, bazıları yuva için gelir. Çoğu zaman ikisi birden.",
  sideALabel: "A yüzü • Strateji",
  sideATitleBefore: "Performans ",
  sideATitleEm: "gösteren bir gayrimenkul.",
  sideABody:
    "Ölçülebilir getiri. Savunulabilir doluluk. Düşük sezonda da ayakta kalan misafir hunisi. Bilançoda uzun açıklama gerektirmeyen bir varlık.",
  sideBLabel: "B yüzü • Yaşam",
  sideBTitleBefore: "İçinize ",
  sideBTitleEm: "sinen bir konut.",
  sideBBody:
    "Öğleden sonra avluya düşen ışık. Tarif etmeyi bırakıp yaşamaya başladığınız yer. Bali’de nasıl yaşamak istediğinizi yansıtan ev.",
  footerLeft: "İçinize sinen bir konut.",
  footerRight: "Performans gösteren bir gayrimenkul.",
};

const ABOUT_INVESTMENT_LIVING_BY_LANG: Record<SiteLanguage, AboutInvestmentLivingCopy> = {
  en: ABOUT_INVESTMENT_LIVING_EN,
  id: ABOUT_INVESTMENT_LIVING_ID,
  fr: ABOUT_INVESTMENT_LIVING_FR,
  zh: ABOUT_INVESTMENT_LIVING_ZH,
  tr: ABOUT_INVESTMENT_LIVING_TR,
};

type AboutMissionVisionCopy = {
  eyebrow: string;
  title: string;
  missionLabel: string;
  missionSub: string;
  missionLead: string;
  missionBold: string;
  missionTail: string;
  visionLabel: string;
  visionSub: string;
  visionLead: string;
  visionBold: string;
  visionTail: string;
};

type AboutPrincipleCopy = {
  eyebrow: string;
  titleBefore: string;
  titleEm: string;
  titleAfter: string;
  list: readonly [string, string, string];
  footer: string;
};

type AboutMvpCopy = { missionVision: AboutMissionVisionCopy; principle: AboutPrincipleCopy };

const ABOUT_MVP_EN: AboutMvpCopy = {
  missionVision: {
    eyebrow: "Mission & vision",
    title: "Where we are going.",
    missionLabel: "Mission · 8°",
    missionSub: "The work.",
    missionLead: "To structure intelligent property opportunities in Bali that deliver ",
    missionBold: "measurable financial performance",
    missionTail: " and exceptional living standards.",
    visionLabel: "Vision · 8°",
    visionSub: "The horizon.",
    visionLead: "To become Bali's leading boutique real-estate advisory — known for ",
    visionBold: "integrity",
    visionTail: ", strategic execution, and trusted long-term partnerships.",
  },
  principle: {
    eyebrow: "The 8 Degree Principle",
    titleBefore: "Small shifts create ",
    titleEm: "significant",
    titleAfter: " long-term impact.",
    list: ["The right entry point.", "The right structure.", "The right property."],
    footer:
      "A few degrees today can compound into substantial advantage tomorrow. That is the level we operate on.",
  },
};

const ABOUT_MVP_ID: AboutMvpCopy = {
  missionVision: {
    eyebrow: "Misi & visi",
    title: "Arah kami ke depan.",
    missionLabel: "Misi · 8°",
    missionSub: "Pekerjaan kami.",
    missionLead: "Menyusun peluang properti Bali yang cerdas yang menghadirkan ",
    missionBold: "kinerja finansial terukur",
    missionTail: " dan standar hidup luar biasa.",
    visionLabel: "Visi · 8°",
    visionSub: "Cakrawala.",
    visionLead: "Menjadi advisory properti butik terdepan di Bali — dikenal karena ",
    visionBold: "integritas",
    visionTail: ", eksekusi strategis, dan kemitraan jangka panjang yang tepercaya.",
  },
  principle: {
    eyebrow: "Prinsip 8 Degree",
    titleBefore: "Pergeseran kecil menciptakan dampak jangka panjang yang ",
    titleEm: "signifikan",
    titleAfter: ".",
    list: ["Titik masuk yang tepat.", "Struktur yang tepat.", "Properti yang tepat."],
    footer:
      "Beberapa derajat hari ini bisa berlipat menjadi keunggulan nyata besok. Di situlah level kami bekerja.",
  },
};

const ABOUT_MVP_FR: AboutMvpCopy = {
  missionVision: {
    eyebrow: "Mission & vision",
    title: "Notre cap.",
    missionLabel: "Mission · 8°",
    missionSub: "Le travail.",
    missionLead: "Structurer des opportunités immobilières intelligentes à Bali qui offrent ",
    missionBold: "une performance financière mesurable",
    missionTail: " et un niveau de vie exceptionnel.",
    visionLabel: "Vision · 8°",
    visionSub: "L’horizon.",
    visionLead: "Devenir le conseil immobilier boutique de référence à Bali — reconnu pour son ",
    visionBold: "intégrité",
    visionTail:
      ", son exécution stratégique et des partenariats de confiance sur le long terme.",
  },
  principle: {
    eyebrow: "Le principe 8 Degree",
    titleBefore: "De petits ajustements créent un impact ",
    titleEm: "majeur",
    titleAfter: " sur le long terme.",
    list: ["Le bon point d’entrée.", "La bonne structure.", "Le bon bien."],
    footer:
      "Quelques degrés aujourd’hui peuvent se composer en avantage substantiel demain. C’est à ce niveau que nous opérons.",
  },
};

const ABOUT_MVP_ZH: AboutMvpCopy = {
  missionVision: {
    eyebrow: "使命与愿景",
    title: "我们的方向。",
    missionLabel: "使命 · 8°",
    missionSub: "我们的工作。",
    missionLead: "在巴厘岛构建兼具",
    missionBold: "可衡量财务表现",
    missionTail: "与卓越生活标准的智能房地产机会。",
    visionLabel: "愿景 · 8°",
    visionSub: "远方的图景。",
    visionLead: "成为巴厘岛领先的精品房地产顾问——以",
    visionBold: "诚信",
    visionTail: "、战略执行力与可信赖的长期合作而著称。",
  },
  principle: {
    eyebrow: "8 Degree 原则",
    titleBefore: "细微决策会在长期形成",
    titleEm: "显著",
    titleAfter: "影响。",
    list: ["正确的切入点。", "正确的结构。", "正确的资产。"],
    footer: "今天的几度偏差，明天可能叠加成真正的优势。我们就在这一层工作。",
  },
};

const ABOUT_MVP_TR: AboutMvpCopy = {
  missionVision: {
    eyebrow: "Misyon & vizyon",
    title: "Nereye gidiyoruz.",
    missionLabel: "Misyon · 8°",
    missionSub: "İşimiz.",
    missionLead: "Bali’de ölçülebilir finansal performans ve ",
    missionBold: "olağanüstü yaşam standardı",
    missionTail: " sunan akıllı gayrimenkul fırsatlarını yapılandırmak.",
    visionLabel: "Vizyon · 8°",
    visionSub: "Ufuk.",
    visionLead: "Bali’nin önde gelen butik gayrimenkul danışmanı olmak — ",
    visionBold: "dürüstlüğü",
    visionTail: ", stratejik icrayı ve güvenilir uzun vadeli ortaklıklarıyla tanınmak.",
  },
  principle: {
    eyebrow: "8 Degree ilkesi",
    titleBefore: "Küçük sapmalar uzun vadede ",
    titleEm: "belirgin",
    titleAfter: " etki yaratır.",
    list: ["Doğru giriş noktası.", "Doğru yapı.", "Doğru gayrimenkul."],
    footer:
      "Bugün birkaç derece, yarın önemli bir avantaja dönüşebilir. Biz bu seviyede çalışıyoruz.",
  },
};

const ABOUT_MVP_BY_LANG: Record<SiteLanguage, AboutMvpCopy> = {
  en: ABOUT_MVP_EN,
  id: ABOUT_MVP_ID,
  fr: ABOUT_MVP_FR,
  zh: ABOUT_MVP_ZH,
  tr: ABOUT_MVP_TR,
};

function OverviewEyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="mb-8 flex items-center gap-3 md:mb-10">
      <span className={cn("h-px w-10 shrink-0", dark ? "bg-white/45" : "bg-[#0d4542]/35")} aria-hidden />
      <span
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.22em]",
          dark ? "text-white/75" : "text-[#0d4542]/80",
        )}
      >
        {children}
      </span>
    </div>
  );
}

export default function About() {
  const language = useSiteLanguage();
  const ov = ABOUT_OVERVIEW_BY_LANG[language];
  const il = ABOUT_INVESTMENT_LIVING_BY_LANG[language];
  const mvp = ABOUT_MVP_BY_LANG[language];
  const t = {
    en: {
      heroKicker: "Company overview · Brand story · Mission & values",
      title: "About 8 Degree",
      subtitle: "Boutique real estate investment advisory in Bali: clarity, structure, and long-term positioning.",
      sec1: "Company overview",
      sec1Title: "8 Degree Real Estate",
      sec1Body: [
        "8 Degree Real Estate is a boutique real estate investment advisory based in Bali.",
        "For over four years, we have operated at the intersection of strategic investment and quality living.",
        "With 80+ curated properties and 10+ high-value transactions, we prioritize precision over volume.",
      ],
      sec2: "What we do",
      sec2Title: "Advisory scope",
      sec2Lead: "We advise clients on:",
      sec2Bullets: [
        "Investment properties targeting 10–12% portfolio ROI performance",
        "Residential homes for relocation and long-term living",
        "High-value transactions above IDR 16B",
        "Select off-market opportunities",
        "Strategic portfolio positioning within Bali's evolving property landscape",
      ],
      sec2Tail: "Fewer options. Higher standards. Clear guidance.",
      sec3: "Brand story",
      sec3Title: "Investment & living, not one or the other",
      sec3Body: [
        "We believe Bali property should serve your strategy and your lifestyle.",
        "Some clients come for yield; others come for a home. The right asset can deliver both.",
      ],
      sec4: "Our approach",
      sec4Title: "Built differently",
      sec4Body: [
        "The Bali market can be fragmented and opaque.",
        "We built 8 Degree around transparency, structured advisory, and long-term partnership.",
      ],
      mission: "Mission",
      missionBody: "To structure intelligent property opportunities in Bali that deliver measurable financial performance and exceptional living standards.",
      vision: "Vision",
      visionBody: "To become Bali's leading boutique real estate advisory, known for integrity, strategic execution, and trusted long-term partnerships.",
      values: "Values",
      valuesTitle: "The 8 Degree principle",
      valuesBody: [
        "Small shifts in decision-making create significant long-term impact.",
        "The right entry point. The right structure. The right property.",
      ],
      people: "People",
      team: "The People Behind 8 Degree",
      next: "Next step",
      nextTitle: "Position your portfolio with clarity",
      nextBody: "Whether you are focused on yield, relocation, or both, we structure opportunities that meet higher standards.",
      contact: "Get in touch",
      guide: "Download investment guide",
    },
    id: {
      heroKicker: "Profil perusahaan · Cerita brand · Misi & nilai",
      title: "Tentang 8 Degree",
      subtitle: "Advisory investasi properti butik di Bali: jelas, terstruktur, dan berorientasi jangka panjang.",
      sec1: "Profil perusahaan",
      sec1Title: "8 Degree Real Estate",
      sec1Body: [
        "8 Degree adalah advisory investasi properti butik yang berbasis di Bali.",
        "Selama lebih dari empat tahun, kami bekerja di persimpangan investasi strategis dan kualitas hidup.",
        "Dengan 80+ properti terkurasi dan 10+ transaksi bernilai tinggi, kami mengutamakan presisi.",
      ],
      sec2: "Apa yang kami lakukan",
      sec2Title: "Ruang lingkup advisory",
      sec2Lead: "Kami mendampingi klien dalam:",
      sec2Bullets: [
        "Properti investasi dengan target ROI portofolio 10–12%",
        "Hunian untuk relokasi dan tinggal jangka panjang",
        "Transaksi bernilai tinggi di atas IDR 16B",
        "Peluang off-market terpilih",
        "Posisi portofolio strategis di pasar Bali",
      ],
      sec2Tail: "Pilihan lebih sedikit. Standar lebih tinggi. Arahan lebih jelas.",
      sec3: "Cerita brand",
      sec3Title: "Investasi dan gaya hidup, bukan salah satu",
      sec3Body: [
        "Kami percaya properti di Bali harus mendukung strategi dan gaya hidup Anda.",
        "Sebagian klien fokus pada yield, sebagian mencari rumah. Aset yang tepat bisa memberi keduanya.",
      ],
      sec4: "Pendekatan kami",
      sec4Title: "Dibangun berbeda",
      sec4Body: [
        "Pasar Bali bisa terfragmentasi dan tidak selalu transparan.",
        "8 Degree dibangun dengan transparansi, proses terstruktur, dan hubungan jangka panjang.",
      ],
      mission: "Misi",
      missionBody: "Menyusun peluang properti Bali yang cerdas, terukur, dan bernilai tinggi secara finansial maupun kualitas hidup.",
      vision: "Visi",
      visionBody: "Menjadi advisory properti butik terdepan di Bali dengan integritas, eksekusi strategis, dan kemitraan jangka panjang.",
      values: "Nilai",
      valuesTitle: "Prinsip 8 Degree",
      valuesBody: ["Perubahan kecil dalam keputusan dapat memberi dampak jangka panjang yang besar.", "Titik masuk tepat. Struktur tepat. Properti tepat."],
      people: "Orang-orang",
      team: "Orang-orang di balik 8 Degree",
      next: "Langkah berikutnya",
      nextTitle: "Posisikan portofolio Anda dengan jelas",
      nextBody: "Baik fokus pada yield, relokasi, atau keduanya, kami menyusun peluang dengan standar lebih tinggi.",
      contact: "Hubungi kami",
      guide: "Unduh panduan investasi",
    },
    fr: {
      heroKicker: "Apercu entreprise · Histoire de marque · Mission et valeurs",
      title: "A propos de 8 Degree",
      subtitle: "Conseil immobilier boutique a Bali: clarte, structure et vision long terme.",
      sec1: "Apercu entreprise",
      sec1Title: "8 Degree Real Estate",
      sec1Body: [
        "8 Degree est un cabinet boutique de conseil immobilier base a Bali.",
        "Depuis plus de quatre ans, nous allions investissement strategique et qualite de vie.",
        "Avec 80+ biens selectionnes et 10+ transactions a forte valeur, nous privilegions la precision.",
      ],
      sec2: "Ce que nous faisons",
      sec2Title: "Portee du conseil",
      sec2Lead: "Nous accompagnons nos clients sur :",
      sec2Bullets: [
        "Biens d'investissement avec objectif ROI 10–12%",
        "Residences pour relocalisation et vie long terme",
        "Transactions de grande valeur au-dessus de 16B IDR",
        "Opportunites off-market selectionnees",
        "Positionnement strategique du portefeuille a Bali",
      ],
      sec2Tail: "Moins d'options. Standards plus eleves. Orientation claire.",
      sec3: "Histoire de marque",
      sec3Title: "Investissement et art de vivre, ensemble",
      sec3Body: [
        "Nous croyons qu'un bien a Bali doit servir votre strategie et votre style de vie.",
        "Certains clients recherchent le rendement, d'autres un foyer; le bon actif peut offrir les deux.",
      ],
      sec4: "Notre approche",
      sec4Title: "Concu differemment",
      sec4Body: [
        "Le marche balinais peut etre fragmente et opaque.",
        "8 Degree repose sur la transparence, un processus structure et des relations long terme.",
      ],
      mission: "Mission",
      missionBody: "Structurer des opportunites immobilieres intelligentes a Bali offrant performance financiere mesurable et qualite de vie elevee.",
      vision: "Vision",
      visionBody: "Devenir le cabinet boutique de reference a Bali, reconnu pour son integrite et son execution strategique.",
      values: "Valeurs",
      valuesTitle: "Le principe 8 Degree",
      valuesBody: ["De petits ajustements dans la decision peuvent creer un impact majeur a long terme.", "Le bon point d'entree. La bonne structure. Le bon bien."],
      people: "Personnes",
      team: "Les personnes derrière 8 Degree",
      next: "Prochaine etape",
      nextTitle: "Positionnez votre portefeuille avec clarte",
      nextBody: "Rendement, relocalisation ou les deux: nous structurons des opportunites de haut niveau.",
      contact: "Nous contacter",
      guide: "Telecharger le guide d'investissement",
    },
    zh: {
      heroKicker: "公司概览 · 品牌故事 · 使命与价值",
      title: "关于 8 Degree",
      subtitle: "巴厘岛精品房地产投资顾问：清晰、结构化、长期导向。",
      sec1: "公司概览",
      sec1Title: "8 Degree Real Estate",
      sec1Body: [
        "8 Degree 是一家位于巴厘岛的精品房地产投资顾问公司。",
        "四年来，我们始终专注于战略投资与高品质生活的结合。",
        "凭借 80+ 精选房源与 10+ 高价值交易，我们坚持精准而非数量。",
      ],
      sec2: "我们的服务",
      sec2Title: "顾问范围",
      sec2Lead: "我们主要为客户提供：",
      sec2Bullets: [
        "目标 ROI 10–12% 的投资型房产",
        "用于移居和长期居住的住宅",
        "超过 IDR 16B 的高价值交易",
        "精选 off-market 机会",
        "在巴厘岛市场中的战略组合配置",
      ],
      sec2Tail: "更少选择，更高标准，更清晰建议。",
      sec3: "品牌故事",
      sec3Title: "投资与生活并重",
      sec3Body: [
        "我们相信，巴厘岛房产应同时服务于您的策略与生活方式。",
        "有的客户关注收益，有的客户寻找家园；合适资产可以兼得。",
      ],
      sec4: "我们的方法",
      sec4Title: "与众不同",
      sec4Body: [
        "巴厘岛市场可能存在信息分散与不透明。",
        "8 Degree 以透明沟通、结构化流程和长期合作为核心。",
      ],
      mission: "使命",
      missionBody: "在巴厘岛构建兼具可衡量财务表现与卓越生活品质的智能房地产机会。",
      vision: "愿景",
      visionBody: "成为巴厘岛领先的精品房地产顾问品牌，以诚信与战略执行力著称。",
      values: "价值观",
      valuesTitle: "8 Degree 原则",
      valuesBody: ["决策中的微小偏差，会在长期形成巨大差异。", "正确时点、正确结构、正确资产。"],
      people: "团队成员",
      team: "8 Degree 背后的人们",
      next: "下一步",
      nextTitle: "清晰定位您的资产组合",
      nextBody: "无论您关注收益、移居或两者，我们都将以更高标准构建机会。",
      contact: "联系我们",
      guide: "下载投资指南",
    },
    tr: {
      heroKicker: "Sirket ozeti · Marka hikayesi · Misyon ve degerler",
      title: "8 Degree Hakkinda",
      subtitle: "Bali'de butik gayrimenkul yatirim danismanligi: netlik, yapi ve uzun vadeli konumlama.",
      sec1: "Sirket ozeti",
      sec1Title: "8 Degree Real Estate",
      sec1Body: [
        "8 Degree, Bali merkezli butik bir gayrimenkul yatirim danismanligidir.",
        "Dort yildan uzun suredir stratejik yatirim ve yasam kalitesini birlestiriyoruz.",
        "80+ secili ilan ve 10+ yuksek degerli islemle nicelikten cok kaliteye odaklaniyoruz.",
      ],
      sec2: "Ne yapiyoruz",
      sec2Title: "Danismanlik kapsami",
      sec2Lead: "Musterilerimize su konularda danismanlik veriyoruz:",
      sec2Bullets: [
        "10–12% ROI hedefli yatirim gayrimenkulleri",
        "Tasinma ve uzun donem yasam icin konutlar",
        "IDR 16B ustu yuksek degerli islemler",
        "Secili off-market firsatlar",
        "Bali pazarinda stratejik portfoy konumlama",
      ],
      sec2Tail: "Daha az secenek. Daha yuksek standart. Daha net yonlendirme.",
      sec3: "Marka hikayesi",
      sec3Title: "Yatirim ve yasam birlikte",
      sec3Body: [
        "Bali'de bir gayrimenkulun hem stratejinize hem yasam tarzina hizmet etmesi gerektigine inaniyoruz.",
        "Bazi musteriler getiri, bazilari yasam icin gelir; dogru varlik ikisini de sunabilir.",
      ],
      sec4: "Yaklasimimiz",
      sec4Title: "Farkli kuruldu",
      sec4Body: [
        "Bali pazari parcali ve zaman zaman opak olabilir.",
        "8 Degree; seffaf iletisim, yapilandirilmis surec ve uzun vadeli iliski icin kuruldu.",
      ],
      mission: "Misyon",
      missionBody: "Bali'de olculebilir finansal performans ve yuksek yasam standardi sunan akilli firsatlar olusturmak.",
      vision: "Vizyon",
      visionBody: "Dogruluk, stratejik uygulama ve guvenilir ortaklikla Bali'nin lider butik danismanligi olmak.",
      values: "Degerler",
      valuesTitle: "8 Degree prensibi",
      valuesBody: ["Karar surecindeki kucuk kaymalar uzun vadede buyuk etki yaratir.", "Dogru giris noktasi. Dogru yapi. Dogru varlik."],
      people: "Insanlar",
      team: "8 Degree'in arkasındaki insanlar",
      next: "Siradaki adim",
      nextTitle: "Portfoyunuzu netlikle konumlandirin",
      nextBody: "Getiri, tasinma veya ikisi birden: daha yuksek standartli firsatlar sunuyoruz.",
      contact: "Iletisime gecin",
      guide: "Yatirim rehberini indirin",
    },
  }[language];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="About 8 Degree · Bali advisory team"
        description={truncateForMeta(
          "Meet the 8 Degree team: boutique Bali property advisory focused on clarity, curation, and long-term value.",
        )}
        path="/about"
        jsonLd={jsonLdGraph([organizationJsonLdNode()])}
      />
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img
          src={SITE_MEDIA.heroPoster}
          alt="Bali"
          className="hero-image-breathe h-full w-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.src = SITE_MEDIA.heroStill;
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto max-w-6xl px-6 pb-16 text-white">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-white"
            >
              {t.heroKicker}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-4xl font-serif text-4xl font-bold leading-tight tracking-[0.04em] text-white md:text-6xl"
            >
              {t.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-2xl text-lg font-light text-white"
            >
              {t.subtitle}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Company overview — under hero (position strip + cream blocks) */}
      <section className="bg-[#0d4542] text-white" aria-label={ov.positionLabel}>
        <div className="container mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-14 lg:gap-20"
          >
            <div className="flex shrink-0 items-center gap-3 md:min-w-[9rem]">
              <span className="h-px w-10 bg-white/45" aria-hidden />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/75">{ov.positionLabel}</span>
            </div>
            <p className="max-w-3xl font-sans text-lg font-light leading-relaxed text-white md:text-xl md:leading-snug">
              {ov.positionBefore}
              <strong className="font-semibold text-[#dbe8a3]">{ov.positionEmphasis}</strong>
              {ov.positionAfter}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#fdfbf7] text-[#0d4542]" aria-label={ov.overviewEyebrow}>
        <div className="container mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <OverviewEyebrow>{ov.overviewEyebrow}</OverviewEyebrow>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
              <h2 className="font-serif text-[2rem] font-bold leading-[1.1] tracking-[0.02em] md:text-[2.35rem] lg:text-[2.65rem]">
                {ov.precisionTitleBefore}
                <em className="font-bold italic">{ov.precisionTitleEm}</em>
              </h2>
              <div className="space-y-5 font-sans text-base font-light leading-[1.7] text-[#1c1917]/90 md:text-[1.0625rem]">
                {ov.precisionBody.map((paragraph, idx) => (
                  <p key={`precision-${idx}`}>{paragraph}</p>
                ))}
                <div className="border-t border-[#0d4542]/15 pt-8 text-center">
                  <p className="font-serif text-lg font-semibold leading-snug tracking-[0.02em] md:text-xl">{ov.precisionQuote}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mt-20 md:mt-28"
          >
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
              <h2 className="font-serif text-[2rem] font-bold leading-[1.1] tracking-[0.02em] md:text-[2.35rem] lg:text-[2.65rem]">
                {ov.practicesTitleBefore}
                <em className="font-bold italic">{ov.practicesTitleEm}</em>
              </h2>
              <p className="font-sans text-base font-light leading-[1.7] text-[#1c1917]/90 md:text-[1.0625rem]">{ov.practicesBody}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mt-20 border-t border-[#0d4542]/10 pt-16 md:mt-28 md:pt-20"
          >
            <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
              <div>
                <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d4542]/85">{ov.adviseLead}</p>
                <ul className="divide-y divide-[#0d4542]/12 border-y border-[#0d4542]/12">
                  {ov.adviseItems.map((item, i) => (
                    <li key={item} className="flex gap-4 py-5">
                      <span className="w-9 shrink-0 font-serif text-xl font-light tabular-nums text-[#0d4542]/35 md:text-2xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d4542]/85">{ov.vettingLead}</p>
                <ul className="divide-y divide-[#0d4542]/12 border-y border-[#0d4542]/12">
                  {ov.vettingItems.map((item, i) => (
                    <li key={item} className="flex gap-4 py-5">
                      <span className="w-9 shrink-0 font-serif text-xl font-light tabular-nums text-[#0d4542]/35 md:text-2xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investment & living — yield vs home, two columns */}
      <div className="bg-[#0d4542]">
        <div className="container mx-auto max-w-6xl px-6 py-6 md:px-10 md:py-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 gap-4 text-center font-sans text-sm font-light text-[#fdfbf7]/95 md:grid-cols-3 md:gap-x-12 md:gap-y-4 md:text-base"
          >
            {il.barPhrases.map((phrase) => (
              <p key={phrase} className="px-2">
                {phrase}
              </p>
            ))}
          </motion.div>
        </div>
      </div>

      <section className="bg-[#fdfbf7] text-[#0d4542]" aria-label={il.eyebrow}>
        <div className="container mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10 flex items-start gap-3 md:mb-12">
              <span className="mt-2.5 h-px w-10 shrink-0 bg-[#0d4542]/35" aria-hidden />
              <p className="text-sm font-normal leading-snug text-[#0d4542]/90 md:text-[0.95rem]">{il.eyebrow}</p>
            </div>
            <h2 className="max-w-4xl font-serif text-[1.85rem] font-bold leading-[1.12] tracking-[0.02em] md:text-[2.35rem] lg:text-[2.75rem]">
              {il.headline}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-14 md:mt-20"
          >
            <div className="flex flex-col gap-10 md:flex-row md:items-stretch md:gap-0">
              <div className="flex-1 md:pr-10 lg:pr-14">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d4542]/75">{il.sideALabel}</p>
                <h3 className="mt-4 font-serif text-xl font-bold leading-snug md:text-2xl">
                  {il.sideATitleBefore}
                  <em className="font-bold italic">{il.sideATitleEm}</em>
                </h3>
                <p className="mt-5 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.7]">
                  {il.sideABody}
                </p>
              </div>

              <div className="flex items-center gap-4 md:hidden">
                <span className="h-px flex-1 bg-[#0d4542]/20" aria-hidden />
                <span className="font-serif text-lg font-light text-[#0d4542]" aria-hidden>
                  &amp;
                </span>
                <span className="h-px flex-1 bg-[#0d4542]/20" aria-hidden />
              </div>

              <div className="relative hidden w-12 shrink-0 md:flex md:justify-center">
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#0d4542]/25" aria-hidden />
                <span className="relative z-[1] my-auto rounded-full bg-[#fdfbf7] px-2.5 py-1 font-serif text-lg font-light leading-none text-[#0d4542] ring-1 ring-[#0d4542]/12">
                  &amp;
                </span>
              </div>

              <div className="flex-1 md:pl-10 lg:pl-14">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d4542]/75">{il.sideBLabel}</p>
                <h3 className="mt-4 font-serif text-xl font-bold leading-snug md:text-2xl">
                  {il.sideBTitleBefore}
                  <em className="font-bold italic">{il.sideBTitleEm}</em>
                </h3>
                <p className="mt-5 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.7]">
                  {il.sideBBody}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="mt-14 border-t border-[#0d4542]/15 pt-10 md:mt-20 md:pt-12"
          >
            <div className="flex flex-col gap-6 text-center font-serif text-base font-normal italic text-[#5d7a6c] md:flex-row md:items-start md:justify-between md:gap-10 md:text-left md:text-lg">
              <p className="md:max-w-[45%]">{il.footerLeft}</p>
              <p className="md:max-w-[45%] md:text-right">{il.footerRight}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & vision — two columns with ampersand */}
      <section className="bg-[#fdfbf7] text-[#0d4542]" aria-label={mvp.missionVision.eyebrow}>
        <div className="container mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10 flex items-start gap-3 md:mb-12">
              <span className="mt-2.5 h-px w-10 shrink-0 bg-[#0d4542]/35" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d4542]/85">
                {mvp.missionVision.eyebrow}
              </p>
            </div>
            <h2 className="max-w-4xl font-serif text-[1.85rem] font-bold leading-[1.12] tracking-[0.02em] md:text-[2.5rem] lg:text-[2.85rem]">
              {mvp.missionVision.title}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-10 border-t border-[#0d4542]/15 pt-12 md:mt-12 md:pt-14"
          >
            <div className="flex flex-col gap-10 md:flex-row md:items-stretch md:gap-0">
              <div className="flex-1 md:pr-10 lg:pr-14">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d4542]/75">
                  {mvp.missionVision.missionLabel}
                </p>
                <p className="mt-3 font-serif text-lg font-normal italic text-[#0d4542] md:text-xl">{mvp.missionVision.missionSub}</p>
                <p className="mt-5 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.7]">
                  {mvp.missionVision.missionLead}
                  <strong className="font-semibold text-[#0d4542]">{mvp.missionVision.missionBold}</strong>
                  {mvp.missionVision.missionTail}
                </p>
              </div>

              <div className="flex items-center gap-4 md:hidden">
                <span className="h-px flex-1 bg-[#0d4542]/20" aria-hidden />
                <span className="font-serif text-lg font-light text-[#0d4542]" aria-hidden>
                  &amp;
                </span>
                <span className="h-px flex-1 bg-[#0d4542]/20" aria-hidden />
              </div>

              <div className="relative hidden w-12 shrink-0 md:flex md:justify-center">
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#0d4542]/25" aria-hidden />
                <span className="relative z-[1] my-auto rounded-full bg-[#fdfbf7] px-2.5 py-1 font-serif text-lg font-light leading-none text-[#0d4542] ring-1 ring-[#0d4542]/12">
                  &amp;
                </span>
              </div>

              <div className="flex-1 md:pl-10 lg:pl-14">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d4542]/75">
                  {mvp.missionVision.visionLabel}
                </p>
                <p className="mt-3 font-serif text-lg font-normal italic text-[#0d4542] md:text-xl">{mvp.missionVision.visionSub}</p>
                <p className="mt-5 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-base md:leading-[1.7]">
                  {mvp.missionVision.visionLead}
                  <strong className="font-semibold text-[#0d4542]">{mvp.missionVision.visionBold}</strong>
                  {mvp.missionVision.visionTail}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The 8 Degree Principle — lime panel + giant  */}
      <section className="relative overflow-hidden bg-[#dcefc4] text-[#0d4542]" aria-label={mvp.principle.eyebrow}>
        <span
          className="pointer-events-none absolute -left-[8%] top-1/2 -translate-y-1/2 select-none font-serif text-[min(72vw,30rem)] font-bold leading-[0.85] text-white/45 sm:text-[min(64vw,34rem)] md:text-[min(56vw,40rem)] lg:text-[40rem] xl:text-[46rem]"
          aria-hidden
        >
          8
        </span>
        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10 flex justify-start md:mb-12 md:justify-end">
              <div className="flex items-start gap-3">
                <span className="mt-2.5 h-px w-10 shrink-0 bg-[#0d4542]/35" aria-hidden />
                <p className="max-w-[16rem] text-right text-[11px] font-semibold uppercase leading-snug tracking-[0.22em] text-[#0d4542]/85">
                  {mvp.principle.eyebrow}
                </p>
              </div>
            </div>
            <h2 className="max-w-3xl font-serif text-[1.75rem] font-bold leading-[1.15] tracking-[0.02em] md:text-[2.25rem] lg:text-[2.65rem]">
              {mvp.principle.titleBefore}
              <em className="font-bold italic">{mvp.principle.titleEm}</em>
              {mvp.principle.titleAfter}
            </h2>
            <ul className="mt-10 space-y-3 font-sans text-base font-light leading-relaxed text-[#1c1917]/88 md:mt-12 md:text-[1.0625rem]">
              {mvp.principle.list.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="mt-10 border-t border-[#0d4542]/20 pt-8 md:mt-12 md:pt-10">
              <p className="max-w-3xl text-sm font-light leading-relaxed text-[#1c1917]/75 md:text-base">
                {mvp.principle.footer}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl space-y-20 px-6 py-20 text-justify">
        {/* Team */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-0"
        >
          <OverviewEyebrow>{t.people}</OverviewEyebrow>
          <h2 className="mb-8 font-serif text-3xl font-bold leading-[1.15] tracking-[0.03em] text-primary md:text-[2.125rem]">{t.team}</h2>
          <TeamPhotos />
        </motion.section>
      </div>

      {/* CTA */}
      <section className="bg-muted/55 py-24">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">{t.next}</p>
          <h2 className="mb-6 font-serif text-3xl font-bold leading-[1.15] tracking-[0.03em] text-primary md:text-5xl">{t.nextTitle}</h2>
          <p className="mx-auto mb-10 max-w-xl font-sans text-base font-light leading-relaxed text-muted-foreground">
            {t.nextBody}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button className="h-12 rounded-none px-8 uppercase tracking-widest">{t.contact}</Button>
            </Link>
            <Link href="/invest">
              <Button
                variant="ghost"
                className="h-12 rounded-none border border-primary/25 bg-[#def86b] px-8 uppercase tracking-widest text-primary shadow-sm hover:bg-[#d4ef5f] hover:text-primary"
              >
                {t.guide}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
