import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { LocationGuideReportForm } from "@/components/location-guide/LocationGuideReportForm";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/lib/utils";

const CREAM = "bg-[#fdfbf7]";
const DARK = "bg-[#0d4542]";
const BRAND_TEXT = "text-[#0d4542]";
const LIME_PANEL = "bg-[#dcefc4]";

/** Hero: aerial turquoise coastline (Nusa Dua area photo reads as coastal aerial). */
const HERO_COAST_IMAGE = "/site-media/area-nusa-dua.jpg";

type Spotlight = {
  num: string;
  name: string;
  subheading: string;
  body: string;
  bullets: readonly string[];
  cta: string;
  imageSrc: string;
  imageAlt: string;
  imageOnLeft: boolean;
};

type LocationGuideCopy = {
  seoTitle: string;
  seoDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  heroAria: string;
  stats: readonly { value: string; label: string }[];
  whyTitleBefore: string;
  whyTitleEm: string;
  whyP1: string;
  whyP2: string;
  spotlights: readonly Spotlight[];
  performAria: string;
  performTitleBefore: string;
  performTitleEm: string;
  performCards: readonly { title: string; body: string }[];
  performFootnote: string;
  chooseAria: string;
  chooseTitleBefore: string;
  chooseTitleEm: string;
  chooseColumns: readonly { title: string; body: string }[];
  compareKicker: string;
  compareBody: string;
};

const SPOTLIGHT_LAYOUT = [
  {
    num: "01",
    name: "Canggu",
    imageSrc: "/site-media/area-canggu.jpg",
    imageOnLeft: false as boolean,
  },
  {
    num: "02",
    name: "Uluwatu",
    imageSrc: "/site-media/area-uluwatu.jpg",
    imageOnLeft: true,
  },
  {
    num: "03",
    name: "Ubud",
    imageSrc: "/site-media/area-ubud.jpg",
    imageOnLeft: false,
  },
  {
    num: "04",
    name: "Tabanan",
    imageSrc: "/site-media/area-tabanan.jpg",
    imageOnLeft: true,
  },
] as const;

function buildSpotlights(
  texts: readonly [
    { subheading: string; body: string; bullets: readonly string[]; cta: string; imageAlt: string },
    { subheading: string; body: string; bullets: readonly string[]; cta: string; imageAlt: string },
    { subheading: string; body: string; bullets: readonly string[]; cta: string; imageAlt: string },
    { subheading: string; body: string; bullets: readonly string[]; cta: string; imageAlt: string },
  ],
): readonly Spotlight[] {
  return SPOTLIGHT_LAYOUT.map((layout, i) => ({
    ...layout,
    ...texts[i]!,
  }));
}

