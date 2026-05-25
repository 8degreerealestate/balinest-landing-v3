import type { SiteLanguage } from "@/lib/site-language";

export type SellerAgentCopy = {
  seoTitle: string;
  seoDescription: string;
  heroLine1: string;
  heroLine2: string;
  heroSub: string;
  intro: string;
  pillars: { title: string; body: string }[];
  applyLabel: string;
  applyTitle: string;
  applySub: string;
  form: {
    fullName: string;
    fullNamePh: string;
    country: string;
    countryPh: string;
    email: string;
    emailPh: string;
    phone: string;
    propertyType: string;
    propertyCategory: string;
    permitsQ: string;
    webSocial: string;
    webSocialPh: string;
    message: string;
    messagePh: string;
    consent: string;
    submit: string;
    submitting: string;
    villa: string;
    apartment: string;
    land: string;
    leasehold: string;
    freehold: string;
    permitsYes: string;
    permitsInProcess: string;
    permitsNo: string;
  };
};

export const SELLER_AGENT_COPY: Record<SiteLanguage, SellerAgentCopy> = {
  en: {
    seoTitle: "Seller's Agent · 8 Degree Bali",
    seoDescription:
      "Master agency partnership for selected developers in Bali: transparency, qualified buyers, and targeted marketing.",
    heroLine1: "Exclusive representation.",
    heroLine2: "By invitation.",
    heroSub: "Strategic sales partnership for developers building Bali's next generation of quality projects.",
    intro:
      "We don't just list properties — we represent them. We work exclusively with selected developers who share our values of transparency, quality, and long-term vision. We only promote what we'd buy ourselves. Every project we take on is carefully vetted for legal clarity, build quality, and investor value. If it's not something we'd stand behind — we don't sell it. If you're building something exceptional, let's talk. Apply below to explore a potential partnership.",
    pillars: [
      {
        title: "Transparency",
        body: "Benefit from our deep knowledge of Bali's real estate market, ensuring that your property is marketed effectively and reaches the right buyers.",
      },
      {
        title: "Qualified buyers",
        body: "We connect you with serious buyers who align with Bali's sustainable and respectful development values.",
      },
      {
        title: "Targeted marketing",
        body: "From strategic campaigns to premium visuals, we showcase your property to attract the right buyers.",
      },
    ],
    applyLabel: "Partnership application",
    applyTitle: "Start the conversation",
    applySub:
      "Tell us about your project. If there's strategic alignment, our team will follow up to discuss representation.",
    form: {
      fullName: "Full name",
      fullNamePh: "Your full name",
      country: "Country",
      countryPh: "Where you are based",
      email: "Email",
      emailPh: "you@company.com",
      phone: "Phone number",
      propertyType: "Property type",
      propertyCategory: "Property category",
      permitsQ: "Do you have IMB/PBG and all legal permits?",
      webSocial: "Website / Instagram (if available)",
      webSocialPh: "https://… or @handle",
      message: "Message",
      messagePh:
        "Tell us about your project, timeline, and what you are looking for in a master-agency partnership.",
      consent:
        "By submitting, you agree we may contact you about this enquiry. We do not share your details with third parties for marketing.",
      submit: "Submit",
      submitting: "Submitting…",
      villa: "Villa",
      apartment: "Apartment",
      land: "Land",
      leasehold: "Leasehold",
      freehold: "Freehold",
      permitsYes: "Yes",
      permitsInProcess: "In process",
      permitsNo: "No",
    },
  },
  id: {
    seoTitle: "Agen Penjual · 8 Degree Bali",
    seoDescription:
      "Kemitraan master agency untuk developer terpilih di Bali: transparansi, pembeli berkualitas, dan pemasaran terarah.",
    heroLine1: "Representasi eksklusif.",
    heroLine2: "Dengan undangan.",
    heroSub: "Kemitraan penjualan strategis untuk developer yang membangun proyek berkualitas generasi berikutnya di Bali.",
    intro:
      "Kami tidak sekadar memasarkan properti — kami merepresentasikannya. Kami bekerja eksklusif dengan developer terpilih yang berbagi nilai transparansi, kualitas, dan visi jangka panjang. Kami hanya mempromosikan apa yang akan kami beli sendiri. Setiap proyek diverifikasi untuk kejelasan legal, kualitas bangunan, dan nilai investor. Jika Anda membangun sesuatu yang luar biasa, mari berbicara. Ajukan di bawah untuk mengeksplorasi kemitraan.",
    pillars: [
      {
        title: "Transparansi",
        body: "Manfaatkan pengetahuan mendalam kami tentang pasar properti Bali agar properti Anda dipasarkan efektif dan menjangkau pembeli yang tepat.",
      },
      {
        title: "Pembeli berkualitas",
        body: "Kami menghubungkan Anda dengan pembeli serius yang selaras dengan nilai pembangunan Bali yang berkelanjutan.",
      },
      {
        title: "Pemasaran terarah",
        body: "Dari kampanye strategis hingga visual premium, kami menampilkan properti Anda kepada pembeli yang tepat.",
      },
    ],
    applyLabel: "Aplikasi kemitraan",
    applyTitle: "Mulai percakapan",
    applySub:
      "Ceritakan proyek Anda. Jika ada keselarasan strategis, tim kami akan menghubungi untuk membahas representasi.",
    form: {
      fullName: "Nama lengkap",
      fullNamePh: "Nama lengkap Anda",
      country: "Negara",
      countryPh: "Lokasi Anda berbasis",
      email: "Email",
      emailPh: "anda@perusahaan.com",
      phone: "Nomor telepon",
      propertyType: "Tipe properti",
      propertyCategory: "Kategori properti",
      permitsQ: "Apakah Anda memiliki IMB/PBG dan izin legal?",
      webSocial: "Website / Instagram (jika ada)",
      webSocialPh: "https://… atau @akun",
      message: "Pesan",
      messagePh: "Ceritakan proyek, timeline, dan harapan kemitraan master agency.",
      consent:
        "Dengan mengirim, Anda setuju kami dapat menghubungi terkait permintaan ini. Kami tidak membagikan data Anda untuk marketing pihak ketiga.",
      submit: "Kirim",
      submitting: "Mengirim…",
      villa: "Villa",
      apartment: "Apartemen",
      land: "Tanah",
      leasehold: "Leasehold",
      freehold: "Freehold",
      permitsYes: "Ya",
      permitsInProcess: "Dalam proses",
      permitsNo: "Tidak",
    },
  },
  fr: {
    seoTitle: "Agent vendeur · 8 Degree Bali",
    seoDescription:
      "Partenariat master agency pour promoteurs selectionnes a Bali: transparence, acheteurs qualifies et marketing cible.",
    heroLine1: "Representation exclusive.",
    heroLine2: "Sur invitation.",
    heroSub:
      "Partenariat commercial strategique pour les promoteurs qui construisent la prochaine generation de projets de qualite a Bali.",
    intro:
      "Nous ne nous contentons pas de lister — nous representons. Nous travaillons exclusivement avec des promoteurs selectionnes partageant transparence, qualite et vision long terme. Nous ne promouvons que ce que nous acheterions. Chaque projet est verifie pour clarte legale, qualite de construction et valeur investisseur. Si vous construisez quelque chose d'exceptionnel, parlons-en. Postulez ci-dessous.",
    pillars: [
      {
        title: "Transparence",
        body: "Profitez de notre connaissance approfondie du marche balinais pour un marketing efficace vers les bons acheteurs.",
      },
      {
        title: "Acheteurs qualifies",
        body: "Nous vous mettons en relation avec des acheteurs serieux alignes sur des valeurs de developpement durable.",
      },
      {
        title: "Marketing cible",
        body: "Campagnes strategiques et visuels premium pour attirer les bons acheteurs.",
      },
    ],
    applyLabel: "Candidature partenariat",
    applyTitle: "Commencer la conversation",
    applySub:
      "Parlez-nous de votre projet. En cas d'alignement strategique, notre equipe vous recontactera.",
    form: {
      fullName: "Nom complet",
      fullNamePh: "Votre nom complet",
      country: "Pays",
      countryPh: "Ou vous etes base",
      email: "E-mail",
      emailPh: "vous@societe.com",
      phone: "Telephone",
      propertyType: "Type de bien",
      propertyCategory: "Categorie",
      permitsQ: "Disposez-vous des permis IMB/PBG et autorisations?",
      webSocial: "Site / Instagram (si disponible)",
      webSocialPh: "https://… ou @compte",
      message: "Message",
      messagePh: "Decrivez votre projet, calendrier et attentes de partenariat.",
      consent:
        "En envoyant, vous acceptez d'etre contacte. Nous ne partageons pas vos donnees a des fins marketing tierces.",
      submit: "Envoyer",
      submitting: "Envoi…",
      villa: "Villa",
      apartment: "Appartement",
      land: "Terrain",
      leasehold: "Bail",
      freehold: "Pleine propriete",
      permitsYes: "Oui",
      permitsInProcess: "En cours",
      permitsNo: "Non",
    },
  },
  zh: {
    seoTitle: "卖方顾问 · 8 Degree Bali",
    seoDescription: "为巴厘岛精选开发商提供主代理合作：透明、优质买家与精准营销。",
    heroLine1: "独家代理。",
    heroLine2: "受邀合作。",
    heroSub: "为打造巴厘岛下一代优质项目的开发商提供战略销售合作。",
    intro:
      "我们不只是挂牌——我们代表项目。我们仅与认同透明、品质与长期愿景的精选开发商合作。我们只推广自己会买的项目。每个项目都经过法律清晰度、建造质量与投资价值审核。若您正在打造卓越项目，欢迎申请探讨合作。",
    pillars: [
      { title: "透明", body: "凭借对巴厘岛市场的深度了解，有效营销并触达合适买家。" },
      { title: "优质买家", body: "连接认真且符合可持续开发理念的买家。" },
      { title: "精准营销", body: "从战略传播到高端视觉，吸引目标买家。" },
    ],
    applyLabel: "合作申请",
    applyTitle: "开启对话",
    applySub: "介绍您的项目。若战略契合，我们的团队将跟进讨论代理合作。",
    form: {
      fullName: "姓名",
      fullNamePh: "您的全名",
      country: "国家",
      countryPh: "您所在地区",
      email: "邮箱",
      emailPh: "you@company.com",
      phone: "电话",
      propertyType: "物业类型",
      propertyCategory: "产权类别",
      permitsQ: "是否具备 IMB/PBG 及全部合法许可？",
      webSocial: "网站 / Instagram（如有）",
      webSocialPh: "https://… 或 @账号",
      message: "留言",
      messagePh: "介绍项目、时间线与对主代理合作的期望。",
      consent: "提交即表示同意我们就此咨询联系您。我们不会将您的信息用于第三方营销。",
      submit: "提交",
      submitting: "发送中…",
      villa: "别墅",
      apartment: "公寓",
      land: "土地",
      leasehold: "租赁产权",
      freehold: "永久产权",
      permitsYes: "是",
      permitsInProcess: "办理中",
      permitsNo: "否",
    },
  },
  tr: {
    seoTitle: "Satıcı danışmanı · 8 Degree Bali",
    seoDescription:
      "Bali'de secilmis gelistiriciler icin master agency ortakligi: seffaflik, nitelikli alicilar ve hedefli pazarlama.",
    heroLine1: "Ozel temsil.",
    heroLine2: "Davetle.",
    heroSub: "Bali'nin yeni nesil kaliteli projelerini insa eden gelistiriciler icin stratejik satis ortakligi.",
    intro:
      "Sadece listelemiyoruz — temsil ediyoruz. Seffaflik, kalite ve uzun vadeli vizyonu paylasan secilmis gelistiricilerle calisiyoruz. Sadece kendimizin alacagini tanittigimiz projeleri sunuyoruz. Her proje hukuki netlik, yapim kalitesi ve yatirim degeri acisindan incelenir. Olaganustu bir sey insa ediyorsaniz, basvurun.",
    pillars: [
      { title: "Seffaflik", body: "Bali pazar bilgimizle mulkunuz dogru alicilara etkili sekilde ulasir." },
      { title: "Nitelikli alicilar", body: "Surdurulebilir gelisim degerleriyle uyumlu ciddi alicilarla baglanti." },
      { title: "Hedefli pazarlama", body: "Stratejik kampanyalar ve premium gorsellerle dogru alicilar." },
    ],
    applyLabel: "Ortaklik basvurusu",
    applyTitle: "Konusmayi baslatin",
    applySub: "Projenizi anlatin. Stratejik uyum varsa ekibimiz temsil icin donus yapacaktir.",
    form: {
      fullName: "Ad Soyad",
      fullNamePh: "Tam adiniz",
      country: "Ulke",
      countryPh: "Bulundugunuz ulke",
      email: "E-posta",
      emailPh: "siz@sirket.com",
      phone: "Telefon",
      propertyType: "Mulk tipi",
      propertyCategory: "Kategori",
      permitsQ: "IMB/PBG ve tum yasal izinlere sahip misiniz?",
      webSocial: "Web / Instagram (varsa)",
      webSocialPh: "https://… veya @hesap",
      message: "Mesaj",
      messagePh: "Proje, zaman cizelgesi ve master agency beklentilerinizi yazin.",
      consent: "Gondererek bu talep hakkinda iletisime gecilmesini kabul edersiniz. Verileriniz pazarlama icin paylasilmaz.",
      submit: "Gonder",
      submitting: "Gonderiliyor…",
      villa: "Villa",
      apartment: "Daire",
      land: "Arsa",
      leasehold: "Kiralama",
      freehold: "Mulkiyet",
      permitsYes: "Evet",
      permitsInProcess: "Surecte",
      permitsNo: "Hayir",
    },
  },
};
