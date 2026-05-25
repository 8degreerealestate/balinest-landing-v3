import type { SiteLanguage } from "@/lib/site-language";

export type BuyerAgentCopy = {
  seoTitle: string;
  seoDescription: string;
  heroTitle: string; // multi-line with \n for line breaks
  introTitle: string;
  introParagraphs: string[];
  whoForTitle: string;
  whoFor: string[];
  stagesTitle: string;
  stagesIntro: string;
  stageCol: string;
  whatYouGetCol: string;
  stages: { stage: string; detail: string }[];
  compareTitle: string;
  compareFeature: string;
  compareBuyer: string;
  compareSeller: string;
  compareRows: { feature: string; buyer: string; seller: string }[];
  includedDetailTitle: string;
  includedDetail: { title: string; body: string }[];
  pricingTitle: string;
  pricingBullets: string[];
  ctaTitle: string;
  ctaSub1: string;
  ctaSub2: string;
  form: {
    firstName: string;
    lastName: string;
    email: string;
    emailPh: string;
    phone: string;
    timeline: string;
    timelinePh: string;
    budget: string;
    timelineNow: string;
    timeline3m: string;
    timeline6m: string;
    dialHint: string;
    dialHintIntl: string;
    submit: string;
    submitting: string;
    thankTitle: string;
    thankDesc: string;
    errorTitle: string;
    errorDesc: string;
  };
};