const LOCATION_GUIDE_BY_LANG: Record<SiteLanguage, LocationGuideCopy> = {
  en: {
    seoTitle: "Where to Invest in Bali Property (2026 Guide)",
    seoDescription:
      "Area-by-area guide to Bali for property investors: Canggu, Uluwatu, Ubud, and Tabanan—what drives demand, risk, and long-term performance in 2026.",
    heroKicker: "Everything you need to know",
    heroTitle: "Where to Invest in Bali Property (2026 Guide)",
    heroSub:
      "Bali is not one market—it is a network of micro-markets with different demand curves, regulations, and exit liquidity. This guide frames how to read location before you read listings.",
    heroAria: "Location guide introduction",
    stats: [
      { value: "4 Million", label: "Visitors" },
      { value: "2026", label: "Guide year" },
      { value: "8–14%", label: "Typical ROI range" },
      { value: "International", label: "Market" },
    ],
    whyTitleBefore: "Why Location Matters ",
    whyTitleEm: "More Than Anything",
    whyP1:
      "In Bali, two villas with similar fit-out can perform entirely differently based on fifteen minutes of driving—because demand, access, and future competition are hyper-local.",
    whyP2:
      "Investors who win here treat location as the primary risk control: they underwrite micro-market demand, not only the asset brochure. Use this guide to compare areas before you compare bedrooms.",
    spotlights: buildSpotlights([
      {
        subheading: "Bali’s social and investment hub",
        body: "Canggu blends beach culture, dining, and remote-work infrastructure into one high-velocity micro-market. Demand stays elevated because visitors and residents cluster here year-round—not only in peak season.",
        bullets: [
          "Strong short-term rental demand with high occupancy in well-run villas",
          "World-class cafés, fitness, and schools within a compact radius",
          "Liquidity and comparables are easier to read than in emerging pockets",
        ],
        cta: "Use Canggu as your benchmark for amenity depth and rental velocity—then decide if you want heat or a quieter edge.",
        imageAlt: "Aerial view of coastal Canggu — beaches and turquoise water",
      },
      {
        subheading: "Luxury cliffside growth",
        body: "Uluwatu is where surf culture meets elevated hospitality. Cliffside land is finite, which supports pricing for well-positioned villas and boutique resorts as international demand grows.",
        bullets: [
          "Scarcity-driven upside on ocean-view and clifftop positions",
          "High-end resorts anchor premium nightly rates nearby",
          "Strong weekender and event-driven demand from Asia-Pacific travelers",
        ],
        cta: "In Uluwatu, pay for view, access, and engineering quality—those three variables drive long-term performance.",
        imageAlt: "Bali coastline and cliffs near Uluwatu",
      },
      {
        subheading: "Culture, wellness, and green buffer",
        body: "Ubud attracts longer stays: wellness retreats, creatives, and remote workers who want jungle and rice-field calm within reach of services. It behaves differently from beach towns—think lower churn, different seasonality.",
        bullets: [
          "Wellness and nature-led positioning",
          "Digital-nomad density supports mid-length stays",
          "Distinct from coastal markets—diversifies a portfolio",
        ],
        cta: "Match Ubud to lifestyle-led or wellness-positioned product; undervalue the operational detail at your peril.",
        imageAlt: "Road lined with tall palms toward Ubud rice terraces",
      },
      {
        subheading: "Space, authenticity, and value sleeves",
        body: "Tabanan offers larger land plots and a slower rhythm—appealing for estate homes, eco-conscious concepts, and buyers who prioritize space over nightclub adjacency.",
        bullets: [
          "More room for landscape, agriculture buffers, and privacy",
          "Authentic village and temple culture within short drives",
          "Select pockets benefit from Canggu/Sidemen spillover",
        ],
        cta: "Tabanan rewards patient capital and clear positioning—lead with access, drainage, and legal clarity on land.",
        imageAlt: "Rural Bali irrigated fields in Tabanan",
      },
    ]),
    performAria: "What makes a location perform",
    performTitleBefore: "What makes a location ",
    performTitleEm: "perform.",
    performCards: [
      {
        title: "Demand",
        body: "Rental inquiries, occupancies, and rate durability—does the micro-market need your product every week?",
      },
      {
        title: "Infrastructure",
        body: "Roads, power, water, and future public works—what improves access and quality of stay over the next 3–7 years?",
      },
      {
        title: "Community",
        body: "Retail, schools, health, and safety—what keeps guests and residents comfortable beyond the villa gate?",
      },
      {
        title: "Future growth",
        body: "Pipeline, zoning realism, and comparative supply—where is the next tranche of rooms coming from?",
      },
    ],
    performFootnote:
      "If a location fails one of these tests, you can still proceed—but you should price the risk explicitly in your model and your negotiations.",
    chooseAria: "How to choose the right area",
    chooseTitleBefore: "How to choose the ",
    chooseTitleEm: "right area.",
    chooseColumns: [
      {
        title: "Your budget",
        body: "Land-and-build, turnkey villa, or leasehold—your budget anchors which micro-markets are realistic without over-leveraging.",
      },
      {
        title: "Investment goal",
        body: "Yield, appreciation, or lifestyle offset—each implies different location screens and hold horizons.",
      },
      {
        title: "Timeline",
        body: "Building, permitting, and ramp-up times vary by area; align location with when you need cash flow or equity events.",
      },
      {
        title: "Lifestyle preference",
        body: "Surf mornings, jungle calm, or resort adjacency—your preference should still pass underwriting, not override it.",
      },
    ],
    compareKicker: "Compare locations on the numbers",
    compareBody:
      "Benchmarks move fast—occupancy, ADR, and supply shifts should be validated against current data, not forum anecdotes. Use our investment guide and market report downloads to stress-test location assumptions before you commit.",
  },
  id: {
    seoTitle: "Di Mana Berinvestasi Properti di Bali (Panduan 2026)",
    seoDescription:
      "Panduan per kawasan untuk investor properti Bali: Canggu, Uluwatu, Ubud, dan Tabanan—apa yang mendorong permintaan, risiko, dan kinerja jangka panjang di 2026.",
    heroKicker: "Semua yang perlu Anda ketahui",
    heroTitle: "Di Mana Berinvestasi Properti di Bali (Panduan 2026)",
    heroSub:
      "Bali bukan satu pasar—melainkan jaringan mikro-pasar dengan kurva permintaan, regulasi, dan likuiditas keluar yang berbeda. Panduan ini membantu Anda membaca lokasi sebelum membaca listing.",
    heroAria: "Pengantar panduan lokasi",
    stats: [
      { value: "4 Juta", label: "Pengunjung" },
      { value: "2026", label: "Tahun panduan" },
      { value: "8–14%", label: "Kisaran ROI umum" },
      { value: "Internasional", label: "Pasar" },
    ],
    whyTitleBefore: "Mengapa Lokasi ",
    whyTitleEm: "Lebih Penting dari Apa Pun",
    whyP1:
      "Di Bali, dua vila dengan finishing serupa bisa berperforma sangat berbeda hanya karena jarak berkendara 15 menit—permintaan, akses, dan persaingan di masa depan sangat lokal.",
    whyP2:
      "Investor yang menang memperlakukan lokasi sebagai kontrol risiko utama: mereka menganalisis permintaan mikro-pasar, bukan hanya brosur aset. Gunakan panduan ini untuk membandingkan kawasan sebelum membandingkan jumlah kamar tidur.",
    spotlights: buildSpotlights([
      {
        subheading: "Pusat sosial dan investasi Bali",
        body: "Canggu memadukan budaya pantai, kuliner, dan infrastruktur kerja jarak jauh dalam satu mikro-pasar dinamis. Permintaan tinggi karena pengunjung dan penduduk berkumpul sepanjang tahun—bukan hanya musim puncak.",
        bullets: [
          "Permintaan sewa jangka pendek kuat dengan okupansi tinggi pada vila yang dikelola baik",
          "Kafe, kebugaran, dan sekolah kelas dunia dalam radius yang padat",
          "Likuiditas dan pembanding harga lebih mudah dibaca dibanding kawasan baru",
        ],
        cta: "Gunakan Canggu sebagai acuan kedalaman fasilitas dan kecepatan sewa—lalu putuskan apakah Anda ingin pasar panas atau pinggiran yang lebih tenang.",
        imageAlt: "Pemandangan udara Canggu pantai dan air laut",
      },
      {
        subheading: "Pertumbuhan mewah di tebing",
        body: "Uluwatu adalah pertemuan budaya selancar dan hospitalitas bertaraf tinggi. Lahan tebing terbatas, mendukung harga untuk vila dan resor butik yang posisinya baik seiring permintaan internasional.",
        bullets: [
          "Potensi upside yang didorong kelangkaan untuk pemandangan laut dan posisi tebing",
          "Resor kelas atas menopang tarif malam premium di sekitarnya",
          "Permintaan akhir pekan dan acara dari wisatawan Asia-Pasifik",
        ],
        cta: "Di Uluwatu, bayar untuk pemandangan, akses, dan kualitas teknik—ketiga variabel ini mendorong kinerja jangka panjang.",
        imageAlt: "Garis pantai dan tebing Bali dekat Uluwatu",
      },
      {
        subheading: "Budaya, wellness, dan hijau sekitar",
        body: "Ubud menarik masa inap lebih panjang: retreat wellness, kreatif, dan pekerja remote yang ingin ketenangan hutan dan sawah namun masih dekat layanan. Polanya berbeda dari kota pantai—churn lebih rendah, musiman berbeda.",
        bullets: [
          "Pemosisian wellness dan alam",
          "Kepadatan digital nomad mendukung inap menengah",
          "Berbeda dari pasar pantai—membantu diversifikasi portofolio",
        ],
        cta: "Selaraskan Ubud dengan produk gaya hidup atau wellness; mengabaikan detail operasional berisiko besar.",
        imageAlt: "Jalan berpohon kelapa menuju sawah Ubud",
      },
      {
        subheading: "Ruang, autentisitas, dan segmen nilai",
        body: "Tabanan menawarkan plot tanah lebih luas dan ritme lebih tenang—menarik untuk estate, konsep ramah lingkungan, dan pembeli yang mengutamakan ruang daripada ke dekat klub malam.",
        bullets: [
          "Lebih banyak ruang untuk lanskap, penyangga pertanian, dan privasi",
          "Budaya desa dan pura otentik dalam jarak berkendara singkat",
          "Beberapa lokasi diuntungkan limbah permintaan Canggu/Sidemen",
        ],
        cta: "Tabanan menguntungkan modal sabar dan posisi jelas—utamakan akses, drainase, dan kejelasan hukum tanah.",
        imageAlt: "Lanskap pedesaan dan sawah irigasi Tabanan",
      },
    ]),
    performAria: "Apa yang membuat lokasi berperforma",
    performTitleBefore: "Apa yang membuat lokasi ",
    performTitleEm: "berperforma.",
    performCards: [
      {
        title: "Permintaan",
        body: "Minat sewa, okupansi, dan ketahanan tarif—apakah mikro-pasar ini membutuhkan produk Anda setiap minggu?",
      },
      {
        title: "Infrastruktur",
        body: "Jalan, listrik, air, dan proyek publik ke depan—apa yang memperbaiki akses dan kualitas menginap dalam 3–7 tahun?",
      },
      {
        title: "Komunitas",
        body: "Ritel, sekolah, kesehatan, dan keamanan—apa yang membuat tamu dan penduduk nyaman di luar pagar vila?",
      },
      {
        title: "Pertumbuhan masa depan",
        body: "Pipeline, realisme zonasi, dan suplai pembanding—dari mana gelombang kamar berikutnya?",
      },
    ],
    performFootnote:
      "Jika lokasi gagal salah satu ujian ini, Anda tetap bisa lanjut—tapi risiko harus dihargai secara eksplisit dalam model dan negosiasi.",
    chooseAria: "Cara memilih kawasan yang tepat",
    chooseTitleBefore: "Cara memilih ",
    chooseTitleEm: "kawasan yang tepat.",
    chooseColumns: [
      {
        title: "Anggaran Anda",
        body: "Tanah-bangun, vila siap huni, atau sewa jangka panjang—anggaran menentukan mikro-pasar mana yang realistis tanpa leverage berlebihan.",
      },
      {
        title: "Tujuan investasi",
        body: "Yield, apresiasi, atau offset gaya hidup—masing-masing butuh saringan lokasi dan horizon berbeda.",
      },
      {
        title: "Linimasa",
        body: "Bangun, izin, dan naik operasi bervariasi per kawasan; selaraskan lokasi dengan kapan Anda butuh arus kas atau event ekuitas.",
      },
      {
        title: "Preferensi gaya hidup",
        body: "Selancar pagi, ketenangan hutan, atau dekat resor—preferensi tetap harus lulus underwriting, bukan menggantikannya.",
      },
    ],
    compareKicker: "Bandingkan lokasi dengan angka",
    compareBody:
      "Acuan bergerak cepat—okupansi, ADR, dan pergeseran suplai harus divalidasi dengan data terkini, bukan cerita forum. Gunakan panduan investasi dan unduhan laporan pasar untuk uji asumsi lokasi sebelum commit.",
  },
  fr: {
    seoTitle: "Ou investir dans l’immobilier à Bali (guide 2026)",
    seoDescription:
      "Guide par zone pour les investisseurs à Bali : Canggu, Uluwatu, Ubud et Tabanan — demande, risques et performance à long terme en 2026.",
    heroKicker: "Tout ce qu’il faut savoir",
    heroTitle: "Ou investir dans l’immobilier à Bali (guide 2026)",
    heroSub:
      "Bali n’est pas un marché unique : c’est un réseau de micro-marchés aux courbes de demande, règles et liquidité de sortie distinctes. Ce guide aide à lire l’emplacement avant les annonces.",
    heroAria: "Introduction au guide des lieux",
    stats: [
      { value: "4 millions", label: "Visiteurs" },
      { value: "2026", label: "Année du guide" },
      { value: "8–14 %", label: "Fourchette de ROI courante" },
      { value: "International", label: "Marché" },
    ],
    whyTitleBefore: "Pourquoi l’emplacement compte ",
    whyTitleEm: "plus que tout",
    whyP1:
      "À Bali, deux villas au standing comparable peuvent très différer avec un quart d’heure de route : demande, accès et concurrence future sont hyper-locaux.",
    whyP2:
      "Les investisseurs qui réussissent traitent l’emplacement comme premier levier de risque : ils souscrivent la demande du micro-marché, pas seulement la brochure. Comparez les zones avant de comparer les chambres.",
    spotlights: buildSpotlights([
      {
        subheading: "Hub social et investissement de Bali",
        body: "Canggu mêle plage, restauration et télétravail dans un micro-marché très dynamique. La demande reste forte car visiteurs et résidents s’y concentrent toute l’année.",
        bullets: [
          "Forte demande locative courte et bon taux d’occupation pour des villas bien gérées",
          "Cafés, fitness et écoles de haut niveau dans un rayon compact",
          "Liquidité et comparables plus lisibles que dans les zones émergentes",
        ],
        cta: "Utilisez Canggu comme référence d’offre de services et de vélocité locative — puis choisissez intensité ou calme.",
        imageAlt: "Vue aérienne de Canggu côte et eau turquoise",
      },
      {
        subheading: "Croissance luxe sur les falaises",
        body: "Uluwatu allie surf et hospitalité haut de gamme. Le foncier falaise est rare, ce qui soutient les prix des villas et resorts bien positionnés.",
        bullets: [
          "Potentiel lié à la rareté pour les vues mer et positions sur falaise",
          "Resorts haut de gamme soutiennent les tarifs nuit à proximité",
          "Forte demande week-end et événements depuis l’Asie-Pacifique",
        ],
        cta: "À Uluwatu, payez la vue, l’accès et la qualité technique — ces trois leviers fixent la performance long terme.",
        imageAlt: "Côte et falaises près d’Uluwatu",
      },
      {
        subheading: "Culture, bien-être et nature",
        body: "Ubud attire des séjours plus longs : retraites bien-être, créatifs et télétravailleurs cherchant la jungle et les rizières à proximité des services. Sa saisonnalité diffère des villes de plage.",
        bullets: [
          "Positionnement bien-être et nature",
          "Densité de nomades digitaux pour des séjours moyens",
          "Complément aux marchés côtiers pour diversifier",
        ],
        cta: "Adaptez Ubud à un produit lifestyle ou bien-être ; négliger l’opérationnel est risqué.",
        imageAlt: "Route bordée de palmiers vers les rizières d’Ubud",
      },
      {
        subheading: "Espace, authenticité et valeur",
        body: "Tabanan offre de plus grandes parcelles et un rythme plus lent — domaines, concepts éco et acheteurs qui privilégient l’espace au voisinage nocturne.",
        bullets: [
          "Marges pour paysage, tampons agricoles et intimité",
          "Villages et temples authentiques à courte distance",
          "Certains secteurs profitent du rebond depuis Canggu/Sidemen",
        ],
        cta: "Tabanan récompense le capital patient et un positionnement clair : accès, drainage et clarté juridique d’abord.",
        imageAlt: "Paysage rural et rizières irriguées à Tabanan",
      },
    ]),
    performAria: "Ce qui fait performer un emplacement",
    performTitleBefore: "Ce qui fait performer un ",
    performTitleEm: "emplacement.",
    performCards: [
      {
        title: "Demande",
        body: "Demandes locatives, taux d’occupation et tenue des prix — le micro-marché a-t-il besoin de votre produit chaque semaine ?",
      },
      {
        title: "Infrastructure",
        body: "Routes, énergie, eau et grands projets — qu’est-ce qui améliore accès et séjour sur 3 à 7 ans ?",
      },
      {
        title: "Communauté",
        body: "Commerces, écoles, santé, sécurité — qu’est-ce qui rassure au-delà du portail de la villa ?",
      },
      {
        title: "Croissance future",
        body: "Pipeline, zonage réaliste et offre comparable — d’où viennent la prochaine vague de chambres ?",
      },
    ],
    performFootnote:
      "Si l’emplacement échoue à un de ces tests, vous pouvez avancer — mais chiffrer explicitement le risque dans votre modèle et vos négociations.",
    chooseAria: "Choisir la bonne zone",
    chooseTitleBefore: "Choisir la ",
    chooseTitleEm: "bonne zone.",
    chooseColumns: [
      {
        title: "Votre budget",
        body: "Terrain + construction, villa clé en main ou leasehold — le budget fixe les micro-marchés réalistes sans sur-effet de levier.",
      },
      {
        title: "Objectif d’investissement",
        body: "Rendement, plus-value ou usage lifestyle — chaque objectif change les critères de zone et l’horizon de détention.",
      },
      {
        title: "Calendrier",
        body: "Construction, permis et montée en charge varient ; alignez la zone sur vos besoins de cash-flow ou d’événement de capital.",
      },
      {
        title: "Préférence lifestyle",
        body: "Surf le matin, jungle calme ou proximité resort — la préférence doit passer le souscription, pas le remplacer.",
      },
    ],
    compareKicker: "Comparer les lieux avec des chiffres",
    compareBody:
      "Les références bougent vite — occuper ADR et offre avec des données actuelles, pas des forums. Appuyez-vous sur notre guide investissement et nos rapports pour tester vos hypothèses d’emplacement avant d’engager.",
  },
  zh: {
    seoTitle: "2026 巴厘岛房产投资区域指南",
    seoDescription:
      "面向国际投资者的巴厘岛分区域指南：Canggu、Uluwatu、Ubud、Tabanan——2026 年的需求驱动、风险与长期表现。",
    heroKicker: "您需要了解的一切",
    heroTitle: "2026 巴厘岛房产投资区域指南",
    heroSub:
      "巴厘岛并不是单一市场，而是由多个微市场组成的网络，各自对应不同的需求曲线、法规与退出流动性。本指南帮助您在看房源之前先读懂区位。",
    heroAria: "区域指南导语",
    stats: [
      { value: "400 万", label: "访客量" },
      { value: "2026", label: "指南年份" },
      { value: "8–14%", label: "常见 ROI 区间" },
      { value: "国际", label: "市场" },
    ],
    whyTitleBefore: "为什么区位 ",
    whyTitleEm: "比什么都重要",
    whyP1:
      "在巴厘岛，两套装修相近的别墅可能只因车程十几分钟而表现截然不同——需求、通达性与未来竞争都是高度本地化的。",
    whyP2:
      "做得好的投资者把区位当作首要风控：他们分析微市场需求，而不只看销售折页。请先用本指南比较区域，再比较卧室数量。",
    spotlights: buildSpotlights([
      {
        subheading: "巴厘社交与投资核心区",
        body: "Canggu 将海滩文化、餐饮与远程办公基础设施结合成一个高活力微市场。访客与居民全年聚集，不仅限于旺季。",
        bullets: [
          "管理良好的别墅在短租需求与入住率上表现突出",
          "优质咖啡馆、健身与学校在紧凑半径内可达",
          "相比新兴片区，流动性与可比数据更清晰",
        ],
        cta: "以 Canggu 作为配套深度与租金周转的基准——再决定您要热点还是更安静的边缘带。",
        imageAlt: "Canggu 海岸鸟瞰与碧蓝海水",
      },
      {
        subheading: "奢华崖岸增长带",
        body: "Uluwatu 融合冲浪文化与高阶酒店业。崖岸土地稀缺，有利于位置出色的别墅与精品度假村定价。",
        bullets: [
          "海景与崖顶位置因稀缺具上行空间",
          "高端度假酒店支撑周边夜间房价",
          "亚太周末与活动型需求强劲",
        ],
        cta: "在 Uluwatu，为景观、通达与工程质量付费——这三项决定长期表现。",
        imageAlt: "乌鲁瓦图附近巴厘岛海岸与悬崖",
      },
      {
        subheading: "文化、康养与绿荫缓冲",
        body: "Ubud 吸引更长停留：康养旅居、创意群体与偏好稻田静谧又需配套的数字游民。季节性与海滨城镇不同。",
        bullets: [
          "康养与自然导向的定位",
          "数字游民密度支持中等长度入住",
          "与沿海市场差异明显，利于组合分散",
        ],
        cta: "将 Ubud 匹配生活方式或康养产品；低估运营细节风险很高。",
        imageAlt: "通往乌布稻田的棕榈道路",
      },
      {
        subheading: "空间、真实感与价值带",
        body: "Tabanan 地块更大、节奏更慢，适合庄园住宅、生态概念以及重视空间甚于夜生活邻里的买家。",
        bullets: [
          "景观、农地缓冲与私密性空间更充裕",
          "真实村落与寺庙文化短途可达",
          "部分片区受益于 Canggu/Sidemen 外溢需求",
        ],
        cta: "Tabanan 回报耐心资本与清晰定位——优先核实通达、排水与土地法律清晰度。",
        imageAlt: "塔巴南乡村与灌溉稻田景观",
      },
    ]),
    performAria: "什么让区位表现良好",
    performTitleBefore: "什么让区位",
    performTitleEm: "表现良好。",
    performCards: [
      {
        title: "需求",
        body: "租赁咨询、入住率与房价韧性——该微市场是否每周都需要您的产品？",
      },
      {
        title: "基础设施",
        body: "道路、电力、水务与大型工程——未来 3–7 年哪些因素提升通达与居住体验？",
      },
      {
        title: "社区",
        body: "零售、学校、医疗与安全——什么让住客与居民在别墅门外也安心？",
      },
      {
        title: "未来增长",
        body: "供应管线、用地规划现实度与可比供给——下一批客房从哪里来？",
      },
    ],
    performFootnote:
      "若一个区位在其中某项测试上偏弱，您仍可推进——但应在模型与谈判中对风险显式计价。",
    chooseAria: "如何选择合适区域",
    chooseTitleBefore: "如何选择",
    chooseTitleEm: "合适区域。",
    chooseColumns: [
      {
        title: "预算",
        body: "买地自建、现成别墅或租赁权——预算决定哪些微市场在不过度杠杆下可行。",
      },
      {
        title: "投资目标",
        body: "现金流收益、资产增值或生活方式抵扣——目标不同，筛选与持有期也不同。",
      },
      {
        title: "时间线",
        body: "建设、许可与爬坡期因区而异；让区位与您需要现金流或股权事件的时间对齐。",
      },
      {
        title: "生活方式偏好",
        body: "晨间冲浪、雨林宁静或近度假村——偏好仍须通过收益测算，而非取而代之。",
      },
    ],
    compareKicker: "用数据比较区位",
    compareBody:
      "基准变化很快——入住率、ADR 与供应变动应以实时数据验证，而非论坛传闻。请结合我们的投资指南与市场报告下载，在决策前压力测试区位假设。",
  },
  tr: {
    seoTitle: "Bali’de Gayrimenkule Nerede Yatırım Yapılır (2026 Rehberi)",
    seoDescription:
      "Uluslararası yatırımcılar için Bali bölge rehberi: Canggu, Uluwatu, Ubud ve Tabanan — talep, risk ve uzun vadeli performans (2026).",
    heroKicker: "Bilmeniz gereken her şey",
    heroTitle: "Bali’de Gayrimenkule Nerede Yatırım Yapılır (2026 Rehberi)",
    heroSub:
      "Bali tek bir pazar değil; farklı talep eğrileri, düzenlemeler ve çıkış likiditesi olan bir mikro-pazar ağıdır. Bu rehber, ilanları okumadan önce konumu nasıl okuyacağınızı çerçeveler.",
    heroAria: "Konum rehberi girişi",
    stats: [
      { value: "4 milyon", label: "Ziyaretçi" },
      { value: "2026", label: "Rehber yılı" },
      { value: "8–14%", label: "Tipik ROI aralığı" },
      { value: "Uluslararası", label: "Pazar" },
    ],
    whyTitleBefore: "Konumun Neden ",
    whyTitleEm: "Her Şeyden Daha Önemli Olduğu",
    whyP1:
      "Bali’de, benzer donanımlı iki villa, on beş dakikalık mesafe yüzünden tamamen farklı performans gösterebilir — talep, erişim ve rekabet yerelde yoğunlaşır.",
    whyP2:
      "Burada kazanan yatırımcılar konumu birincil risk kontrolü görür: yalnızca broşür değil, mikro-pazar talebini analiz ederler. Yatak odası sayısından önce bölgeleri bu rehberle karşılaştırın.",
    spotlights: buildSpotlights([
      {
        subheading: "Bali’nin sosyal ve yatırım merkezi",
        body: "Canggu plaj kültürü, yeme-içme ve uzaktan çalışma altyapısını tek bir yüksek temponun içinde birleştirir. Talep, ziyaretçiler ve sakinler yıl boyu burada toplandığı için yüksek kalır.",
        bullets: [
          "İyi yönetilen villalarda güçlü kısa dönem kiralama talebi ve doluluk",
          "Sıkışık bir yarıçapta kaliteli kafe, spor ve okullar",
          "Likidite ve kıyaslar gelişmekte olan bölgelere göre daha okunabilir",
        ],
        cta: "Canggu’yu olanak derinliği ve kira hızı için referans alın — sonra yoğunluk ya da daha sakin bir çevre isteyip istemediğinize karar verin.",
        imageAlt: "Canggu uygun görünümü — plaj ve turkuaz deniz",
      },
      {
        subheading: "Lüks uçurum kenarı büyümesi",
        body: "Uluwatu sörf kültürü ile üst segment konaklamayı birleştirir. Uçurum arsası sınırlıdır; uluslararası talep büyürken iyi konumlu villalar ve butik resortlar için fiyatları destekler.",
        bullets: [
          "Deniz manzarası ve uçurum konumlarında kıtlık kaynaklı potansiyel",
          "Yakındaki üst düzey resortlar gecelik ücretleri destekler",
          "Asya-Pasifik’ten hafta sonu ve etkinlik talebi",
        ],
        cta: "Uluwatu’da manzara, erişim ve mühendislik kalitesi için ödeyin — uzun vadeli performansı bu üç değişken belirler.",
        imageAlt: "Uluwatu yakınında Bali kıyısı ve kayalıklar",
      },
      {
        subheading: "Kültür, wellness ve yeşil tampon",
        body: "Ubud daha uzun konakları çeker: wellness kampları, yaratıcılar ve hizmetlere yakın orman-sakinliği isteyen uzaktan çalışanlar. Mevsimsellik plaj kasabalarından farklıdır.",
        bullets: [
          "Wellness ve doğa odaklı konumlama",
          "Dijital göçebe yoğunluğu orta süreli konakları destekler",
          "Kıyı pazarlarından ayrışır — portföy çeşitlendirir",
        ],
        cta: "Ubud’u yaşam tarzı veya wellness ürünüyle eşleştirin; operasyonel detayı hafife almayın.",
        imageAlt: "Ubud pirinç tarlalarına uzun palmiyeli yol",
      },
      {
        subheading: "Alan, otantiklik ve değer segmentleri",
        body: "Tabanan daha geniş arsalar ve daha yavaş ritim sunar — malikane, eko bilinçli konseptler ve gece yaşamına komşuluktan çok alanı önceleyen alıcılar için.",
        bullets: [
          "Peyzaj, tarımsal tampon ve mahremiyet için daha fazla alan",
          "Kısa sürüş mesafesinde otantik köy ve tapınak kültürü",
          "Seçilmiş bölgeler Canggu/Sidemen taşmasından yararlanır",
        ],
        cta: "Tabanan sabır sermayesi ve net konumlandırmayı ödüllendirir — önce erişim, drenaj ve hukuki netlik.",
        imageAlt: "Tabanan kırsal manzara ve sulama tarlaları",
      },
    ]),
    performAria: "Bir konumu performanslı yapan nedir",
    performTitleBefore: "Bir konumu ",
    performTitleEm: "performanslı yapan nedir.",
    performCards: [
      {
        title: "Talep",
        body: "Kiralama talebi, doluluk ve ücret dayanıklılığı — mikro-pazarınız ürününüze her hafta ihtiyaç duyuyor mu?",
      },
      {
        title: "Altyapı",
        body: "Yollar, enerji, su ve önümüzdeki 3–7 yılda erişimi ve kalış kalitesini ne iyileştirir?",
      },
      {
        title: "Topluluk",
        body: "Perakende, okullar, sağlık ve güvenlik — misafir ve sakinleri villa kapısının ötesinde ne rahat tutar?",
      },
      {
        title: "Gelecek büyümesi",
        body: "Pipeline, imar gerçekçiliği ve karşılaştırmalı arz — bir sonraki oda dalgası nereden geliyor?",
      },
    ],
    performFootnote:
      "Bir konum bu testlerden birinde zayıfsa yine de ilerleyebilirsiniz — ancak riski modelinizde ve müzakerede açıkça fiyatlayın.",
    chooseAria: "Doğru bölgeyi nasıl seçersiniz",
    chooseTitleBefore: "Doğru bölgeyi ",
    chooseTitleEm: "nasıl seçersiniz.",
    chooseColumns: [
      {
        title: "Bütçeniz",
        body: "Arsa-inşa, anahtar teslim villa veya leasehold — bütçe, aşırı kaldıraç olmadan hangi mikro-pazarların gerçekçi olduğunu belirler.",
      },
      {
        title: "Yatırım hedefi",
        body: "Getiri, değer artışı veya yaşam tarzı denkleştirmesi — her biri farklı bölge filtresi ve tutma ufkunu ima eder.",
      },
      {
        title: "Zaman çizelgesi",
        body: "İnşa, izin ve ivme süreleri bölgeye göre değişir; konumu nakit akışı veya özkaynak ihtiyacınıza göre hizalayın.",
      },
      {
        title: "Yaşam tercihi",
        body: "Sabah sörf, orman sakinliği veya resort yakınlığı — tercih yine de finansal testi geçmeli, onun yerine geçmemeli.",
      },
    ],
    compareKicker: "Konumları rakamlarla karşılaştırın",
    compareBody:
      "Kıyaslar hızlı değişir — doluluk, ADR ve arz kaymaları forum anekdotlarıyla değil güncel veriyle doğrulanmalıdır. Karar vermeden önce konum varsayımlarını yatırım rehberimiz ve piyasa raporu indirmeleriyle test edin.",
  },
};

