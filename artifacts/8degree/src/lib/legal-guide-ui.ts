import type { SiteLanguage } from "@/lib/site-language";

/** Shared chrome + narrative strings for the legal guide (per site language). */
export type LegalGuideUi = {
  seoTitle: string;
  seoDescription: string;
  heroImageAlt: string;
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  intro: readonly [string, string, string];
  s01: { sidebar: string; h2: string; lead1: string; lead2: string };
  s01Verify: { h3: string; lead: string; timelineStrong: string; timelineRest: string };
  s02: {
    sidebar: string;
    h2: string;
    p1: string;
    p2: string;
    zoningHeading: string;
    verifyH3: string;
    pKkpr1: string;
    pKkpr2: string;
    timelineStrong: string;
    timelineRest: string;
    criticalStrong: string;
    criticalRest: string;
  };
  s03: { sidebar: string; h2: string; p1: string; p2: string; checklistH3: string; checklistFooter: string; timelineStrong: string; end: string };
  s04: { sidebar: string; h2: string; lead: string; timelineStrong: string; timelineRest: string };
  s05: { sidebar: string; h2: string; lead: string; timelineStrong: string; timelineRest: string };
  s06: {
    sidebar: string;
    h2: string;
    lead: string;
    tableTax: string;
    tableRate: string;
    tableWho: string;
    tableNotes: string;
    disclaimer: string;
  };
  s07: { sidebar: string; h2: string; lead: string; footerStrong: string };
  panoramaAria: string;
  panoramaAlt: string;
  s09: { h2: string; lead: string };
  s10: { h2: string; lead: string };
  s11: {
    p1: string;
    p2: string;
    checklistIntro: string;
    checklistLead: string;
    closingH2: string;
    closingP1Before: string;
    closingP1Strong: string;
    closingP2Prefix: string;
    closingP2Strong1: string;
    closingP2Mid: string;
    closingP2Strong2: string;
    closingP2Suffix: string;
    closingP3: string;
    closingP3Strong: string;
    closingP3End: string;
    ctaTeam: string;
    ctaLegal: string;
  };
};