export const BUYER_AGENT_COPY: Record<SiteLanguage, BuyerAgentCopy> = {
  en: {
    seoTitle: "Buyer's Agent · 8 Degree Bali",
    seoDescription:
      "Full buyer representation in Bali: search, due diligence, negotiation, and closing—with your interests first.",
    heroTitle: "Your property.\nYour interests.\nFully represented.",
    introTitle: "Buying real estate in Bali?\nDon't go in blind.",
    introParagraphs: [
      "Bali's property market rewards informed buyers and punishes everyone else. Off-market deals close before they're ever listed. Zoning rules shift between sub-districts. Some developers deliver, others vanish.",
      "Our Buyer's Agent service is built for serious investors and lifestyle buyers who want expert guidance, insider access, and full legal protection from search to handover.",
      "Unlike traditional agents who represent the seller, we work exclusively for you — the buyer. No listing quotas. No developer kickbacks. No divided loyalty.",
      "From sourcing off-market opportunities to filtering out risky developers and inflated price tags, we make sure you buy on your terms — not someone else's.",
    ],
    whoForTitle: "Who is this for?",
    whoFor: [
      "International buyers investing in Bali for the first time.",
      "Expats relocating and looking for a long-term home.",
      "Entrepreneurs and digital nomads planning a base in paradise.",
    ],
    stagesTitle: "What's included",
    stagesIntro: "Our Buyer's Agent service is a complete start-to-finish representation package:",
    stageCol: "Stage",
    whatYouGetCol: "What You Get",
    stages: [
      { stage: "Discovery", detail: "Deep dive into your goals, budget, and timeline" },
      {
        stage: "Property Access",
        detail: "Curated listings + off-market options based on your criteria",
      },
      {
        stage: "Due Diligence",
        detail: "Legal and financial checks on developers, ownership structures, and licenses",
      },
      {
        stage: "Negotiation",
        detail: "We negotiate price and terms on your behalf — with no conflict of interest",
      },
      { stage: "Deal Structuring", detail: "Advice on Freehold, Leasehold, PMA, and Joint Ventures" },
      { stage: "Closing Support", detail: "We support the entire legal process through to handover" },
      {
        stage: "Post-Purchase Advisory",
        detail:
          "Access to our trusted ecosystem: visa agents, contractors, tax advisors, property managers",
      },
    ],
    compareTitle: "Difference: buyer agent vs sales agent",
    compareFeature: "Feature",
    compareBuyer: "Buyer's Agent",
    compareSeller: "Sales Agent",
    compareRows: [
      { feature: "Works for", buyer: "You (the buyer)", seller: "Seller or Developer" },
      {
        feature: "Gets paid by",
        buyer: "You (via service fee or commission share)",
        seller: "Developer or Property Owner",
      },
      {
        feature: "Focus",
        buyer: "Protecting your goals & interests",
        seller: "Selling the listed inventory",
      },
      {
        feature: "Access to properties",
        buyer: "Full market + off-market access",
        seller: "Limited to internal/exclusive listings",
      },
      {
        feature: "Legal advice",
        buyer: "Guides you through ownership structures",
        seller: "Often avoids this topic",
      },
      {
        feature: "Negotiation role",
        buyer: "Negotiates for you",
        seller: "May negotiate against you to protect the seller price",
      },
      { feature: "Loyalty", buyer: "100% to the buyer", seller: "100% to the listing" },
    ],
    includedDetailTitle: "What's included",
    includedDetail: [
      {
        title: "Discovery and Goal Alignment",
        body: "We start with a 1-on-1 call to understand your investment or lifestyle goals, preferred areas, timeline, and risk appetite.",
      },
      {
        title: "Property Sourcing",
        body: "We curate a list of vetted listings and off-market opportunities based on your brief — including developer direct options and hidden gems.",
      },
      {
        title: "Legal and Ownership Due Diligence",
        body: "We guide you on the right ownership model (Leasehold, Freehold, PMA, JV), and coordinate with trusted legal partners to verify every deal.",
      },
      {
        title: "Negotiation Support",
        body: "We negotiate on your behalf — aiming for price drops, better payment terms, and smart deal structure. All developer discounts go to you.",
      },
      {
        title: "Deal Structuring",
        body: "We advise on the safest structure for you: asset protection, long-term hold, or fast resale potential.",
      },
      {
        title: "Closing and Post-Sale Support",
        body: "We walk you through closing, handover, and optional services: property management, renovations, taxation, and relocation.",
      },
    ],
    pricingTitle: "Pricing & terms",
    pricingBullets: [
      "Engagement is agreed in writing before we act on your behalf.",
      "Typical structures include a retainer plus success fee, or a flat advisory package—tailored to search intensity.",
      "We do not take hidden commissions from developers; conflicts are disclosed up front.",
      "Travel and third-party costs (surveys, legal) are passed through at cost unless bundled in your agreement.",
    ],
    ctaTitle: "We don't upsell.\nWe don't sugarcoat.",
    ctaSub1: "We only recommend what we'd buy ourselves.",
    ctaSub2:
      "If that sounds like the level of representation you want in Bali, start with a short brief—we'll tell you honestly whether we are the right fit.",
    form: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email address",
      emailPh: "Enter your email",
      phone: "Phone number",
      timeline: "Investment timeline range",
      timelinePh: "Select timeline",
      budget: "Budget Range",
      timelineNow: "Now",
      timeline3m: "Next 3 Months",
      timeline6m: "Next 6 Months",
      dialHint: "Dial code is included — enter your number without the leading 0.",
      dialHintIntl: "Include country code in full international format (e.g. +1…).",
      submit: "Submit",
      submitting: "Sending…",
      thankTitle: "Thank you",
      thankDesc: "We will be in touch shortly.",
      errorTitle: "Something went wrong",
      errorDesc: "Please try again.",
    },
  },
  id: {
    seoTitle: "Agen Pembeli · 8 Degree Bali",
    seoDescription:
      "Representasi penuh untuk pembeli di Bali: pencarian, due diligence, negosiasi, dan penutupan—dengan kepentingan Anda diutamakan.",
    heroTitle: "Properti Anda.\nKepentingan Anda.\nTerwakili sepenuhnya.",
    introTitle: "Membeli properti di Bali?\nJangan masuk tanpa persiapan.",
    introParagraphs: [
      "Pasar properti Bali memberi imbalan bagi pembeli yang terinformasi dan menghukum yang lain. Deal off-market sering tertutup sebelum pernah terdaftar. Aturan zonasi berbeda antar sub-distrik. Beberapa developer menepati janji, yang lain menghilang.",
      "Layanan Agen Pembeli kami dirancang untuk investor serius dan pembeli gaya hidup yang menginginkan panduan ahli, akses insider, dan perlindungan hukum penuh dari pencarian hingga serah terima.",
      "Berbeda dengan agen tradisional yang mewakili penjual, kami bekerja eksklusif untuk Anda — pembeli. Tanpa kuota listing. Tanpa kickback developer. Tanpa loyalitas terbagi.",
      "Dari mencari peluang off-market hingga menyaring developer berisiko dan harga yang menggelembung, kami memastikan Anda membeli dengan syarat Anda — bukan milik orang lain.",
    ],
    whoForTitle: "Untuk siapa ini?",
    whoFor: [
      "Pembeli internasional yang berinvestasi di Bali untuk pertama kali.",
      "Ekspatriat yang relokasi dan mencari rumah jangka panjang.",
      "Pengusaha dan digital nomad yang merencanakan basis di surga.",
    ],
    stagesTitle: "Apa yang termasuk",
    stagesIntro: "Layanan Agen Pembeli kami adalah paket representasi lengkap dari awal hingga akhir:",
    stageCol: "Tahap",
    whatYouGetCol: "Yang Anda Dapatkan",
    stages: [
      { stage: "Discovery", detail: "Pendalaman tujuan, anggaran, dan timeline Anda" },
      {
        stage: "Akses Properti",
        detail: "Listing terkurasi + opsi off-market sesuai kriteria Anda",
      },
      {
        stage: "Due Diligence",
        detail: "Pemeriksaan legal dan finansial pada developer, struktur kepemilikan, dan izin",
      },
      {
        stage: "Negosiasi",
        detail: "Kami menegosiasikan harga dan syarat atas nama Anda — tanpa konflik kepentingan",
      },
      {
        stage: "Struktur Deal",
        detail: "Saran tentang Freehold, Leasehold, PMA, dan Joint Venture",
      },
      {
        stage: "Dukungan Penutupan",
        detail: "Kami mendukung seluruh proses legal hingga serah terima",
      },
      {
        stage: "Advisory Pasca-Beli",
        detail:
          "Akses ke ekosistem tepercaya kami: agen visa, kontraktor, konsultan pajak, manajer properti",
      },
    ],
    compareTitle: "Perbedaan: agen pembeli vs agen penjualan",
    compareFeature: "Aspek",
    compareBuyer: "Agen Pembeli",
    compareSeller: "Agen Penjualan",
    compareRows: [
      { feature: "Bekerja untuk", buyer: "Anda (pembeli)", seller: "Penjual atau Developer" },
      {
        feature: "Dibayar oleh",
        buyer: "Anda (biaya layanan atau bagi hasil komisi)",
        seller: "Developer atau Pemilik Properti",
      },
      {
        feature: "Fokus",
        buyer: "Melindungi tujuan & kepentingan Anda",
        seller: "Menjual inventori yang terdaftar",
      },
      {
        feature: "Akses properti",
        buyer: "Pasar penuh + akses off-market",
        seller: "Terbatas pada listing internal/eksklusif",
      },
      {
        feature: "Saran hukum",
        buyer: "Memandu struktur kepemilikan",
        seller: "Sering menghindari topik ini",
      },
      {
        feature: "Peran negosiasi",
        buyer: "Bernegosiasi untuk Anda",
        seller: "Dapat menegosiasi melawan Anda untuk melindungi harga penjual",
      },
      { feature: "Loyalitas", buyer: "100% kepada pembeli", seller: "100% kepada listing" },
    ],
    includedDetailTitle: "Apa yang termasuk",
    includedDetail: [
      {
        title: "Discovery dan Penyelarasan Tujuan",
        body: "Kami mulai dengan panggilan 1-on-1 untuk memahami tujuan investasi atau gaya hidup, area pilihan, timeline, dan selera risiko Anda.",
      },
      {
        title: "Sourcing Properti",
        body: "Kami menyusun daftar listing terverifikasi dan peluang off-market sesuai brief Anda — termasuk opsi langsung developer dan permata tersembunyi.",
      },
      {
        title: "Due Diligence Legal dan Kepemilikan",
        body: "Kami memandu model kepemilikan yang tepat (Leasehold, Freehold, PMA, JV), dan berkoordinasi dengan mitra hukum tepercaya untuk memverifikasi setiap deal.",
      },
      {
        title: "Dukungan Negosiasi",
        body: "Kami menegosiasikan atas nama Anda — mengejar penurunan harga, syarat pembayaran lebih baik, dan struktur deal cerdas. Semua diskon developer untuk Anda.",
      },
      {
        title: "Struktur Deal",
        body: "Kami menasihati struktur teraman: perlindungan aset, hold jangka panjang, atau potensi jual cepat.",
      },
      {
        title: "Penutupan dan Dukungan Pasca-Jual",
        body: "Kami memandu penutupan, serah terima, dan layanan opsional: manajemen properti, renovasi, perpajakan, dan relokasi.",
      },
    ],
    pricingTitle: "Harga & ketentuan",
    pricingBullets: [
      "Keterlibatan disepakati secara tertulis sebelum kami bertindak atas nama Anda.",
      "Struktur umum meliputi retainer plus success fee, atau paket advisory flat—disesuaikan intensitas pencarian.",
      "Kami tidak menerima komisi tersembunyi dari developer; konflik diungkapkan di awal.",
      "Biaya perjalanan dan pihak ketiga (survei, legal) ditagihkan sesuai biaya kecuali dibundel dalam perjanjian Anda.",
    ],
    ctaTitle: "Kami tidak upsell.\nKami tidak memanis-manis.",
    ctaSub1: "Kami hanya merekomendasikan apa yang akan kami beli sendiri.",
    ctaSub2:
      "Jika itu tingkat representasi yang Anda inginkan di Bali, mulai dengan brief singkat—kami akan jujur apakah kami cocok untuk Anda.",
    form: {
      firstName: "Nama depan",
      lastName: "Nama belakang",
      email: "Alamat email",
      emailPh: "Masukkan email Anda",
      phone: "Nomor telepon",
      timeline: "Rentang timeline investasi",
      timelinePh: "Pilih timeline",
      budget: "Rentang anggaran",
      timelineNow: "Sekarang",
      timeline3m: "3 Bulan ke Depan",
      timeline6m: "6 Bulan ke Depan",
      dialHint: "Kode negara sudah disertakan — masukkan nomor tanpa angka 0 di depan.",
      dialHintIntl: "Sertakan kode negara dalam format internasional penuh (mis. +62…).",
      submit: "Kirim",
      submitting: "Mengirim…",
      thankTitle: "Terima kasih",
      thankDesc: "Kami akan segera menghubungi Anda.",
      errorTitle: "Terjadi kesalahan",
      errorDesc: "Silakan coba lagi.",
    },
  },
  fr: {
    seoTitle: "Agent acheteur · 8 Degree Bali",
    seoDescription:
      "Representation complete de l'acheteur a Bali: recherche, due diligence, negociation et cloture—vos interets en premier.",
    heroTitle: "Votre bien.\nVos interets.\nEntierement representes.",
    introTitle: "Acheter un bien a Bali ?\nN'y allez pas a l'aveugle.",
    introParagraphs: [
      "Le marche balinais recompense les acheteurs informes et penalise les autres. Les offres off-market se concluent avant toute annonce. Les regles de zonage varient selon les sous-districts. Certains promoteurs livrent, d'autres disparaissent.",
      "Notre service Agent acheteur s'adresse aux investisseurs serieux et aux acheteurs lifestyle qui veulent un accompagnement expert, un acces privilegie et une protection juridique complete de la recherche a la remise des cles.",
      "Contrairement aux agents traditionnels qui representent le vendeur, nous travaillons exclusivement pour vous — l'acheteur. Pas de quotas de mandats. Pas de commissions cachees des promoteurs. Pas de loyaute partagee.",
      "De la recherche d'opportunites off-market au filtrage des promoteurs risques et des prix gonfles, nous veillons a ce que vous achetiez selon vos conditions — pas celles d'un autre.",
    ],
    whoForTitle: "Pour qui est-ce ?",
    whoFor: [
      "Acheteurs internationaux investissant a Bali pour la premiere fois.",
      "Expatries en relocation cherchant une residence de longue duree.",
      "Entrepreneurs et nomades digitaux planifiant une base au paradis.",
    ],
    stagesTitle: "Ce qui est inclus",
    stagesIntro:
      "Notre service Agent acheteur est un accompagnement complet de bout en bout :",
    stageCol: "Etape",
    whatYouGetCol: "Ce que vous obtenez",
    stages: [
      { stage: "Discovery", detail: "Analyse approfondie de vos objectifs, budget et calendrier" },
      {
        stage: "Acces aux biens",
        detail: "Annonces selectionnees + options off-market selon vos criteres",
      },
      {
        stage: "Due diligence",
        detail:
          "Verifications juridiques et financieres sur promoteurs, structures de propriete et permis",
      },
      {
        stage: "Negociation",
        detail: "Nous negocions prix et conditions en votre nom — sans conflit d'interets",
      },
      {
        stage: "Structuration du deal",
        detail: "Conseils sur Freehold, Leasehold, PMA et coentreprises",
      },
      {
        stage: "Accompagnement a la cloture",
        detail: "Nous soutenons tout le processus juridique jusqu'a la remise des cles",
      },
      {
        stage: "Conseil post-achat",
        detail:
          "Acces a notre ecosysteme de confiance : agents visa, entrepreneurs, fiscalistes, gestionnaires",
      },
    ],
    compareTitle: "Difference : agent acheteur vs agent commercial",
    compareFeature: "Critere",
    compareBuyer: "Agent acheteur",
    compareSeller: "Agent commercial",
    compareRows: [
      { feature: "Travaille pour", buyer: "Vous (l'acheteur)", seller: "Vendeur ou promoteur" },
      {
        feature: "Remunere par",
        buyer: "Vous (honoraires ou partage de commission)",
        seller: "Promoteur ou proprietaire",
      },
      {
        feature: "Priorite",
        buyer: "Proteger vos objectifs et interets",
        seller: "Vendre le stock mandate",
      },
      {
        feature: "Acces aux biens",
        buyer: "Marche complet + off-market",
        seller: "Limite aux mandats internes/exclusifs",
      },
      {
        feature: "Conseil juridique",
        buyer: "Vous guide sur les structures de propriete",
        seller: "Evite souvent ce sujet",
      },
      {
        feature: "Role en negociation",
        buyer: "Negocie pour vous",
        seller: "Peut negocier contre vous pour proteger le prix vendeur",
      },
      { feature: "Loyaute", buyer: "100 % a l'acheteur", seller: "100 % au mandat" },
    ],
    includedDetailTitle: "Ce qui est inclus",
    includedDetail: [
      {
        title: "Discovery et alignement des objectifs",
        body: "Nous commencons par un appel individuel pour comprendre vos objectifs d'investissement ou de lifestyle, zones preferees, calendrier et appetit au risque.",
      },
      {
        title: "Sourcing immobilier",
        body: "Nous selectionnons des annonces verifiees et des opportunites off-market selon votre brief — y compris acces direct promoteur et perles rares.",
      },
      {
        title: "Due diligence juridique et propriete",
        body: "Nous vous orientons sur le bon modele de propriete (Leasehold, Freehold, PMA, JV) et coordonnons avec des partenaires juridiques de confiance.",
      },
      {
        title: "Support negociation",
        body: "Nous negocions en votre nom — baisses de prix, meilleures conditions de paiement et structure intelligente. Toutes les remises promoteur vous reviennent.",
      },
      {
        title: "Structuration du deal",
        body: "Nous conseillons la structure la plus sure : protection d'actifs, detention long terme ou revente rapide.",
      },
      {
        title: "Cloture et suivi post-vente",
        body: "Nous vous accompagnons jusqu'a la remise des cles et services optionnels : gestion, renovations, fiscalite et relocation.",
      },
    ],
    pricingTitle: "Tarifs et conditions",
    pricingBullets: [
      "L'engagement est formalise par ecrit avant toute action en votre nom.",
      "Structures courantes : acompte + success fee, ou forfait conseil — adapte a l'intensite de recherche.",
      "Pas de commissions cachees des promoteurs ; les conflits sont divulgues des le depart.",
      "Frais de deplacement et tiers (expertises, juridique) refactures au cout reel sauf forfait convenu.",
    ],
    ctaTitle: "Nous ne sur-vendons pas.\nNous ne edulcorons pas.",
    ctaSub1: "Nous ne recommandons que ce que nous acheterions nous-memes.",
    ctaSub2:
      "Si c'est le niveau de representation que vous voulez a Bali, commencez par un brief court — nous vous dirons honnetement si nous sommes le bon partenaire.",
    form: {
      firstName: "Prenom",
      lastName: "Nom",
      email: "Adresse e-mail",
      emailPh: "Saisissez votre e-mail",
      phone: "Telephone",
      timeline: "Horizon d'investissement",
      timelinePh: "Selectionner un horizon",
      budget: "Fourchette de budget",
      timelineNow: "Maintenant",
      timeline3m: "Dans les 3 prochains mois",
      timeline6m: "Dans les 6 prochains mois",
      dialHint:
        "L'indicatif est inclus — saisissez votre numero sans le 0 initial.",
      dialHintIntl: "Incluez l'indicatif pays au format international complet (ex. +33…).",
      submit: "Envoyer",
      submitting: "Envoi…",
      thankTitle: "Merci",
      thankDesc: "Nous vous recontacterons tres bientot.",
      errorTitle: "Une erreur s'est produite",
      errorDesc: "Veuillez reessayer.",
    },
  },
  zh: {
    seoTitle: "买方顾问 · 8 Degree Bali",
    seoDescription: "巴厘岛全程买方代表：搜索、尽职调查、谈判与交割——始终将您的利益放在首位。",
    heroTitle: "您的房产。\n您的利益。\n全程代表。",
    introTitle: "在巴厘岛买房？\n别盲目入场。",
    introParagraphs: [
      "巴厘岛房产市场奖励有准备的买家，惩罚其余所有人。场外交易常在挂牌前就已成交。分区规则因街道而异。有的开发商兑现承诺，有的则消失无踪。",
      "我们的买方顾问服务面向认真投资者与生活方式买家，提供专家指导、内部渠道及从看房到交钥匙的完整法律保护。",
      "不同于代表卖方的传统中介，我们仅为买方服务。无挂牌配额。无开发商回扣。无分裂的忠诚。",
      "从挖掘场外机会到筛除高风险开发商与虚高标价，我们确保您按自己的条件购买——而非他人的条件。",
    ],
    whoForTitle: "适合谁？",
    whoFor: [
      "首次在巴厘岛投资的国际买家。",
      "搬迁定居、寻找长期居所的外籍人士。",
      "计划在天堂建立基地的企业家与数字游民。",
    ],
    stagesTitle: "服务内容",
    stagesIntro: "我们的买方顾问服务是完整的全程代表套餐：",
    stageCol: "阶段",
    whatYouGetCol: "您将获得",
    stages: [
      { stage: "需求发现", detail: "深入了解您的目标、预算与时间线" },
      { stage: "房源获取", detail: "根据您的标准精选挂牌 + 场外房源" },
      {
        stage: "尽职调查",
        detail: "对开发商、产权结构与许可证进行法律与财务核查",
      },
      { stage: "谈判", detail: "代表您谈判价格与条款——无利益冲突" },
      { stage: "交易结构", detail: "关于永久产权、租赁产权、PMA 与合资的建议" },
      { stage: "交割支持", detail: "全程支持法律流程直至交房" },
      {
        stage: "购后顾问",
        detail: "接入可信生态：签证代理、承包商、税务顾问、物业管理",
      },
    ],
    compareTitle: "区别：买方顾问 vs 销售代理",
    compareFeature: "对比项",
    compareBuyer: "买方顾问",
    compareSeller: "销售代理",
    compareRows: [
      { feature: "代表对象", buyer: "您（买方）", seller: "卖方或开发商" },
      {
        feature: "收费来源",
        buyer: "您（服务费或佣金分成）",
        seller: "开发商或业主",
      },
      { feature: "关注点", buyer: "保护您的目标与利益", seller: "出售挂牌库存" },
      {
        feature: "房源渠道",
        buyer: "全市场 + 场外渠道",
        seller: "限于内部/独家挂牌",
      },
      { feature: "法律建议", buyer: "指导产权结构选择", seller: "常回避此话题" },
      {
        feature: "谈判角色",
        buyer: "为您谈判",
        seller: "可能为保卖方价格而与您对立场",
      },
      { feature: "忠诚度", buyer: "100% 站在买方", seller: "100% 站在挂牌" },
    ],
    includedDetailTitle: "服务内容",
    includedDetail: [
      {
        title: "需求发现与目标对齐",
        body: "以一对一通话开始，了解您的投资或生活方式目标、偏好区域、时间线与风险偏好。",
      },
      {
        title: "房源甄选",
        body: "根据您的 brief 精选已核实挂牌与场外机会——含开发商直签与隐藏优质标的。",
      },
      {
        title: "法律与产权尽职调查",
        body: "指导合适的持有模式（租赁、永久产权、PMA、合资），并协调可信法律伙伴核实每笔交易。",
      },
      {
        title: "谈判支持",
        body: "代表您谈判——争取降价、更优付款条件与合理结构。开发商折扣全部归您。",
      },
      {
        title: "交易结构",
        body: "建议最稳妥的结构：资产保护、长期持有或快速转售潜力。",
      },
      {
        title: "交割与售后支持",
        body: "陪同交割、交房及可选服务：物业管理、装修、税务与搬迁。",
      },
    ],
    pricingTitle: "价格与条款",
    pricingBullets: [
      "代表您行事前，双方以书面形式确认合作。",
      "常见结构包括预付金加成功费，或按搜索强度定制的固定顾问套餐。",
      "我们不收取开发商隐性佣金；利益冲突 upfront 披露。",
      "差旅与第三方费用（测绘、法律）按成本实报，除非协议中已打包。",
    ],
    ctaTitle: "我们不推销。\n我们不粉饰。",
    ctaSub1: "我们只推荐自己会买的项目。",
    ctaSub2:
      "若这正是您在巴厘岛想要的代表水准，请先发一份简短需求——我们会如实告知是否合适。",
    form: {
      firstName: "名",
      lastName: "姓",
      email: "电子邮箱",
      emailPh: "请输入邮箱",
      phone: "电话号码",
      timeline: "投资时间范围",
      timelinePh: "选择时间范围",
      budget: "预算范围",
      timelineNow: "现在",
      timeline3m: "未来 3 个月内",
      timeline6m: "未来 6 个月内",
      dialHint: "已含国家区号——请输入号码，勿加前导 0。",
      dialHintIntl: "请使用完整国际格式含国家区号（如 +86…）。",
      submit: "提交",
      submitting: "发送中…",
      thankTitle: "感谢提交",
      thankDesc: "我们会尽快与您联系。",
      errorTitle: "出错了",
      errorDesc: "请重试。",
    },
  },
  tr: {
    seoTitle: "Alıcı danışmanı · 8 Degree Bali",
    seoDescription:
      "Bali'de tam alıcı temsili: arama, due diligence, müzakere ve kapanış—öncelik sizin çıkarınızda.",
    heroTitle: "Mülkünüz.\nÇıkarınız.\nTam temsil.",
    introTitle: "Bali'de gayrimenkul mü alıyorsunuz?\nKörü körüne girmeyin.",
    introParagraphs: [
      "Bali emlak piyasası bilgili alıcıları ödüllendirir, diğerlerini cezalandırır. Off-market fırsatlar ilana çıkmadan kapanır. İmar kuralları alt bölgelere göre değişir. Bazı geliştiriciler teslim eder, bazıları kaybolur.",
      "Alıcı Danışmanı hizmetimiz, aramadan teslime uzman rehberlik, içeriden erişim ve tam hukuki koruma isteyen ciddi yatırımcılar ve yaşam tarzı alıcıları içindir.",
      "Satıcıyı temsil eden geleneksel acentelerin aksine, yalnızca sizin — alıcının — için çalışırız. Liste kotası yok. Geliştiriciden gizli komisyon yok. Bölünmüş sadakat yok.",
      "Off-market fırsat bulmaktan riskli geliştiricileri ve şişirilmiş fiyatları elemeye kadar, başkasının değil sizin şartlarınızla almanızı sağlarız.",
    ],
    whoForTitle: "Kimler için?",
    whoFor: [
      "Bali'ye ilk kez yatırım yapan uluslararası alıcılar.",
      "Taşınan ve uzun vadeli ev arayan expat'ler.",
      "Cennette üs kurmayı planlayan girişimciler ve dijital göçebeler.",
    ],
    stagesTitle: "Neler dahil",
    stagesIntro: "Alıcı Danışmanı hizmetimiz baştan sona tam temsil paketidir:",
    stageCol: "Aşama",
    whatYouGetCol: "Ne alırsınız",
    stages: [
      { stage: "Keşif", detail: "Hedefleriniz, bütçeniz ve zaman çizelgenize derinlemesine bakış" },
      {
        stage: "Mülk erişimi",
        detail: "Kriterlerinize göre seçilmiş ilanlar + off-market seçenekler",
      },
      {
        stage: "Due diligence",
        detail: "Geliştirici, mülkiyet yapıları ve lisanslarda hukuki ve mali kontroller",
      },
      {
        stage: "Müzakere",
        detail: "Çıkar çatışması olmadan sizin adınıza fiyat ve şart müzakeresi",
      },
      {
        stage: "Anlaşma yapısı",
        detail: "Freehold, Leasehold, PMA ve ortak girişimler hakkında danışmanlık",
      },
      {
        stage: "Kapanış desteği",
        detail: "Teslime kadar tüm hukuki süreçte destek",
      },
      {
        stage: "Satın sonrası danışmanlık",
        detail:
          "Güvenilir ekosistem: vize acenteleri, müteahhitler, vergi danışmanları, mülk yöneticileri",
      },
    ],
    compareTitle: "Fark: alıcı danışmanı vs satış acentesi",
    compareFeature: "Özellik",
    compareBuyer: "Alıcı danışmanı",
    compareSeller: "Satış acentesi",
    compareRows: [
      { feature: "Kimin için çalışır", buyer: "Siz (alıcı)", seller: "Satıcı veya geliştirici" },
      {
        feature: "Kim öder",
        buyer: "Siz (hizmet ücreti veya komisyon payı)",
        seller: "Geliştirici veya mülk sahibi",
      },
      {
        feature: "Odak",
        buyer: "Hedeflerinizi ve çıkarlarınızı korumak",
        seller: "Listelenen envanteri satmak",
      },
      {
        feature: "Mülke erişim",
        buyer: "Tam pazar + off-market",
        seller: "Dahili/özel listelerle sınırlı",
      },
      {
        feature: "Hukuki danışmanlık",
        buyer: "Mülkiyet yapılarında rehberlik",
        seller: "Genelde bu konudan kaçınır",
      },
      {
        feature: "Müzakere rolü",
        buyer: "Sizin için müzakere eder",
        seller: "Satıcı fiyatını korumak için size karşı müzakere edebilir",
      },
      { feature: "Sadakat", buyer: "%100 alıcıya", seller: "%100 listeye" },
    ],
    includedDetailTitle: "Neler dahil",
    includedDetail: [
      {
        title: "Keşif ve hedef uyumu",
        body: "Yatırım veya yaşam tarzı hedeflerinizi, tercih ettiğiniz bölgeleri, zaman çizelgenizi ve risk iştahınızı anlamak için bire bir görüşmeyle başlarız.",
      },
      {
        title: "Mülk tedariki",
        body: "Brief'inize göre doğrulanmış ilanlar ve off-market fırsatlar — geliştirici doğrudan seçenekler ve gizli cevherler dahil.",
      },
      {
        title: "Hukuki ve mülkiyet due diligence",
        body: "Doğru mülkiyet modelinde (Leasehold, Freehold, PMA, JV) rehberlik ve her anlaşmayı doğrulamak için güvenilir hukuk ortaklarıyla koordinasyon.",
      },
      {
        title: "Müzakere desteği",
        body: "Sizin adınıza müzakere — fiyat düşüşü, daha iyi ödeme şartları ve akıllı yapı. Tüm geliştirici indirimleri size kalır.",
      },
      {
        title: "Anlaşma yapısı",
        body: "Sizin için en güvenli yapı: varlık koruması, uzun vadeli tutma veya hızlı yeniden satış potansiyeli.",
      },
      {
        title: "Kapanış ve satış sonrası destek",
        body: "Kapanış, teslim ve isteğe bağlı hizmetler: mülk yönetimi, renovasyon, vergilendirme ve taşınma.",
      },
    ],
    pricingTitle: "Fiyatlandırma ve şartlar",
    pricingBullets: [
      "Sizin adınıza hareket etmeden önce yazılı anlaşma yapılır.",
      "Tipik yapılar avans artı başarı ücreti veya arama yoğunluğuna göre sabit danışmanlık paketidir.",
      "Geliştiricilerden gizli komisyon almayız; çıkar çatışmaları baştan açıklanır.",
      "Seyahat ve üçüncü taraf maliyetleri (ölçüm, hukuk) anlaşmada paketlenmedikçe maliyet üzerinden yansıtılır.",
    ],
    ctaTitle: "Ek satış yapmıyoruz.\nGerçeği yumuşatmıyoruz.",
    ctaSub1: "Yalnızca kendimizin alacağını öneririz.",
    ctaSub2:
      "Bali'de istediğiniz temsil düzeyi buysa, kısa bir brief ile başlayın—uygun olup olmadığımızı dürüstçe söyleriz.",
    form: {
      firstName: "Ad",
      lastName: "Soyad",
      email: "E-posta adresi",
      emailPh: "E-postanızı girin",
      phone: "Telefon numarası",
      timeline: "Yatırım zaman aralığı",
      timelinePh: "Zaman aralığı seçin",
      budget: "Bütçe aralığı",
      timelineNow: "Şimdi",
      timeline3m: "Önümüzdeki 3 ay",
      timeline6m: "Önümüzdeki 6 ay",
      dialHint: "Alan kodu dahildir — baştaki 0 olmadan numaranızı girin.",
      dialHintIntl: "Tam uluslararası formatta ülke kodu ekleyin (ör. +90…).",
      submit: "Gönder",
      submitting: "Gönderiliyor…",
      thankTitle: "Teşekkürler",
      thankDesc: "Kısa süre içinde sizinle iletişime geçeceğiz.",
      errorTitle: "Bir şeyler ters gitti",
      errorDesc: "Lütfen tekrar deneyin.",
    },
  },
};
