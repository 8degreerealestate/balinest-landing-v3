import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, MapPin, Youtube } from "lucide-react";
import type { SVGProps } from "react";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";
import { buildWhatsappUrl } from "@/lib/site-contact";

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.04 2C6.56 2 2.1 6.31 2.1 11.6c0 1.74.49 3.44 1.42 4.93L2 22l5.7-1.48c1.42.75 3.02 1.15 4.66 1.15 5.48 0 9.94-4.31 9.94-9.6C22.3 6.31 17.84 2 12.04 2Zm0 17.9c-1.52 0-3-.4-4.3-1.16l-.31-.18-3.38.88.9-3.2-.2-.32a7.66 7.66 0 0 1-1.22-4.1c0-4.25 3.62-7.7 8.51-7.7 4.6 0 8.46 3.2 8.46 7.48 0 4.25-3.62 7.5-8.46 7.5Zm4.76-5.64c-.26-.13-1.55-.75-1.8-.84-.24-.09-.42-.13-.6.13-.18.26-.69.84-.85 1.01-.16.17-.31.2-.58.07-.26-.13-1.12-.4-2.14-1.29-.79-.67-1.32-1.5-1.47-1.76-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.16.18-.26.26-.44.09-.17.04-.33-.02-.46-.06-.13-.6-1.43-.82-1.96-.22-.52-.44-.45-.6-.45l-.51-.01c-.18 0-.46.06-.7.33-.24.26-.92.9-.92 2.2 0 1.3.95 2.56 1.08 2.74.13.17 1.86 2.85 4.52 3.99.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.55-.62 1.77-1.22.22-.6.22-1.12.15-1.22-.06-.1-.24-.16-.5-.29Z" />
    </svg>
  );
}

function RednoteIcon(props: SVGProps<SVGSVGElement>) {
  // Simple “note” mark as placeholder for Rednote/Xiaohongshu.
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M7 3h10a2 2 0 0 1 2 2v11.5a2 2 0 0 1-.6 1.42l-2.48 2.48A2 2 0 0 1 14.5 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm10 2H7v14h7.5a.5.5 0 0 0 .35-.15L17 16.7V5Z" />
      <path d="M8.5 8.2h7v1.8h-7V8.2Zm0 4h7V14h-7v-1.8Z" />
    </svg>
  );
}

function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2a10 10 0 0 0-3.64 19.31c-.02-.83 0-1.82.22-2.73l1.38-5.86s-.34-.67-.34-1.66c0-1.55.9-2.71 2.03-2.71.96 0 1.42.72 1.42 1.58 0 .96-.61 2.4-.93 3.74-.27 1.12.56 2.03 1.67 2.03 2 0 3.55-2.1 3.55-5.14 0-2.68-1.92-4.56-4.66-4.56-3.17 0-5.03 2.37-5.03 4.83 0 .96.37 1.99.84 2.54.09.11.1.21.08.33l-.33 1.37c-.05.22-.18.26-.41.16-1.53-.71-2.48-2.95-2.48-4.75 0-3.86 2.8-7.4 8.08-7.4 4.24 0 7.53 3.02 7.53 7.06 0 4.21-2.66 7.6-6.34 7.6-1.24 0-2.4-.65-2.8-1.42l-.76 2.88c-.28 1.05-1.03 2.36-1.53 3.16A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M15.7 3c.18 1.53 1.03 2.92 2.33 3.75.82.54 1.8.84 2.8.85v2.64a8.28 8.28 0 0 1-2.73-.45v5.25c0 3.4-2.75 6.16-6.15 6.16S5.8 18.44 5.8 15.04c0-3.4 2.76-6.16 6.16-6.16.3 0 .6.02.89.07v2.72a3.42 3.42 0 0 0-.89-.11 3.49 3.49 0 1 0 3.49 3.48V3h2.25Z" />
    </svg>
  );
}

