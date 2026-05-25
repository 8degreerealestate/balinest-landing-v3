import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";

export default function NotFound() {
  const language = useSiteLanguage();
  const bundle = {
    en: { title: "Page not found", desc: "This page does not exist.", heading: "404 Page Not Found", body: "The page you are looking for does not exist." },
    id: { title: "Halaman tidak ditemukan", desc: "Halaman ini tidak tersedia.", heading: "404 Halaman Tidak Ditemukan", body: "Halaman yang Anda cari tidak tersedia." },
    fr: { title: "Page introuvable", desc: "Cette page n'existe pas.", heading: "404 Page Introuvable", body: "La page que vous recherchez n'existe pas." },
    zh: { title: "页面未找到", desc: "该页面不存在。", heading: "404 页面未找到", body: "您访问的页面不存在。" },
    tr: { title: "Sayfa bulunamadi", desc: "Bu sayfa mevcut degil.", heading: "404 Sayfa Bulunamadi", body: "Aradiginiz sayfa mevcut degil." },
  } satisfies Record<SiteLanguage, { title: string; desc: string; heading: string; body: string }>;
  const t = bundle[language] ?? bundle.en;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Seo title={t.title} description={t.desc} noindex />
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{t.heading}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {t.body}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
