import type { SiteLanguage } from "@/lib/site-language";

export type InvestBuildField = {
  numeral: string;
  title: string;
  description: string;
};

export type InvestPageCopy = {
  seoTitle: string;
  seoDescription: string;
  heroAria: string;
  byInvitation: string;
  heroKicker: string;
  heroLine1Before: string;
  heroLine1Em: string;
  heroLine1After: string;
  heroLine2: string;
  heroSub: string;
  ctaBrief: string;
  s01Kicker: string;
  s01TitleBefore: string;
  s01TitleEm: string;
  s01TitleAfter: string;
  whatIsInc: readonly string[];
  s02Kicker: string;
  s02TitleBefore: string;
  s02TitleEm: string;
  s02TitleAfter: string;
  whereWeBuild: readonly InvestBuildField[];
  s03KickerMuted: string;
  s03Kicker: string;
  s03TitleBefore: string;
  s03TitleEm: string;
  s03TitleAfter: string;
  howWeWork: readonly string[];
  s04Kicker: string;
  s04TitleBefore: string;
  s04TitleEm: string;
  s04TitleAfter: string;
  whyInvestors: readonly string[];
  s05Kicker: string;
  s05TitleBefore: string;
  s05TitleEm: string;
  s05TitleAfter: string;
  whereCapital: readonly string[];
  minimumCheckLabel: string;
  s06Kicker: string;
  s06TitleBefore: string;
  s06TitleEm: string;
  s06TitleAfter: string;
  invitationP1: string;
  invitationP2: string;
  signatureRole: string;
};