export function Footer() {
  const language = useSiteLanguage();
  const t: Record<SiteLanguage, Record<string, string>> = {
    en: {
      arebi: "AREBI Member",
      blurb: "Boutique Bali real estate advisory: precision over volume, clarity and structure for investors and homeowners.",
      navigation: "Navigation",
      company: "Company",
      connect: "Connect",
      properties: "Properties",
      services: "Services",
      invest: "Invest",
      guides: "Guides",
      aboutUs: "About Us",
      journal: "Journal",
      contactUs: "Contact Us",
      rights: "© 2026 PT 8 Degree Real Estate. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    id: {
      arebi: "Anggota AREBI",
      blurb: "Advisory properti Bali butik: presisi, kejelasan, dan struktur bagi investor serta pemilik rumah.",
      navigation: "Navigasi",
      company: "Perusahaan",
      connect: "Terhubung",
      properties: "Properti",
      services: "Layanan",
      invest: "Invest",
      guides: "Panduan",
      aboutUs: "Tentang Kami",
      journal: "Jurnal",
      contactUs: "Hubungi Kami",
      rights: "© 2026 PT 8 Degree Real Estate. Semua hak dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat Layanan",
    },
    fr: {
      arebi: "Membre AREBI",
      blurb: "Conseil immobilier boutique a Bali: precision, clarte et structure pour investisseurs et proprietaires.",
      navigation: "Navigation",
      company: "Entreprise",
      connect: "Contact",
      properties: "Proprietes",
      services: "Services",
      invest: "Investir",
      guides: "Guides",
      aboutUs: "A Propos",
      journal: "Journal",
      contactUs: "Contact",
      rights: "© 2026 PT 8 Degree Real Estate. Tous droits reserves.",
      privacy: "Politique de Confidentialite",
      terms: "Conditions d'Utilisation",
    },
    zh: {
      arebi: "AREBI 会员",
      blurb: "巴厘岛精品房地产顾问：为投资者和业主提供精准、清晰、结构化服务。",
      navigation: "导航",
      company: "公司",
      connect: "联系",
      properties: "房源",
      services: "服务",
      invest: "投资",
      guides: "指南",
      aboutUs: "关于我们",
      journal: "专栏",
      contactUs: "联系我们",
      rights: "© 2026 PT 8 Degree Real Estate. 版权所有。",
      privacy: "隐私政策",
      terms: "服务条款",
    },
    tr: {
      arebi: "AREBI Uyesi",
      blurb: "Bali'de butik gayrimenkul danismanligi: yatirimcilar ve ev sahipleri icin netlik ve yapi.",
      navigation: "Navigasyon",
      company: "Sirket",
      connect: "Baglan",
      properties: "Ilanlar",
      services: "Hizmetler",
      invest: "Yatirim",
      guides: "Rehberler",
      aboutUs: "Hakkimizda",
      journal: "Blog",
      contactUs: "Iletisim",
      rights: "© 2026 PT 8 Degree Real Estate. Tum haklari saklidir.",
      privacy: "Gizlilik Politikasi",
      terms: "Kullanim Sartlari",
    },
  }[language];

  return (
    <footer className="bg-primary py-20 text-primary-foreground">
      <div className="page-container page-gutter max-w-7xl">
        <div className="mb-16 flex flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-10 lg:gap-14">
          <div className="shrink-0 md:max-w-[280px] lg:max-w-[320px]">
            <div className="mb-6">
              <img
                src="/brand/8degree-logotype-white.png"
                alt="8 Degree Real Estate"
                className="h-7 w-auto max-w-[190px] object-contain mix-blend-screen"
              />
              <span className="mt-8 block text-xs font-medium uppercase tracking-[0.28em] text-primary-foreground/75">{t.arebi}</span>
              <p className="mt-4 text-xs font-medium tracking-[0.16em] text-primary-foreground/85">2024.000149.A</p>
              <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-primary-foreground/80">
                8 Degree Real Estate is an AREBI-licensed brokerage — your assurance of qualified agents and trusted service.
              </p>
            </div>
          </div>

          <div className="grid min-w-0 w-full flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4 md:gap-x-6 lg:gap-x-10">
            <div className="min-w-0">
              <h4 className="mb-6 text-sm font-medium uppercase tracking-[0.28em] text-primary-foreground">Properties</h4>
              <ul className="space-y-4 text-sm font-light text-primary-foreground/80 [&_a]:whitespace-normal">
                <li>
                  <Link href="/projects" className="transition-colors hover:text-primary-foreground">
                    Real Estate For Sale
                  </Link>
                </li>
                <li>
                  <Link href="/long-term-rentals" className="transition-colors hover:text-primary-foreground">
                    Long Term Rentals
                  </Link>
                </li>
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className="mb-6 text-sm font-medium uppercase tracking-[0.28em] text-primary-foreground">Services</h4>
              <ul className="space-y-4 text-sm font-light text-primary-foreground/80 [&_a]:whitespace-normal">
                <li>
                  <Link href="/buyer-agents" className="transition-colors hover:text-primary-foreground">
                    Buyer&apos;s Agent
                  </Link>
                </li>
                <li>
                  <Link href="/seller-agents" className="transition-colors hover:text-primary-foreground">
                    Seller&apos;s Agent
                  </Link>
                </li>
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className="mb-6 text-sm font-medium uppercase tracking-[0.28em] text-primary-foreground">Guides</h4>
              <ul className="space-y-4 text-sm font-light text-primary-foreground/80 [&_a]:whitespace-normal">
                <li>
                  <Link href="/legal-services" className="transition-colors hover:text-primary-foreground">
                    Legal Guide
                  </Link>
                </li>
                <li>
                  <Link href="/bali-property-guide" className="transition-colors hover:text-primary-foreground">
                    Location Guide
                  </Link>
                </li>
                <li>
                  <Link href="/investment-guide" className="transition-colors hover:text-primary-foreground">
                    Investment Guide
                  </Link>
                </li>
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className="mb-6 text-sm font-medium uppercase tracking-[0.28em] text-primary-foreground">Company</h4>
              <ul className="space-y-4 text-sm font-light text-primary-foreground/80 [&_a]:whitespace-normal">
                <li>
                  <Link href="/about" className="transition-colors hover:text-primary-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/journal" className="transition-colors hover:text-primary-foreground">
                    Journal
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-primary-foreground">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-primary-foreground/20 pt-8 text-xs text-primary-foreground/75 md:grid-cols-3 md:items-start">
          <a
            href="https://maps.google.com/maps?vet=10CAAQoqAOahcKEwiA-t-Z6LCUAxUAAAAAHQAAAAAQCg..i&sca_esv=635f647f0ac037ee&pvq=Cg0vZy8xMWx0d3I2Nl9fIg4KCDggZGVncmVlEAIYAw&lqi=Cgg4IGRlZ3JlZUj_t8y757KAgAhaEhAAEAEYABgBIgg4IGRlZ3JlZZIBEnJlYWxfZXN0YXRlX2FnZW50cw&fvr=1&cs=0&um=1&ie=UTF-8&fb=1&gl=id&sa=X&ftid=0x2dd239c01f2dfe25:0x7e7d44b637752e71"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-2 text-sm font-light leading-relaxed text-primary-foreground/80 transition-colors hover:text-primary-foreground md:justify-self-start"
            aria-label="Open 8 Degree location on Google Maps"
          >
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>Teratai S18, Jl. Kayu Tulang, Canggu, Kec. Kuta Utara, Kabupaten Badung, Bali 80361</span>
          </a>

          <div className="flex flex-col items-center gap-3 md:justify-self-center">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/90">Connect with us</h4>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://www.instagram.com/8degree.co/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"><Instagram size={20} /></a>
              <a href="https://www.facebook.com/p/8-Degree-Real-Estate-61551808627078/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"><Facebook size={20} /></a>
              <a href="https://id.linkedin.com/company/8degreerealestate" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"><Linkedin size={20} /></a>
              <a
                href={buildWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@8Degreeco" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"><Youtube size={20} /></a>
              <a href="https://id.pinterest.com/8degree/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"><PinterestIcon className="h-5 w-5" /></a>
              <a href="https://www.xiaohongshu.com/user/profile/6534ab3c000000000d004713?xsec_token=YBZyIeFu1RtijpXgo6036NerpTZnmTrzUQjllOXl6vuT4=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=ODs1NERHN0w2NzUyOTgwNjZHOTc4PDc8&apptime=1776071179&share_id=49d038ccb54b43fe98e041414e7af137&tab=note" target="_blank" rel="noopener noreferrer" aria-label="Rednote" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"><RednoteIcon className="h-5 w-5" /></a>
              <a href="https://www.tiktok.com/@8degree.co" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"><TiktokIcon className="h-5 w-5" /></a>
            </div>
          </div>

          <p className="text-left md:justify-self-end md:pt-0.5 md:text-right">{t.rights}</p>

        </div>
      </div>
    </footer>
  );
}