export const LEGAL_GUIDE_UI: Record<SiteLanguage, LegalGuideUi> = {
  en: {
    seoTitle: "Due Diligence When Buying Property in Bali: The Complete Guide",
    seoDescription:
      "Learn every step of due diligence for Bali property purchases—from land title checks to zoning verification—so foreign investors can avoid costly mistakes.",
    heroImageAlt:
      "Open-plan living space with woven pendant lighting, tropical plants, and modern furniture — Pererenan, Bali",
    heroKicker: "Legal Guide",
    heroTitle: "Due Diligence When Buying Property in Bali: The Complete Guide",
    heroSub:
      "Learn every step of due diligence for Bali property purchases. From land title checks to zoning verification, this guide helps foreign investors avoid costly mistakes.",
    intro: [
      "Every year, thousands of international investors explore Bali's property market — drawn by competitive rental yields, a thriving tourism economy, and an extraordinary lifestyle. Yet the difference between a successful investment and an expensive mistake almost always comes down to one thing: due diligence on Bali property.",
      "Due diligence is the systematic legal and physical verification process that occurs before you commit to a purchase. In Indonesia, where the ownership framework for foreigners is fundamentally different from most Western markets, this process is not merely advisable — it is the single most important step in protecting your capital.",
      "This guide consolidates everything you need to know into one comprehensive resource: what to verify, how to verify it, how long it takes, what it costs, and which red flags should stop a transaction immediately.",
    ],
    s01: {
      sidebar: "Verify the land certificate",
      h2: "Verify the Land Certificate",
      lead1:
        "The land certificate is the foundational legal document in any Indonesian property transaction. This is where your Bali land title verification process begins.",
      lead2: "Indonesia recognises several types of land titles, each with different rights and restrictions:",
    },
    s01Verify: {
      h3: "How to Verify",
      lead:
        "Your notary (PPAT) or independent legal advisor should conduct the following verification directly with the local Badan Pertanahan Nasional (BPN / National Land Agency) office — not through the seller or their agent:",
      timelineStrong: "Typical timeline:",
      timelineRest: " 1–2 weeks for BPN verification, depending on the local office.",
    },
    s02: {
      sidebar: "Confirm zoning compliance",
      h2: "Confirm Zoning and Spatial Planning Compliance",
      p1:
        "Zoning is one of the most overlooked aspects of property due diligence in Bali, and it is increasingly one of the most consequential.",
      p2:
        "Every parcel of land in Bali falls under a spatial plan (Rencana Detail Tata Ruang / RDTR) that determines permissible development and commercial activity. In 2026, the Indonesian government uses the OSS system to strictly enforce these zoning designations.",
      zoningHeading: "Bali's Zoning Classifications:",
      verifyH3: "How to Verify",
      pKkpr1:
        "Request a KKPR (Kesesuaian Kegiatan Pemanfaatan Ruang) letter from the regional government through the OSS (Online Single Submission) platform. This document confirms that your intended land use is compatible with the approved spatial plan and has largely replaced the older ITR (Izin Tata Ruang) requirement for new developments.",
      pKkpr2:
        "Without a valid KKPR aligned to your project, you cannot obtain a building permit (PBG / Persetujuan Bangunan Gedung). Your legal advisor should verify that the KKPR zoning designation matches your investment plan — especially if you intend to operate short-term rental villas or commercial hospitality.",
      timelineStrong: "Typical timeline:",
      timelineRest: " 1–2 weeks, depending on the regency.",
      criticalStrong: "Critical note:",
      criticalRest:
        " Operating commercial short-term rentals on land zoned for agriculture or pure residential use carries significant legal and enforcement risk. Always confirm zoning before you commit capital — not after construction or launch.",
    },
    s03: {
      sidebar: "Review building permits",
      h2: "Review Building Permits and Construction Compliance",
      p1:
        "If you are purchasing a property with existing structures, verifying the building permits is essential.",
      p2:
        "Indonesia's building permit system transitioned from the IMB (Izin Mendirikan Bangunan) to the PBG (Persetujuan Bangunan Gedung) system. Properties built before this transition should hold a valid IMB; newer constructions should have a PBG.",
      checklistH3: "What to Check",
      checklistFooter:
        "Properties with no permit, an expired permit, or structures that deviate significantly from the approved plans present material risk. These issues can affect insurance, licensing, resale, and your ability to operate the property as intended.",
      timelineStrong: "Typical timeline:",
      end: " 3–5 business days for permit verification.",
    },
    s04: {
      sidebar: "Investigate ownership history",
      h2: "Investigate the Ownership History",
      lead: "Understanding the ownership history goes beyond confirming the current certificate holder.",
      timelineStrong: "Typical timeline:",
      timelineRest: " 1–2 weeks, conducted in parallel with title verification.",
    },
    s05: {
      sidebar: "Conduct site inspection",
      h2: "Conduct a Physical Site Inspection",
      lead: "Legal documents tell one part of the story. A physical inspection tells the rest.",
      timelineStrong: "Typical timeline:",
      timelineRest: " 1–2 days for site inspection.",
    },
    s06: {
      sidebar: "Understand tax obligations",
      h2: "Understand the Tax Obligations",
      lead:
        "Property transactions in Bali carry specific tax obligations that should be factored into your investment calculations:",
      tableTax: "Tax / Fee",
      tableRate: "Indicative Rate",
      tableWho: "Who Pays",
      tableNotes: "Notes",
      disclaimer:
        "These are indicative figures. Always confirm specific obligations with a qualified tax advisor for your transaction.",
    },
    s07: {
      sidebar: "Engage the right professionals",
      h2: "Engage the Right Professionals",
      lead:
        "Successful due diligence for Bali property is not a solo exercise. It requires a team of qualified, independent professionals:",
      footerStrong:
        "The cost of engaging these professionals is modest compared to the risks they mitigate.",
    },
    panoramaAria: "Bali aerial coastline",
    panoramaAlt: "Aerial view of Bali — forested mountains, coastal terraces, and turquoise sea",
    s09: {
      h2: "Red Flags That Should Stop a Transaction",
      lead:
        "Through our experience coordinating property transactions in Bali, certain warning signs consistently indicate risk. If you encounter any of the following, pause the transaction and seek independent legal advice immediately:",
    },
    s10: {
      h2: "Due Diligence Timeline: What to Expect",
      lead:
        "One of the most common questions investors ask is: how long does this process actually take? The answer is shorter than most people expect, because the steps run partially in parallel.",
    },
    s11: {
      p1: "These timelines run partially in parallel. Complex properties, properties with unclear histories, or transactions requiring PT PMA formation may take longer.",
      p2:
        "Rushing this process to \"secure a deal\" is one of the most common — and most expensive mistakes investors make. A few extra weeks of due diligence can save years of legal complications.",
      checklistIntro: "Your Due Diligence Checklist",
      checklistLead:
        "For quick reference, here is a summary you can save and use during your property search:",
      closingH2: "Invest with Clarity, Not Guesswork",
      closingP1Before:
        "Due diligence on Bali property is the process that transforms an exciting opportunity into a secure, well-structured investment. It takes time, professional expertise, and disciplined attention to detail — but it is ",
      closingP1Strong:
        "the most valuable investment you will make within the entire purchase process.",
      closingP2Prefix: "At 8 Degree Real Estate, we support investors through every stage of due diligence, connecting you with ",
      closingP2Strong1: "trusted, independent legal professionals",
      closingP2Mid: ", coordinating title verification, and ensuring that your investment is built on a foundation of ",
      closingP2Strong2: "legal certainty.",
      closingP2Suffix: "",
      closingP3: "If you are considering a property purchase in Bali, speak with our team to understand exactly what the process involves and how we can help ",
      closingP3Strong: "protect your investment from the very first step.",
      closingP3End: "",
      ctaTeam: "Speak with our team",
      ctaLegal: "Explore our legal services",
    },
  },
  id: {
    seoTitle: "Due Diligence Membeli Properti di Bali: Panduan Lengkap",
    seoDescription:
      "Pelajari setiap langkah due diligence pembelian properti Bali — dari cek sertifikat tanah hingga verifikasi zonasi — agar investor asing menghindari kesalahan mahal.",
    heroImageAlt:
      "Ruang terbuka dengan lampu anyaman, tanaman tropis, dan furnitur modern — Pererenan, Bali",
    heroKicker: "Panduan Legal",
    heroTitle: "Due Diligence Membeli Properti di Bali: Panduan Lengkap",
    heroSub:
      "Pelajari setiap langkah due diligence sebelum membeli properti di Bali. Dari verifikasi sertifikat hingga kesesuaian zonasi, panduan ini membantu investor asing menghindari kerugian.",
    intro: [
      "Setiap tahun, ribuan investor internasional mengeksplor pasar properti Bali — tertarik pada yield sewa, pariwisata yang tumbuh, dan gaya hidup luar biasa. Namun perbedaan antara investasi sukses dan kesalahan mahal hampir selalu bergantung pada satu hal: due diligence properti di Bali.",
      "Due diligence adalah proses verifikasi hukum dan fisik yang sistematis sebelum Anda berkomitmen membeli. Di Indonesia, kerangka kepemilikan untuk warga asing sangat berbeda dari banyak pasar Barat — proses ini bukan sekadar saran, melainkan langkah paling penting melindungi modal Anda.",
      "Panduan ini merangkum yang perlu Anda verifikasi, cara memverifikasi, perkiraan waktu, biaya, dan tanda bahaya yang harus menghentikan transaksi.",
    ],
    s01: {
      sidebar: "Verifikasi sertifikat tanah",
      h2: "Verifikasi Sertifikat Tanah",
      lead1:
        "Sertifikat tanah adalah dokumen hukum dasar dalam transaksi properti Indonesia. Di sinilah proses verifikasi hak atas tanah di Bali dimulai.",
      lead2: "Indonesia mengenal beberapa jenis hak atas tanah, masing-masing dengan hak dan batasan berbeda:",
    },
    s01Verify: {
      h3: "Cara Memverifikasi",
      lead:
        "Notaris (PPAT) atau penasihat hukum independen Anda harus melakukan verifikasi berikut langsung dengan Kantor Pertanahan/BPN setempat — bukan melalui penjual atau agen mereka:",
      timelineStrong: "Perkiraan waktu:",
      timelineRest: " 1–2 minggu untuk verifikasi BPN, tergantung kantor setempat.",
    },
    s02: {
      sidebar: "Pastikan kepatuhan zonasi",
      h2: "Konfirmasi Kepatuhan Zonasi dan Tata Ruang",
      p1:
        "Zonasi sering diabaikan dalam due diligence properti di Bali, padahal dampaknya sangat besar.",
      p2:
        "Setiap bidang tanah di Bali tercakup rencana tata ruang (RDTR) yang menentukan pembangunan dan aktivitas komersial yang diizinkan. Pemerintah Indonesia memakai OSS untuk menegakkan zonasi secara ketat.",
      zoningHeading: "Klasifikasi Zonasi Bali:",
      verifyH3: "Cara Memverifikasi",
      pKkpr1:
        "Minta surat KKPR (Kesesuaian Kegiatan Pemanfaatan Ruang) melalui OSS. Dokumen ini mengonfirmasi kesesuaian penggunaan lahan dengan rencana tata ruang dan menggantikan sebagian besar kebutuhan ITR lama untuk pengembangan baru.",
      pKkpr2:
        "Tanpa KKPR yang valid, Anda tidak bisa memperoleh PBG. Penasihat hukum harus memastikan zonasi KKPR selaras dengan rencana investasi—khususnya jika Anda menjalankan sewa jangka pendek atau hospitality komersial.",
      timelineStrong: "Perkiraan waktu:",
      timelineRest: " 1–2 minggu, tergantung kabupaten/kota.",
      criticalStrong: "Catatan penting:",
      criticalRest:
        " Menjalankan sewa jangka pendek komersial di lahan pertanian atau residensial murni berisiko hukum dan penegakan tinggi. Selalu pastikan zonasi sebelum modal dikunci—bukan setelah bangunan atau peluncuran.",
    },
    s03: {
      sidebar: "Tinjau izin bangunan",
      h2: "Tinjau Izin Bangunan dan Kepatuhan Konstruksi",
      p1:
        "Jika membeli properti dengan bangunan yang sudah ada, verifikasi izin bangunan sangat penting.",
      p2:
        "Sistem izin beralih dari IMB ke PBG. Properti lama seharusnya punya IMB valid; konstruksi baru seharusnya punya PBG.",
      checklistH3: "Yang Perlu Dicek",
      checklistFooter:
        "Tanpa izin, izin kadaluarsa, atau bangunan menyimpang jauh dari gambar rencana berisiko material—dampak ke asuransi, perizinan, jual beli, dan operasi.",
      timelineStrong: "Perkiraan waktu:",
      end: " 3–5 hari kerja untuk verifikasi izin.",
    },
    s04: {
      sidebar: "Selidiki riwayat kepemilikan",
      h2: "Selidiki Riwayat Kepemilikan",
      lead: "Memahami riwayat kepemilikan melampaui memastikan nama di sertifikat saat ini.",
      timelineStrong: "Perkiraan waktu:",
      timelineRest: " 1–2 minggu, paralel dengan verifikasi hak.",
    },
    s05: {
      sidebar: "Inspeksi lapangan",
      h2: "Lakukan Inspeksi Fisik di Lokasi",
      lead: "Dokumen hukum menceritakan sebagian; inspeksi fisik melengkapi cerita.",
      timelineStrong: "Perkiraan waktu:",
      timelineRest: " 1–2 hari untuk inspeksi.",
    },
    s06: {
      sidebar: "Pahami kewajiban pajak",
      h2: "Pahami Kewajiban Pajak",
      lead:
        "Transaksi properti di Bali membawa kewajiban pajak tertentu yang harus dimasukkan perhitungan investasi:",
      tableTax: "Pajak / biaya",
      tableRate: "Tarif indikatif",
      tableWho: "Ditanggung",
      tableNotes: "Catatan",
      disclaimer:
        "Angka indikatif. Selalu konfirmasi dengan konsultan pajak untuk transaksi Anda.",
    },
    s07: {
      sidebar: "Libatkan profesional tepat",
      h2: "Libatkan Profesional yang Tepat",
      lead:
        "Due diligence properti di Bali butuh tim profesional independen yang kompeten—bukan pekerjaan sendirian.",
      footerStrong:
        "Biaya profesional ini relatif kecil dibanding risiko yang mereka kurangi.",
    },
    panoramaAria: "Pantai Bali dari udara",
    panoramaAlt: "Pemandangan udara Bali — gunung berhutan, terasering pesisir, dan laut turkoi",
    s09: {
      h2: "Tanda Bahaya yang Harus Menghentikan Transaksi",
      lead:
        "Dari pengalaman kami, tanda berikut sering berarti risiko tinggi. Jika Anda menemukannya, hentikan sementara dan cari nasihat hukum independen:",
    },
    s10: {
      h2: "Linimasa Due Diligence: Yang Diharapkan",
      lead:
        "Investor sering bertanya: berapa lama proses ini? Jawabannya lebih singkat dari kesan awal karena banyak langkah berjalan paralel.",
    },
    s11: {
      p1: "Linimasa ini sebagian berjalan paralel. Properti kompleks, riwayat tidak jelas, atau pembentukan PT PMA bisa lebih lama.",
      p2:
        "Memburu-buru demi \"mengunci deal\" adalah kesalahan umum dan mahal. Beberapa minggu ekstra due diligence bisa menghemat tahun-tahun masalah hukum.",
      checklistIntro: "Checklist Due Diligence Anda",
      checklistLead: "Ringkasan praktis untuk disimpan saat mencari properti:",
      closingH2: "Investasi dengan Kejelasan, Bukan Tebakan",
      closingP1Before:
        "Due diligence mengubah peluang menarik menjadi investasi terstruktur dan lebih aman. Butuh waktu dan disiplin — namun ini ",
      closingP1Strong:
        "investasi paling berharga yang Anda lakukan dalam seluruh proses pembelian.",
      closingP2Prefix: "Di 8 Degree Real Estate, kami mendampingi setiap tahap due diligence, menghubungkan Anda dengan ",
      closingP2Strong1: "profesional hukum independen terpercaya",
      closingP2Mid: ", mengoordinasikan verifikasi hak, dan memastikan fondasi ",
      closingP2Strong2: "kepastian hukum.",
      closingP2Suffix: "",
      closingP3:
        "Jika Anda mempertimbangkan pembelian di Bali, bicaralah dengan tim kami agar jelas prosesnya dan bagaimana kami membantu ",
      closingP3Strong: "melindungi investasi Anda sejak langkah pertama.",
      closingP3End: "",
      ctaTeam: "Hubungi tim kami",
      ctaLegal: "Lihat layanan legal kami",
    },
  },
  fr: {
    seoTitle: "Due diligence immobilière à Bali — guide complet",
    seoDescription:
      "Étapes clés avant d’acheter à Bali : titres fonciers, zonage et vérifications pour éviter les erreurs coûteuses.",
    heroImageAlt:
      "Grand espace de vie avec luminaire tressé, plantes tropicales et mobilier moderne — Pererenan, Bali",
    heroKicker: "Guide juridique",
    heroTitle: "Due diligence avant d’acheter une propriété à Bali — guide complet",
    heroSub:
      "Chaque étape avant l’achat : vérification des titres, conformité au plan de zonage, et repères pour investisseurs internationaux.",
    intro: [
      "Chaque année, des milliers d’investisseurs explorent l’immobilier balinais, attirés par les rendements locatifs, le tourisme et le cadre de vie. Mais la réussite ou l’échec dépend presque toujours de la qualité de la due diligence.",
      "La due diligence est le contrôle juridique et physique structuré qui précède tout engagement d’achat. En Indonésie, le cadre de propriété pour les étrangers diffère fortement des marchés occidentaux — c’est l’étape indispensable pour protéger votre capital.",
      "Ce guide rassemble ce qu’il faut vérifier, comment le vérifier, les délais, les coûts indicatifs et les signaux d’alarme qui doivent arrêter une transaction.",
    ],
    s01: {
      sidebar: "Vérifier le certificat foncier",
      h2: "Vérifier le certificat foncier",
      lead1:
        "Le certificat foncier est la base juridique de toute transaction. C’est le point de départ de votre vérification de titre à Bali.",
      lead2: "L’Indonésie reconnaît plusieurs types de droits fonciers, avec des droits et limites différents :",
    },
    s01Verify: {
      h3: "Comment vérifier",
      lead:
        "Votre notaire (PPAT) ou conseil indépendant doit effectuer ces vérifications directement auprès du BPN local — pas via le vendeur ou son agent :",
      timelineStrong: "Délai indicatif :",
      timelineRest: " 1–2 semaines pour la validation BPN selon l’office.",
    },
    s02: {
      sidebar: "Conformité au zonage",
      h2: "Conformité au zonage et au schéma d’urbanisme",
      p1:
        "Le zonage est souvent négligé en due diligence à Bali alors que son impact est majeur et croissant.",
      p2:
        "Chaque parcelle relève d’un plan spatial (RDTR) qui fixe l’usage permis. Le gouvernement s’appuie sur OSS pour faire respecter ces affectations.",
      zoningHeading: "Les zonages à Bali :",
      verifyH3: "Comment vérifier",
      pKkpr1:
        "Demandez une lettre KKPR via la plateforme OSS : elle atteste la compatibilité de votre projet avec le plan approuvé et remplace en grande partie l’ancienne logique ITR pour les développements récents.",
      pKkpr2:
        "Sans KKPR valide, vous ne pouvez pas obtenir le PBG. Votre conseil doit confirmer que la zone correspond à votre usage — surtout pour locations courte durée ou hospitalité.",
      timelineStrong: "Délai indicatif :",
      timelineRest: " 1–2 semaines selon la régence.",
      criticalStrong: "Point critique :",
      criticalRest:
        " Exploiter une location courte durée commerciale sur de l’agricole ou du résidentiel pur comporte des risques juridiques et d’exécution élevés. Validez le zonage avant d’engager le capital — pas après la construction.",
    },
    s03: {
      sidebar: "Permis de construire",
      h2: "Permis de construire et conformité des ouvrages",
      p1: "Pour un bien avec constructions existantes, vérifier les permis est essentiel.",
      p2:
        "Le système est passé de l’IMB au PBG. Les biens anciens devraient avoir un IMB valide ; les constructions récentes un PBG.",
      checklistH3: "Points à contrôler",
      checklistFooter:
        "Absence de permis, permis expiré ou écart majeur avec les plans approuvés : risque matériel pour assurance, revente et exploitation.",
      timelineStrong: "Délai indicatif :",
      end: " 3–5 jours ouvrés pour contrôler les permis.",
    },
    s04: {
      sidebar: "Historique de propriété",
      h2: "Analyser la chaîne de propriété",
      lead: "Comprendre l’historique va au-delà du détenteur actuel du certificat.",
      timelineStrong: "Délai indicatif :",
      timelineRest: " 1–2 semaines en parallèle avec la vérification du titre.",
    },
    s05: {
      sidebar: "Visite du terrain",
      h2: "Inspection physique du site",
      lead: "Les documents ne racontent qu’une partie ; la visite complète le tableau.",
      timelineStrong: "Délai indicatif :",
      timelineRest: " 1–2 jours pour la visite.",
    },
    s06: {
      sidebar: "Obligations fiscales",
      h2: "Obligations fiscales",
      lead: "Les transactions à Bali comportent des charges fiscales à intégrer à votre modèle :",
      tableTax: "Taxe / frais",
      tableRate: "Taux indicatif",
      tableWho: "Payeur",
      tableNotes: "Notes",
      disclaimer:
        "Chiffres indicatifs. Confirmez avec un fiscaliste pour votre opération.",
    },
    s07: {
      sidebar: "Les bons professionnels",
      h2: "S’entourer des bons professionnels",
      lead:
        "La due diligence n’est pas un travail en solo : il faut une équipe qualifiée et indépendante.",
      footerStrong:
        "Le coût de ces experts est modeste face aux risques évités.",
    },
    panoramaAria: "Vue aérienne de la côte balinaise",
    panoramaAlt: "Vue aérienne — montagnes boisées, terrasses côtières et mer turquoise",
    s09: {
      h2: "Signaux d’alerte qui doivent arrêter la transaction",
      lead:
        "Dans notre expérience, les signes suivants indiquent un risque élevé. Dans ce cas, suspendez et consultez un avocat indépendant :",
    },
    s10: {
      h2: "Calendrier de due diligence : à quoi s’attendre",
      lead:
        "Combien de temps cela prend-il ? Souvent moins qu’imaginé, car plusieurs étapes se déroulent en parallèle.",
    },
    s11: {
      p1: "Les délais se chevauchent partiellement. Les dossiers complexes ou les opérations avec PT PMA peuvent prendre plus de temps.",
      p2:
        "Brûler les étapes pour « sécuriser le deal » est une erreur fréquente et coûteuse. Quelques semaines de plus peuvent épargner des années de litiges.",
      checklistIntro: "Votre checklist de due diligence",
      checklistLead: "Résumé à conserver pendant votre recherche :",
      closingH2: "Investir avec clarté, pas au hasard",
      closingP1Before:
        "La due diligence transforme une opportunité excitante en investissement mieux structuré et plus sûr. Elle demande du temps et de la rigueur — et c’est ",
      closingP1Strong:
        "l’investissement le plus rentable de tout votre processus d’achat.",
      closingP2Prefix: "Chez 8 Degree Real Estate, nous accompagnons chaque étape, en vous connectant à des ",
      closingP2Strong1: "juristes indépendants de confiance",
      closingP2Mid: ", en coordonnant la vérification des titres et en posant une base de ",
      closingP2Strong2: "certitude juridique.",
      closingP2Suffix: "",
      closingP3:
        "Si vous envisagez un achat à Bali, parlons avec notre équipe pour clarifier le processus et comment nous pouvons ",
      closingP3Strong: "protéger votre investissement dès le premier jour.",
      closingP3End: "",
      ctaTeam: "Parler à l’équipe",
      ctaLegal: "Découvrir nos services juridiques",
    },
  },
  zh: {
    seoTitle: "巴厘岛购房尽职调查完整指南",
    seoDescription:
      "从土地证核验到分区合规，帮助国际投资者在巴厘岛购房时规避重大风险的完整步骤。",
    heroImageAlt:
      "开放式起居空间，藤编吊灯、热带植物与现代家具——巴厘岛 Pererenan",
    heroKicker: "法律指南",
    heroTitle: "巴厘岛购房尽职调查完整指南",
    heroSub:
      "从产权核验到规划分区，本指南梳理外国投资者购房前必须完成的关键步骤。",
    intro: [
      "每年，成千上万的国际投资者关注巴厘岛房产市场——被租金回报、旅游业与生活方式吸引。但成败往往取决于尽职调查是否到位。",
      "尽职调查是签约前系统性的法律与实地核查。印尼对外国人的产权制度与多数西方国家不同，这一步骤是保护资本最关键的一环。",
      "本指南汇总需核查事项、核查方式、时间预期、费用参考，以及应立即中止交易的风险信号。",
    ],
    s01: {
      sidebar: "核验土地证",
      h2: "核验土地权属证书",
      lead1:
        "土地证是印尼任何房地产交易的基础法律文件，也是巴厘岛产权核验的起点。",
      lead2: "印尼有多种土地权利类型，各自对应不同的权利与限制：",
    },
    s01Verify: {
      h3: "如何核验",
      lead:
        "您的公证人（PPAT）或独立法律顾问应直接在属地国家土地局（BPN）办公室完成以下核查——而非通过卖方或其中介：",
      timelineStrong: "常见周期：",
      timelineRest: " BPN 核验通常约 1–2 周，视当地土地局而定。",
    },
    s02: {
      sidebar: "确认分区合规",
      h2: "确认用地分区与空间规划合规",
      p1: "分区往往是巴厘岛房产尽调中最被忽视、却越来越决定性的环节之一。",
      p2:
        "每宗地块都受制于空间规划（RDTR），决定可进行的开发与商业活动。政府通过 OSS 系统严格执法分区用途。",
      zoningHeading: "巴厘岛用地分区概览：",
      verifyH3: "如何核验",
      pKkpr1:
        "通过 OSS 向地方政府申请 KKPR（空间利用一致性）文件，确认拟议用途与法定规划一致；新开发中它很大程度上取代了旧式 ITR 路径。",
      pKkpr2:
        "没有有效的 KKPR，就无法取得 PBG 建筑许可。法律顾问应确认分区与您计划一致——特别是短租别墅或商业酒店用途。",
      timelineStrong: "常见周期：",
      timelineRest: " 约 1–2 周，视县/市而定。",
      criticalStrong: "关键提示：",
      criticalRest:
        " 在农业或纯住宅用途土地上开展商业短租，法律与执法风险极高。请在投入资金前确认分区——而非在建设或上线之后。",
    },
    s03: {
      sidebar: "审查建筑许可",
      h2: "审查建筑许可与工程合规",
      p1: "若购买带既有建筑的物业，核查建筑许可至关重要。",
      p2:
        "许可体系已从 IMB 过渡到 PBG。旧建筑应持有有效 IMB；新建工程应有 PBG。",
      checklistH3: "核查要点",
      checklistFooter:
        "无证、许可过期或与批准图纸严重偏差的建筑，会在保险、许可、转售与运营上带来实质风险。",
      timelineStrong: "常见周期：",
      end: " 许可核查通常 3–5 个工作日。",
    },
    s04: {
      sidebar: "调查产权历史",
      h2: "调查历史产权链条",
      lead: "理解产权流转史，不仅限于确认现任持证人。",
      timelineStrong: "常见周期：",
      timelineRest: " 约 1–2 周，可与权属核验并行。",
    },
    s05: {
      sidebar: "实地勘察",
      h2: "进行现场实地勘察",
      lead: "法律文件只讲述一半故事，实地勘察补全另一半。",
      timelineStrong: "常见周期：",
      timelineRest: " 实地勘察通常 1–2 天。",
    },
    s06: {
      sidebar: "税务义务",
      h2: "理解交易相关税务",
      lead: "巴厘岛房产交易涉及特定税费，应纳入投资测算：",
      tableTax: "税费项目",
      tableRate: "参考税率/比例",
      tableWho: "承担方",
      tableNotes: "说明",
      disclaimer: "以上为示意，具体义务请咨询税务顾问。",
    },
    s07: {
      sidebar: "聘请合适专业人士",
      h2: "组建可靠的独立专业团队",
      lead: "房产尽职调查无法凭一己之力完成，需要合格且独立的团队协同。",
      footerStrong: "与可能发生的损失相比，聘请专业人士的成本非常有限。",
    },
    panoramaAria: "巴厘岛海岸鸟瞰",
    panoramaAlt: "巴厘岛鸟瞰——山林、海岸梯田与碧绿海水",
    s09: {
      h2: "应暂停交易的重大风险信号",
      lead:
        "根据我们在巴厘岛的交易经验，以下情况往往意味着高度风险。若遇到，请暂停交易并尽快咨询独立律师：",
    },
    s10: {
      h2: "尽职调查时间线：合理预期",
      lead:
        "投资者常问：整个过程要多久？由于多环节可并行，实际耗时往往比想象更短。",
    },
    s11: {
      p1: "以上时间线部分并行。复杂物业、权属不清的交易或需设立 PT PMA 的情形可能更长。",
      p2:
        "为“抢单”而压缩尽调是最常见、也最昂贵的错误之一。多几周尽调，往往能避免数年法律纠纷。",
      checklistIntro: "您的尽职调查清单",
      checklistLead: "可在寻房过程中保存对照的精简清单：",
      closingH2: "用清晰投资，而不是侥幸",
      closingP1Before:
        "尽职调查把令人兴奋的机会，转化为更安全、结构更清楚的投资。它需要时间与专业执行——而这一切中 ",
      closingP1Strong: "在整个购买流程里，它是您最有价值的一笔投入。",
      closingP2Prefix: "在 8 Degree Real Estate，我们在尽调的每个阶段提供支持，为您对接",
      closingP2Strong1: "值得信赖的独立法律专业人士",
      closingP2Mid: "，协调产权核验，并为投资奠定",
      closingP2Strong2: "法律确定性",
      closingP2Suffix: "的基础。",
      closingP3: "若您考虑在巴厘岛购房，欢迎与我们的团队沟通，了解流程细节及我们如何",
      closingP3Strong: "从第一步起保护您的投资。",
      closingP3End: "",
      ctaTeam: "联系团队",
      ctaLegal: "了解法律服务",
    },
  },
  tr: {
    seoTitle: "Bali’de mülk satın alırken due diligence: tam rehber",
    seoDescription:
      "Tapu kontrollerinden imar uyumuna: yabancı yatırımcılar için maliyetli hataları önlemeye yönelik adımlar.",
    heroImageAlt:
      "Örgü avizeli, tropikal bitkili ve modern mobilyalı açık plan yaşam alanı — Pererenan, Bali",
    heroKicker: "Hukuk rehberi",
    heroTitle: "Bali’de gayrimenkul alırken due diligence: tam rehber",
    heroSub:
      "Tapu doğrulamasından imar onayına kadar her adım; yabancı yatırımcılar için pratik çerçeve.",
    intro: [
      "Her yıl binlerce uluslararası yatırımcı Bali gayrimenkul piyasasını inceliyor — kira getirisi, turizm ve yaşam tarzı çekici. Başarı ile pahalı hata arasındaki fark çoğunlukla due diligence kalitesine bağlıdır.",
      "Due diligence, satın alma taahhüdünden önce yapılan sistematik hukuki ve fiziksel doğrulama sürecidir. Endonezya’da yabancılar için mülkiyet çerçevesi birçok batı pazarından farklıdır — sermayenizi korumada en kritik adımdır.",
      "Bu rehber; neyi, nasıl ve ne kadar sürede doğrulayacağınızı, maliyet önergelerini ve işlemi durdurmanız gereken kırmızı bayrakları tek yerde toplar.",
    ],
    s01: {
      sidebar: "Tapu belgesini doğrulayın",
      h2: "Tapu belgesini doğrulayın",
      lead1:
        "Tapu belgesi, Endonezya’da her gayrimenkul işleminin temel hukuki belgesidir. Bali’de hak doğrulama süreci burada başlar.",
      lead2: "Endonezya birden fazla arazi hakkı tanır; her birinin yetkileri ve sınırları farklıdır:",
    },
    s01Verify: {
      h3: "Nasıl doğrulanır",
      lead:
        "Noteriniz (PPAT) veya bağımsız avukatınız aşağıdakileri yerel BPN ofisinde — satıcı veya acentesi üzerinden değil — yapmalıdır:",
      timelineStrong: "Tipik süre:",
      timelineRest: " BPN doğrulaması yerel ofise göre genelde 1–2 hafta.",
    },
    s02: {
      sidebar: "İmar uyumunu teyit edin",
      h2: "İmar ve mekânsal plana uyumu teyit edin",
      p1:
        "İmar, Bali’de sık gözden kaçan fakat giderek en sonuçları belirleyen başlıklardan biridir.",
      p2:
        "Her parsel, izin verilen kullanımı belirleyen bir mekânsal plana (RDTR) tabidir. Hükümet bu kullanımları OSS ile sıkı biçimde uygular.",
      zoningHeading: "Bali imar sınıfları:",
      verifyH3: "Nasıl doğrulanır",
      pKkpr1:
        "Bölge yönetiminden OSS üzerinden KKPR yazısı isteyin; planlanan kullanımın onaylı planla uyumunu teyit eder ve yeni geliştirmelerde eski ITR sürecinin büyük kısmının yerini alır.",
      pKkpr2:
        "Geçerli KKPR olmadan PBG inşaat izni alınamaz. Hukuk danışmanınız KKPR’nin yatırım planınızla — özellikle kısa dönem kiralama veya ticari konaklama — örtüştüğünü doğrulamalıdır.",
      timelineStrong: "Tipik süre:",
      timelineRest: " Regency’e göre genelde 1–2 hafta.",
      criticalStrong: "Kritik not:",
      criticalRest:
        " Tarım veya salt konut imarında ticari kısa dönem kiralama yürütmek ciddi hukuki ve uygulama riski taşır. Sermayeyi kilitlemeden önce imarı doğrulayın — inşa veya lansmandan sonra değil.",
    },
    s03: {
      sidebar: "İnşaat izinlerini gözden geçirin",
      h2: "İnşaat izinleri ve uyumu",
      p1: "Mevcut yapıları olan bir mülk alıyorsanız izinleri doğrulamak şarttır.",
      p2:
        "Sistem IMB’den PBG’ye geçti. Eski yapılarda geçerli IMB; yenilerde PBG bulunmalıdır.",
      checklistH3: "Kontrol listesi",
      checklistFooter:
        "İzinsiz, süresi dolmuş veya onaylı planlardan belirgin sapma: sigorta, lisans, yeniden satış ve operasyon için ciddi risktir.",
      timelineStrong: "Tipik süre:",
      end: " İzin kontrolü için 3–5 iş günü.",
    },
    s04: {
      sidebar: "Mülkiyet geçmişini araştırın",
      h2: "Mülkiyet geçmişini araştırın",
      lead: "Geçmişi anlamak, yalnızca güncel tapu sahibini teyit etmekten daha fazlasını gerektirir.",
      timelineStrong: "Tipik süre:",
      timelineRest: " 1–2 hafta, tapu doğrulamasıyla paralel.",
    },
    s05: {
      sidebar: "Sahada inceleme",
      h2: "Fiziksel saha incelemesi",
      lead: "Belgeler hikâyenin bir kısmını anlatır; saha geri kalanı tamamlar.",
      timelineStrong: "Tipik süre:",
      timelineRest: " Saha incelemesi 1–2 gün.",
    },
    s06: {
      sidebar: "Vergi yükümlülükleri",
      h2: "Vergi yükümlülüklerini anlayın",
      lead:
        "Bali işlemleri belirli vergi yükümlülükleri taşır; bunları yatırım modelinize eklemelisiniz:",
      tableTax: "Vergi / ücret",
      tableRate: "Gösterge oran",
      tableWho: "Ödeyen",
      tableNotes: "Notlar",
      disclaimer:
        "Bunlar gösterge rakamlardır. Kesin yükümlülükler için vergi danışmanınıza danışın.",
    },
    s07: {
      sidebar: "Doğru uzmanları devreye alın",
      h2: "Doğru profesyonelleri devreye alın",
      lead:
        "Bali’de due diligence tek başına yürütülemez; nitelikli ve bağımsız bir ekip gerekir.",
      footerStrong:
        "Bu profesyonellerin maliyeti, bertaraf ettikleri risklere kıyasla mütevazıdır.",
    },
    panoramaAria: "Bali kıyısı havadan",
    panoramaAlt: "Bali havadan — ormanlık dağlar, kıyı terasları ve turkuaz deniz",
    s09: {
      h2: "İşlemi Durdurmanız Gereken Kırmızı Bayraklar",
      lead:
        "Deneyimimize göre aşağıdaki uyarılar yüksek risk gösterir. Karşılaşırsanız işlemi duraklatın ve bağımsız hukuk danışmanına başvurun:",
    },
    s10: {
      h2: "Due diligence zaman çizelgesi: ne beklenir",
      lead:
        "Yatırımcıların en çok sorduğu soru: ne kadar sürer? Adımlar kısmen paralel yürüdüğü için süre genelde beklenenden kısadır.",
    },
    s11: {
      p1: "Süreler kısmen örtüşür. Karmaşık mülkler, belirsiz geçmiş veya PT PMA kurulumu daha uzun sürebilir.",
      p2:
        "Anlaşmayı kilitlemek için süreci hızlandırmak yaygın ve pahalı bir hatadır. Birkaç hafta ek due diligence, yıllarca hukuki sorundan kurtarabilir.",
      checklistIntro: "Due diligence kontrol listeniz",
      checklistLead: "Arama sırasında saklayabileceğiniz özet:",
      closingH2: "Tahmine değil, netliğe yatırım",
      closingP1Before:
        "Due diligence, heyecan verici fırsatı daha güvenli ve iyi yapılandırılmış bir yatırıma dönüştürür. Zaman ve disiplin ister — ve satın alma sürecinizin tamamında ",
      closingP1Strong: "yapacağınız en değerli yatırımdır.",
      closingP2Prefix: "8 Degree Real Estate olarak her aşamada yanınızdayız; sizi ",
      closingP2Strong1: "güvenilir, bağımsız hukuk profesyonelleri",
      closingP2Mid: " ile buluşturur, tapu doğrulamasını koordine eder ve yatırımınızı ",
      closingP2Strong2: "hukuki kesinlik",
      closingP2Suffix: " üzerine kurarız.",
      closingP3:
        "Bali’de satın alma düşünüyorsanız ekibimizle görüşerek süreci netleştirin ve ",
      closingP3Strong: "ilk adımdan itibaren yatırımınızı nasıl koruduğumuzu",
      closingP3End: " öğrenin.",
      ctaTeam: "Ekiple konuşun",
      ctaLegal: "Hukuk hizmetlerimizi keşfedin",
    },
  },
};