export const INVEST_PAGE_COPY: Record<SiteLanguage, InvestPageCopy> = {
  en: {
    seoTitle: "Invest in Bali",
    seoDescription:
      "Bali property investment and venture opportunities with 8 Degree Real Estate — boutique advisory for international investors.",
    heroAria: "Invest in Bali",
    byInvitation: "By invitation",
    heroKicker: "An 8 Degree Real Estate opportunity",
    heroLine1Before: "Bali doesn't just ",
    heroLine1Em: "host",
    heroLine1After: " businesses anymore.",
    heroLine2: "It builds them.",
    heroSub:
      "8 Degree is a boutique property advisory creating, scaling, and investing in hospitality-led real estate across Bali and Southeast Asia.",
    ctaBrief: "Request the investor brief",
    s01Kicker: "01 — What is INC?",
    s01TitleBefore: "A studio that ",
    s01TitleEm: "builds.",
    s01TitleAfter: " Not advises.",
    whatIsInc: [
      "A venture studio and incubator based in Bali, building across Southeast Asia",
      "One ecosystem — brand, operations, marketing, and capital under a single roof",
      "Operating since 2024, with a live and growing portfolio",
      "Founded and run by operators, not advisors",
    ],
    s02Kicker: "02 — Where we build",
    s02TitleBefore: "Four fields. One ",
    s02TitleEm: "playbook.",
    s02TitleAfter: "",
    whereWeBuild: [
      {
        numeral: "I.",
        title: "F&B",
        description: "Restaurants, delivery brands, and casual dining concepts.",
      },
      {
        numeral: "II.",
        title: "Hospitality",
        description: "Venues, retreats, and lifestyle experiences.",
      },
      {
        numeral: "III.",
        title: "Technology",
        description: "Data and platform ventures for SEA's hospitality and retail markets.",
      },
      {
        numeral: "IV.",
        title: "Real Estate",
        description: "Property-linked ventures and asset-backed investment opportunities.",
      },
    ],
    s03KickerMuted: "03 —",
    s03Kicker: "How we work",
    s03TitleBefore: "Deep involvement. ",
    s03TitleEm: "Aligned incentives.",
    s03TitleAfter: "",
    howWeWork: [
      "Long-term partnerships, not agency engagements",
      "Deep operational involvement from concept to launch to scale",
      "Aligned incentives through revenue share, profit share, and equity",
      "Powered by HeyRCG (performance marketing) and Stilkk (creative & design)",
    ],
    s04Kicker: "04 — Why investors partner with INC",
    s04TitleBefore: "Liquidity now. ",
    s04TitleEm: "Compounding",
    s04TitleAfter: " later.",
    whyInvestors: [
      "Exposure to a diversified portfolio — not a single bet",
      "Recurring income paired with long-term equity upside",
      "A defined return pathway — no waiting for an IPO",
      "A team with 15+ years building brands across Southeast Asia",
    ],
    s05Kicker: "05 — Where your capital goes",
    s05TitleBefore: "Into ",
    s05TitleEm: "product.",
    s05TitleAfter: " Not overhead.",
    whereCapital: [
      "Foundational capital fuels the brands INC builds, operates, and represents — directly into product, not overhead",
      "Many of these brands are already live in Bali — you've likely dined at them, drunk their coffee, or trained at them",
      "A pipeline of new ventures launching across F&B, hospitality, technology, and real estate",
    ],
    minimumCheckLabel: "Minimum check:",
    s06Kicker: "06 — The invitation",
    s06TitleBefore: "Want the ",
    s06TitleEm: "full",
    s06TitleAfter: " picture?",
    invitationP1:
      "Leave your details. We'll send the full investor brief privately, including the financial model, equity structure, and a personal call to walk through it.",
    invitationP2: "The room only seats a handful of foundational investors. We'd love to know who you are.",
    signatureRole: "Head of partnerships · Bali investment",
  },
  id: {
    seoTitle: "Investasi di Bali",
    seoDescription:
      "Peluang investasi properti dan ventura Bali bersama 8 Degree Real Estate — advisory butik bagi investor internasional.",
    heroAria: "Investasi di Bali",
    byInvitation: "Hanya berdasarkan undangan",
    heroKicker: "Peluang 8 Degree Real Estate",
    heroLine1Before: "Bali tidak lagi sekadar ",
    heroLine1Em: "menampung",
    heroLine1After: " bisnis.",
    heroLine2: "Bali membangunnya.",
    heroSub:
      "8 Degree adalah advisory properti butik yang menciptakan, memperbesar skala, dan berinvestasi pada real estate berbasis hospitality di Bali dan Asia Tenggara.",
    ctaBrief: "Minta ringkasan investor",
    s01Kicker: "01 — Apa itu INC?",
    s01TitleBefore: "Studio yang ",
    s01TitleEm: "membangun.",
    s01TitleAfter: " Bukan sekadar menasihati.",
    whatIsInc: [
      "Venture studio dan inkubator berbasis di Bali, berkembang di Asia Tenggara",
      "Satu ekosistem — merek, operasi, pemasaran, dan modal dalam satu atap",
      "Beroperasi sejak 2024 dengan portofolio aktif yang terus bertumbuh",
      "Didirikan dan dikelola oleh operator, bukan konsultan saja",
    ],
    s02Kicker: "02 — Di mana kami membangun",
    s02TitleBefore: "Empat bidang. Satu ",
    s02TitleEm: "playbook.",
    s02TitleAfter: "",
    whereWeBuild: [
      {
        numeral: "I.",
        title: "F&B",
        description: "Restoran, merek delivery, dan konsep keterasan.",
      },
      {
        numeral: "II.",
        title: "Hospitalitas",
        description: "Venue, retreat, dan pengalaman gaya hidup.",
      },
      {
        numeral: "III.",
        title: "Teknologi",
        description: "Venture data dan platform untuk pasar hospitality & ritel SEA.",
      },
      {
        numeral: "IV.",
        title: "Real estat",
        description: "Venture terkait properti dan peluang investasi berbasis aset.",
      },
    ],
    s03KickerMuted: "03 —",
    s03Kicker: "Cara kami bekerja",
    s03TitleBefore: "Keterlibatan mendalam. ",
    s03TitleEm: "Insentif yang selaras.",
    s03TitleAfter: "",
    howWeWork: [
      "Kemitraan jangka panjang, bukan kontrak agensi biasa",
      "Keterlibatan operasional dalam dari konsep, peluncuran, hingga skala",
      "Insentif selaras lewat bagi hasil, bagi laba, dan ekuitas",
      "Didukung HeyRCG (pemasaran kinerja) dan Stilkk (kreatif & desain)",
    ],
    s04Kicker: "04 — Mengapa investor bermitra dengan INC",
    s04TitleBefore: "Likuiditas kini. ",
    s04TitleEm: "Berkembang majemuk",
    s04TitleAfter: " kemudian.",
    whyInvestors: [
      "Eksposur ke portofolio terdiversifikasi — bukan satu taruhan",
      "Pendapatan berulang plus potensi ekuitas jangka panjang",
      "Jalur imbal hasil terdefinisi — tanpa menunggu IPO",
      "Tim dengan 15+ tahun membangun merek di Asia Tenggara",
    ],
    s05Kicker: "05 — Ke mana modal Anda mengalir",
    s05TitleBefore: "Ke ",
    s05TitleEm: "produk.",
    s05TitleAfter: " Bukan overhead.",
    whereCapital: [
      "Modal pendirian menggerakkan merek yang INC bangun, operasikan, dan wakili — langsung ke produk, bukan biaya kantor",
      "Banyak merek ini sudah hidup di Bali — Anda mungkin sudah makan, minum kopi, atau berlatih di sana",
      "Pipeline venture baru di F&B, hospitality, teknologi, dan real estat",
    ],
    minimumCheckLabel: "Minimum investasi:",
    s06Kicker: "06 — Undangan",
    s06TitleBefore: "Ingin ",
    s06TitleEm: "gambaran",
    s06TitleAfter: " lengkap?",
    invitationP1:
      "Tinggalkan detail Anda. Kami mengirim ringkasan investor lengkap secara privat, termasuk model finansial, struktur ekuitas, dan panggilan untuk membahasnya.",
    invitationP2: "Kuota hanya untuk segelintir investor pendiri. Kami ingin mengenal Anda.",
    signatureRole: "Kepala kemitraan · Investasi Bali",
  },
  fr: {
    seoTitle: "Investir à Bali",
    seoDescription:
      "Immobilier et ventures à Bali avec 8 Degree Real Estate — conseil boutique pour investisseurs internationaux.",
    heroAria: "Investir à Bali",
    byInvitation: "Sur invitation",
    heroKicker: "Une opportunité 8 Degree Real Estate",
    heroLine1Before: "Bali ne se contente plus d’",
    heroLine1Em: "accueillir",
    heroLine1After: " des entreprises.",
    heroLine2: "Elle les construit.",
    heroSub:
      "8 Degree est un conseil immobilier boutique qui crée, développe et investit dans l’immobilier porté par l’hospitalité à Bali et en Asie du Sud-Est.",
    ctaBrief: "Demander la synthèse investisseur",
    s01Kicker: "01 — Qu’est-ce qu’INC ?",
    s01TitleBefore: "Un studio qui ",
    s01TitleEm: "construit.",
    s01TitleAfter: " Pas qui conseille seulement.",
    whatIsInc: [
      "Un venture studio et incubateur basé à Bali, actif en Asie du Sud-Est",
      "Un seul écosystème — marque, opérations, marketing et capital sous un même toit",
      "Actif depuis 2024, avec un portefeuille en croissance",
      "Fondé et dirigé par des opérateurs, pas seulement des conseillers",
    ],
    s02Kicker: "02 — Où nous bâtissons",
    s02TitleBefore: "Quatre domaines. Un ",
    s02TitleEm: "playbook.",
    s02TitleAfter: "",
    whereWeBuild: [
      {
        numeral: "I.",
        title: "F&B",
        description: "Restaurants, marques de livraison et concepts casual dining.",
      },
      {
        numeral: "II.",
        title: "Hospitalité",
        description: "Lieux, retraites et expériences lifestyle.",
      },
      {
        numeral: "III.",
        title: "Technologie",
        description: "Plateformes et données pour l’hospitalité et le retail en Asie du Sud-Est.",
      },
      {
        numeral: "IV.",
        title: "Immobilier",
        description: "Projets liés à l’immobilier et opportunités adossées à des actifs.",
      },
    ],
    s03KickerMuted: "03 —",
    s03Kicker: "Notre manière de travailler",
    s03TitleBefore: "Implication profonde. ",
    s03TitleEm: "Incitations alignées.",
    s03TitleAfter: "",
    howWeWork: [
      "Partenariats long terme, pas des missions d’agence",
      "Implication opérationnelle du concept au lancement puis à l’échelle",
      "Alignement via revenus, profit et equity",
      "Soutenu par HeyRCG (performance marketing) et Stilkk (créatif & design)",
    ],
    s04Kicker: "04 — Pourquoi les investisseurs s’associent à INC",
    s04TitleBefore: "Liquidité aujourd’hui. ",
    s04TitleEm: "Effet composé",
    s04TitleAfter: " demain.",
    whyInvestors: [
      "Exposition à un portefeuille diversifié — pas un pari unique",
      "Revenus récurrents et potentiel d’equity long terme",
      "Une trajectoire de rendement définie — sans attendre une IPO",
      "Une équipe avec 15+ ans de construction de marques en Asie du Sud-Est",
    ],
    s05Kicker: "05 — Où va votre capital",
    s05TitleBefore: "Dans le ",
    s05TitleEm: "produit.",
    s05TitleAfter: " Pas dans la structure.",
    whereCapital: [
      "Le capital fondateur alimente les marques qu’INC construit et opère — directement le produit, pas les frais généraux",
      "Beaucoup de ces marques sont déjà actives à Bali — vous y avez peut-être déjà mangé ou pris un café",
      "Un pipeline de nouvelles ventures F&B, hospitalité, tech et immobilier",
    ],
    minimumCheckLabel: "Ticket minimum :",
    s06Kicker: "06 — L’invitation",
    s06TitleBefore: "Vous voulez la ",
    s06TitleEm: "vue",
    s06TitleAfter: " complète ?",
    invitationP1:
      "Laissez vos coordonnées. Nous enverrons la synthèse investisseur en privé, avec le modèle financier, la structure de capital et un appel pour la parcourir.",
    invitationP2:
      "Les places sont limitées pour quelques investisseurs fondateurs. Nous serions ravis de vous connaître.",
    signatureRole: "Responsable partenariats · Investissement Bali",
  },
  zh: {
    seoTitle: "投资巴厘岛",
    seoDescription:
      "8 Degree Real Estate 巴厘岛房产与创投机会——面向国际投资者的精品顾问服务。",
    heroAria: "投资巴厘岛",
    byInvitation: "邀约制",
    heroKicker: "8 Degree Real Estate 机会",
    heroLine1Before: "巴厘岛不再只是",
    heroLine1Em: "承接",
    heroLine1After: "各地生意。",
    heroLine2: "它在创造生意。",
    heroSub:
      "8 Degree 是精品房产顾问，在巴厘岛与东南亚打造、扩张并投资以酒店体验为核心的房地产。",
    ctaBrief: "索取投资人简报",
    s01Kicker: "01 — 什么是 INC？",
    s01TitleBefore: "一家真正在",
    s01TitleEm: "落地建设",
    s01TitleAfter: "的工作室，而不是只给建议。",
    whatIsInc: [
      "总部位于巴厘岛的创业工作室与孵化器，布局东南亚",
      "单一生态系统——品牌、运营、营销与资本在同一屋檐",
      "2024 年起运营，组合持续扩张",
      "由一线经营者创立与运营，而非纯顾问团队",
    ],
    s02Kicker: "02 — 我们深耕的领域",
    s02TitleBefore: "四大赛道。同一套",
    s02TitleEm: "打法。",
    s02TitleAfter: "",
    whereWeBuild: [
      {
        numeral: "I.",
        title: "餐饮",
        description: "餐厅、外卖品牌与休闲餐饮概念。",
      },
      {
        numeral: "II.",
        title: "酒店体验",
        description: "场地、静修与生活方式体验。",
      },
      {
        numeral: "III.",
        title: "科技",
        description: "服务东南亚酒店与零售市场的数据与平台型项目。",
      },
      {
        numeral: "IV.",
        title: "房地产",
        description: "与地产相关的创投及资产支持型投资机会。",
      },
    ],
    s03KickerMuted: "03 —",
    s03Kicker: "我们的工作方式",
    s03TitleBefore: "深度参与。",
    s03TitleEm: "激励对齐。",
    s03TitleAfter: "",
    howWeWork: [
      "长期合伙关系，而非短期代理合同",
      "从概念、上线到规模化的深度运营参与",
      "通过收入分成、利润分成与股权保持一致",
      "由 HeyRCG（效果营销）与 Stilkk（创意与设计）赋能",
    ],
    s04Kicker: "04 — 投资者为何与 INC 合作",
    s04TitleBefore: "当下流动性。",
    s04TitleEm: "长期复利",
    s04TitleAfter: "空间。",
    whyInvestors: [
      "接触到多元化组合——而不是单一押注",
      "经常性收入叠加长期股权上行",
      "清晰的回报路径——无需等待 IPO",
      "团队在东南亚拥有 15+ 年品牌打造经验",
    ],
    s05Kicker: "05 — 资金投向",
    s05TitleBefore: "投向",
    s05TitleEm: "产品。",
    s05TitleAfter: "而非管理层级成本。",
    whereCapital: [
      "创始资金直接进入 INC 建设、运营与代表的品牌产品，而非 overhead",
      "其中许多品牌已在巴厘岛运营——您可能已在其中用餐、喝咖啡或训练",
      "餐饮、酒店、科技与房地产领域的新项目管线持续推出",
    ],
    minimumCheckLabel: "最低出资：",
    s06Kicker: "06 — 邀请",
    s06TitleBefore: "想要",
    s06TitleEm: "完整",
    s06TitleAfter: "图景？",
    invitationP1:
      "请留下您的信息。我们将私下发送完整投资人简报，包括财务模型、股权结构与一对一讲解通话。",
    invitationP2: "创始投资人席位有限。我们很希望认识您。",
    signatureRole: "合作负责人 · 巴厘岛投资",
  },
  tr: {
    seoTitle: "Bali'ye yatırım",
    seoDescription:
      "8 Degree Real Estate ile Bali gayrimenkul ve venture fırsatları — uluslararası yatırımcılar için butik danışmanlık.",
    heroAria: "Bali'ye yatırım",
    byInvitation: "Davetle",
    heroKicker: "Bir 8 Degree Real Estate fırsatı",
    heroLine1Before: "Bali artık sadece işletmeleri ",
    heroLine1Em: "ağırlamıyor",
    heroLine1After: ".",
    heroLine2: "Onları inşa ediyor.",
    heroSub:
      "8 Degree; Bali ve Güneydoğu Asya’da otelcilik odaklı gayrimenkulü yaratan, ölçekleyen ve yatırım yapan butik bir danışmanlıktır.",
    ctaBrief: "Yatırımcı özetini isteyin",
    s01Kicker: "01 — INC nedir?",
    s01TitleBefore: "İnşa eden bir ",
    s01TitleEm: "stüdyo.",
    s01TitleAfter: " Tavsiye değil.",
    whatIsInc: [
      "Bali merkezli, Güneydoğu Asya’ya yayılan bir venture stüdyosu ve inkübatör",
      "Tek ekosistem — marka, operasyon, pazarlama ve sermaye tek çatı altında",
      "2024’ten beri faal, büyüyen bir portföy",
      "Danışmanlarla değil, operatörlerle kuruldu ve yönetiliyor",
    ],
    s02Kicker: "02 — Nerede inşa ediyoruz",
    s02TitleBefore: "Dört alan. Tek ",
    s02TitleEm: "oyun kitabı.",
    s02TitleAfter: "",
    whereWeBuild: [
      {
        numeral: "I.",
        title: "F&B",
        description: "Restoranlar, teslimat markaları ve casual dining konseptleri.",
      },
      {
        numeral: "II.",
        title: "Otelcilik",
        description: "Mekânlar, retreatler ve yaşam tarzı deneyimleri.",
      },
      {
        numeral: "III.",
        title: "Teknoloji",
        description: "Güneydoğu Asya otelcilik ve perakende için veri ve platform girişimleri.",
      },
      {
        numeral: "IV.",
        title: "Gayrimenkul",
        description: "Mülke bağlı girişimler ve varlığa dayalı yatırım fırsatları.",
      },
    ],
    s03KickerMuted: "03 —",
    s03Kicker: "Nasıl çalışıyoruz",
    s03TitleBefore: "Derin operasyonel katılım. ",
    s03TitleEm: "Hizalı teşvikler.",
    s03TitleAfter: "",
    howWeWork: [
      "Uzun vadeli ortaklıklar, ajans tarzı kısa işler değil",
      "Konseptten lansa ve ölçeğe kadar derin operasyonel rol",
      "Gelir payı, kâr payı ve equity ile uyum",
      "HeyRCG (performans pazarlama) ve Stilkk (yaratıcı ve tasarım) ile desteklenir",
    ],
    s04Kicker: "04 — Yatırımcılar neden INC ile ortak oluyor",
    s04TitleBefore: "Bugün likidite. ",
    s04TitleEm: "Bileşik",
    s04TitleAfter: " getiri sonra.",
    whyInvestors: [
      "Tek bahis değil, çeşitlendirilmiş portföye maruz kalma",
      "Tekrarlayan gelir + uzun vadeli equity potansiyeli",
      "Tanımlı getiri yolu — IPO beklemek zorunda değilsiniz",
      "Güneydoğu Asya’da 15+ yıl marka kuran ekip",
    ],
    s05Kicker: "05 — Sermayeniz nereye gider",
    s05TitleBefore: "",
    s05TitleEm: "Ürüne.",
    s05TitleAfter: " Genel giderlere değil.",
    whereCapital: [
      "Kurucu sermaye, INC’nin kurduğu ve temsil ettiği markaların ürününe gider — overhead’e değil",
      "Bu markaların çoğu Bali’de hayatta — muhtemelen yemek yediğiniz veya kahve içtiğiniz yerlerden",
      "F&B, otelcilik, teknoloji ve gayrimenkulde yeni girişim hattı",
    ],
    minimumCheckLabel: "Minimum tutar:",
    s06Kicker: "06 — Davet",
    s06TitleBefore: "",
    s06TitleEm: "Tam",
    s06TitleAfter: " resmi görmek ister misiniz?",
    invitationP1:
      "Bilgilerinizi bırakın. Finansal model, equity yapısı ve üzerinden geçmek için görüşme dahil tam yatırımcı özetini özel olarak paylaşalım.",
    invitationP2: "Kurucu yatırımcılar için sınırlı kontenjan var. Sizi tanımak isteriz.",
    signatureRole: "Ortaklıklar başkanı · Bali yatırımı",
  },
};