export default function LocationGuidePage() {
  const [path] = useLocation();
  const language = useSiteLanguage();
  const copy = LOCATION_GUIDE_BY_LANG[language];

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-[#1c1917] antialiased">
      <Seo
        title={copy.seoTitle}
        description={truncateForMeta(copy.seoDescription)}
        path={path === "/location-guide" ? "/bali-location-guide" : path}
      />

      {/* Hero — full image with breathe motion */}
      <section className="relative w-full overflow-hidden" aria-label={copy.heroAria}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden min-h-[min(72dvh,680px)]">
          <img
            src={HERO_COAST_IMAGE}
            alt=""
            className="hero-image-breathe h-full min-h-[min(72dvh,680px)] w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 z-10 bg-black/42" aria-hidden />
        </div>
        <div className="relative z-20 mx-auto flex min-h-[min(72dvh,680px)] w-full max-w-6xl flex-col items-center justify-center px-6 py-20 text-center text-white translate-y-[6dvh] md:translate-y-[8dvh] lg:translate-y-[9dvh] md:px-12 md:py-24">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90">{copy.heroKicker}</p>
          <h1 className="max-w-4xl font-serif text-3xl font-bold leading-[1.12] tracking-[0.03em] md:text-4xl lg:text-[2.55rem]">
            {copy.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/90 md:mt-6 md:text-base lg:text-lg">
            {copy.heroSub}
          </p>
        </div>
      </section>

      {/* Why location matters */}
      <section id="why-location" className={cn(DARK, "scroll-mt-24 py-16 md:py-24")}>
        <div className="container mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-10 lg:gap-20">
          <div className="divide-y divide-white/20">
            {copy.stats.map((row) => (
              <div key={row.label} className="py-6 first:pt-0 md:py-7">
                <p className="font-serif text-3xl font-bold tabular-nums text-white md:text-4xl">{row.value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">{row.label}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-[0.03em] text-white md:text-3xl lg:text-[2.25rem]">
              {copy.whyTitleBefore}
              <em className="font-serif font-bold italic text-[#b8e29d]">{copy.whyTitleEm}</em>
            </h2>
            <p className="mt-6 text-base font-light leading-relaxed text-white/88 md:text-lg">{copy.whyP1}</p>
            <p className="mt-5 text-base font-light leading-relaxed text-white/88 md:text-lg">{copy.whyP2}</p>
          </div>
        </div>
      </section>

      {/* Location spotlights 01–04 */}
      {copy.spotlights.map((s) => (
        <section key={s.name} className={cn(CREAM, "py-14 md:py-20")} aria-labelledby={`spotlight-${s.num}`}>
          <div className="container mx-auto max-w-6xl px-6 md:px-10">
            <div className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16", s.imageOnLeft ? "" : "")}>
              <div className={cn("min-w-0", s.imageOnLeft ? "lg:order-1" : "lg:order-2")}>
                <p className="font-serif text-5xl font-light tabular-nums leading-none text-[#0d4542]/25 md:text-6xl">{s.num}</p>
                <h2 id={`spotlight-${s.num}`} className="mt-4 font-serif text-2xl font-bold tracking-[0.04em] text-[#0d4542] md:text-3xl">
                  {s.name}
                </h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#0d4542]/75">{s.subheading}</p>
                <p className="mt-6 text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">{s.body}</p>
                <ul className="mt-8 list-none space-y-4 p-0">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-[#0d4542]" strokeWidth={2.2} aria-hidden />
                      <span className="text-sm font-light leading-relaxed md:text-base">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className={cn(LIME_PANEL, "mt-10 rounded-2xl p-6 md:p-8")}>
                  <p className={cn("text-sm font-light leading-relaxed md:text-base", BRAND_TEXT)}>{s.cta}</p>
                </div>
              </div>
              <div className={cn("min-w-0 overflow-hidden rounded-2xl", s.imageOnLeft ? "lg:order-2" : "lg:order-1")}>
                <img
                  src={s.imageSrc}
                  alt={s.imageAlt}
                  className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto lg:min-h-[340px]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* What makes a location perform */}
      <section className={cn(DARK, "py-16 md:py-24")} aria-label={copy.performAria}>
        <div className="container mx-auto max-w-6xl px-6 md:px-10">
          <h2 className="max-w-3xl font-serif text-2xl font-bold leading-tight tracking-[0.03em] text-white md:text-3xl lg:text-[2.25rem]">
            {copy.performTitleBefore}
            <em className="font-serif font-bold italic text-[#b8e29d]">{copy.performTitleEm}</em>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {copy.performCards.map((card) => (
              <article
                key={card.title}
                className={cn(
                  "relative flex flex-col rounded-2xl border border-white/35 bg-transparent px-5 py-6 md:px-6 md:py-7",
                  "cursor-default transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform",
                  "hover:z-10 hover:scale-[1.04] hover:border-[#b8e29d]/60",
                  "hover:shadow-[0_20px_50px_-14px_rgba(0,0,0,0.45),0_0_0_1px_rgba(184,226,157,0.12)]",
                  "active:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:shadow-none",
                )}
              >
                <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#dbe8a3]">{card.title}</h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-white/85 md:text-[0.95rem]">{card.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-10 max-w-3xl text-sm font-light leading-relaxed text-white/75 md:text-base">{copy.performFootnote}</p>
        </div>
      </section>

      {/* How to choose the right area */}
      <section className={cn(CREAM, "py-16 md:py-24")} aria-label={copy.chooseAria}>
        <div className="container mx-auto max-w-6xl px-6 md:px-10">
          <h2 className="max-w-3xl font-serif text-2xl font-bold leading-tight tracking-[0.03em] text-[#0d4542] md:text-3xl lg:text-[2.25rem]">
            {copy.chooseTitleBefore}
            <em className="font-serif font-bold italic text-[#6a9c4c]">{copy.chooseTitleEm}</em>
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {copy.chooseColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d4542]">{col.title}</h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-[#1c1917]/88 md:text-[0.95rem]">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare & downloads */}
      <section className={cn(CREAM, "pb-20 pt-12 md:pb-24 md:pt-16")}>
        <div className="container mx-auto max-w-6xl px-6 md:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0d4542] md:text-xs">{copy.compareKicker}</h2>
              <p className="mt-5 text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">{copy.compareBody}</p>
            </div>
            <div className="-mt-[2cm] rounded-2xl border border-[#0d4542]/12 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(13,69,66,0.16)] md:p-6">
              <LocationGuideReportForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
