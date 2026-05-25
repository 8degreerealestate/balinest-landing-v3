import type { SiteLanguage } from "@/lib/site-language";

/** Shared UI strings used across cards, forms, and components. */
export const COMMON_COPY: Record<
  SiteLanguage,
  {
    exclusive: string;
    greatDeal: string;
    residential: string;
    investment: string;
    learnMore: string;
    submit: string;
    submitting: string;
    fullName: string;
    email: string;
    phone: string;
    country: string;
    message: string;
    selectType: string;
    selectCategory: string;
    selectStatus: string;
    invalidPhoneTitle: string;
    invalidPhoneDesc: string;
    missingInfoTitle: string;
    missingInfoDesc: string;
    enquirySentTitle: string;
    enquirySentDesc: string;
    enquiryFailedTitle: string;
    enquiryFailedDesc: string;
  }
> = {
  en: {
    exclusive: "Exclusive",
    greatDeal: "Great deal",
    residential: "Residential",
    investment: "Investment",
    learnMore: "Learn more",
    submit: "Submit",
    submitting: "Submitting…",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    country: "Country",
    message: "Message",
    selectType: "Select type",
    selectCategory: "Select category",
    selectStatus: "Select status",
    invalidPhoneTitle: "Invalid phone number",
    invalidPhoneDesc: "Please enter a valid number with country code (at least 8 digits).",
    missingInfoTitle: "Missing information",
    missingInfoDesc: "Please fill in all required fields with a valid phone number.",
    enquirySentTitle: "Enquiry sent",
    enquirySentDesc: "Thank you — our team will be in touch shortly.",
    enquiryFailedTitle: "Could not send",
    enquiryFailedDesc: "Please try again or email us directly.",
  },
  id: {
    exclusive: "Eksklusif",
    greatDeal: "Penawaran bagus",
    residential: "Residensial",
    investment: "Investasi",
    learnMore: "Pelajari lebih lanjut",
    submit: "Kirim",
    submitting: "Mengirim…",
    fullName: "Nama lengkap",
    email: "Email",
    phone: "Nomor telepon",
    country: "Negara",
    message: "Pesan",
    selectType: "Pilih tipe",
    selectCategory: "Pilih kategori",
    selectStatus: "Pilih status",
    invalidPhoneTitle: "Nomor telepon tidak valid",
    invalidPhoneDesc: "Masukkan nomor valid dengan kode negara (minimal 8 digit).",
    missingInfoTitle: "Informasi belum lengkap",
    missingInfoDesc: "Lengkapi semua field wajib dengan nomor telepon yang valid.",
    enquirySentTitle: "Pertanyaan terkirim",
    enquirySentDesc: "Terima kasih — tim kami akan segera menghubungi Anda.",
    enquiryFailedTitle: "Gagal mengirim",
    enquiryFailedDesc: "Silakan coba lagi atau email kami langsung.",
  },
  fr: {
    exclusive: "Exclusif",
    greatDeal: "Bonne affaire",
    residential: "Residentiel",
    investment: "Investissement",
    learnMore: "En savoir plus",
    submit: "Envoyer",
    submitting: "Envoi…",
    fullName: "Nom complet",
    email: "E-mail",
    phone: "Telephone",
    country: "Pays",
    message: "Message",
    selectType: "Choisir le type",
    selectCategory: "Choisir la categorie",
    selectStatus: "Choisir le statut",
    invalidPhoneTitle: "Numero invalide",
    invalidPhoneDesc: "Entrez un numero valide avec indicatif (8 chiffres min.).",
    missingInfoTitle: "Informations manquantes",
    missingInfoDesc: "Remplissez tous les champs obligatoires avec un telephone valide.",
    enquirySentTitle: "Demande envoyee",
    enquirySentDesc: "Merci — notre equipe vous contactera sous peu.",
    enquiryFailedTitle: "Echec d'envoi",
    enquiryFailedDesc: "Reessayez ou ecrivez-nous directement.",
  },
  zh: {
    exclusive: "独家",
    greatDeal: "超值",
    residential: "住宅",
    investment: "投资",
    learnMore: "了解更多",
    submit: "提交",
    submitting: "发送中…",
    fullName: "姓名",
    email: "邮箱",
    phone: "电话",
    country: "国家",
    message: "留言",
    selectType: "选择类型",
    selectCategory: "选择类别",
    selectStatus: "选择状态",
    invalidPhoneTitle: "电话号码无效",
    invalidPhoneDesc: "请输入带国家代码的有效号码（至少8位）。",
    missingInfoTitle: "信息不完整",
    missingInfoDesc: "请填写所有必填项并提供有效电话号码。",
    enquirySentTitle: "咨询已发送",
    enquirySentDesc: "谢谢 — 我们的团队将尽快与您联系。",
    enquiryFailedTitle: "发送失败",
    enquiryFailedDesc: "请重试或直接发送邮件联系我们。",
  },
  tr: {
    exclusive: "Ozel",
    greatDeal: "Avantajli firsat",
    residential: "Konut",
    investment: "Yatirim",
    learnMore: "Daha fazla",
    submit: "Gonder",
    submitting: "Gonderiliyor…",
    fullName: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon",
    country: "Ulke",
    message: "Mesaj",
    selectType: "Tur secin",
    selectCategory: "Kategori secin",
    selectStatus: "Durum secin",
    invalidPhoneTitle: "Gecersiz telefon",
    invalidPhoneDesc: "Ulke koduyla gecerli bir numara girin (en az 8 hane).",
    missingInfoTitle: "Eksik bilgi",
    missingInfoDesc: "Zorunlu alanlari ve gecerli bir telefon numarasini doldurun.",
    enquirySentTitle: "Talep gonderildi",
    enquirySentDesc: "Tesekkurler — ekibimiz kisa surede iletisime gececek.",
    enquiryFailedTitle: "Gonderilemedi",
    enquiryFailedDesc: "Lutfen tekrar deneyin veya bize e-posta gonderin.",
  },
};
