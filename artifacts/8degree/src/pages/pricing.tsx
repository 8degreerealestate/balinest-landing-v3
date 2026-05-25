import { motion } from "framer-motion";
import { useListProjects, useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Seo } from "@/components/site/Seo";
import { truncateForMeta } from "@/lib/site-seo";
import { type SiteLanguage, useSiteLanguage } from "@/lib/site-language";

export default function Pricing() {
  const language = useSiteLanguage();
  const t: Record<SiteLanguage, Record<string, string>> = {
    en: { eyebrow: "Request Pricing", title: "Get Full Pricing Details", subtitle: "We share detailed pricing, payment plans, and availability directly with qualified investors. Complete the form and our team will be in touch within 24 hours.", fullName: "Full Name *", email: "Email Address *", phone: "Phone / WhatsApp", country: "Country", selectDev: "Select a development (optional)", budget: "Investment Budget", message: "Any specific questions about pricing, payment plans, or availability...", request: "Request Pricing", sending: "Sending...", note: "We respond to every pricing enquiry within one business day." },
    id: { eyebrow: "Minta Harga", title: "Dapatkan Detail Harga Lengkap", subtitle: "Kami membagikan detail harga, skema pembayaran, dan ketersediaan kepada investor yang memenuhi syarat.", fullName: "Nama Lengkap *", email: "Alamat Email *", phone: "Telepon / WhatsApp", country: "Negara", selectDev: "Pilih pengembangan (opsional)", budget: "Anggaran Investasi", message: "Pertanyaan terkait harga, skema pembayaran, atau ketersediaan...", request: "Minta Harga", sending: "Mengirim...", note: "Kami merespons setiap permintaan harga dalam satu hari kerja." },
    fr: { eyebrow: "Demande de Prix", title: "Obtenir les Details de Prix", subtitle: "Nous partageons les prix, plans de paiement et disponibilites avec les investisseurs qualifies.", fullName: "Nom complet *", email: "Adresse e-mail *", phone: "Telephone / WhatsApp", country: "Pays", selectDev: "Selectionner un projet (optionnel)", budget: "Budget d'Investissement", message: "Questions sur les prix, paiements ou disponibilites...", request: "Demander le Prix", sending: "Envoi...", note: "Nous repondons a chaque demande sous un jour ouvrable." },
    zh: { eyebrow: "申请报价", title: "获取完整价格详情", subtitle: "我们将向合格投资者提供价格、付款方案和库存信息。", fullName: "姓名 *", email: "邮箱地址 *", phone: "电话 / WhatsApp", country: "国家", selectDev: "选择项目（可选）", budget: "投资预算", message: "关于价格、付款计划或库存的具体问题...", request: "申请报价", sending: "发送中...", note: "我们会在一个工作日内回复您的报价请求。" },
    tr: { eyebrow: "Fiyat Talebi", title: "Tum Fiyat Detaylarini Alin", subtitle: "Nitelikli yatirimcilar icin fiyat, odeme plani ve uygunluk bilgisini paylasiyoruz.", fullName: "Ad Soyad *", email: "E-posta *", phone: "Telefon / WhatsApp", country: "Ulke", selectDev: "Proje secin (opsiyonel)", budget: "Yatirim Butcesi", message: "Fiyat, odeme plani veya uygunluk hakkinda sorular...", request: "Fiyat Talep Et", sending: "Gonderiliyor...", note: "Her fiyat talebine bir is gunu icinde donuyoruz." },
  }[language];
  const { data } = useListProjects({ status: "ongoing", limit: 10 });
  const projects = data?.projects ?? [];
  const createEnquiry = useCreateEnquiry();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: { name: "", email: "", phone: "", country: "", budgetRange: "", projectId: "", message: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createEnquiry.mutateAsync({
        data: {
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          country: values.country || null,
          budgetRange: values.budgetRange || null,
          message: values.message || null,
          interestedProjectId: values.projectId ? Number(values.projectId) : null,
          source: "pricing_page",
        },
      });
      toast({ title: "Request received", description: "Our team will send you full pricing details within 24 hours." });
      form.reset();
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Request pricing · Bali developments"
        description={truncateForMeta(
          "Request indicative pricing and availability for ongoing Bali developments in the 8 Degree portfolio.",
        )}
        path="/pricing"
      />
      <div className="bg-foreground text-background pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.3em] uppercase text-primary mb-4"
          >
            {t.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl leading-tight mb-6"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-background/70 max-w-xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-6 py-16">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              placeholder={t.fullName}
              {...form.register("name", { required: true })}
              className="rounded-none"
              data-testid="input-name"
            />
            <Input
              placeholder={t.email}
              type="email"
              {...form.register("email", { required: true })}
              className="rounded-none"
              data-testid="input-email"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              placeholder={t.phone}
              {...form.register("phone")}
              className="rounded-none"
              data-testid="input-phone"
            />
            <Input
              placeholder={t.country}
              {...form.register("country")}
              className="rounded-none"
              data-testid="input-country"
            />
          </div>
          <Select onValueChange={(v) => form.setValue("projectId", v)}>
            <SelectTrigger className="rounded-none" data-testid="select-project">
              <SelectValue placeholder={t.selectDev} />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => form.setValue("budgetRange", v)}>
            <SelectTrigger className="rounded-none" data-testid="select-budget">
              <SelectValue placeholder={t.budget} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Under $300,000">Under $300,000</SelectItem>
              <SelectItem value="$300,000 - $500,000">$300,000 – $500,000</SelectItem>
              <SelectItem value="$500,000 - $750,000">$500,000 – $750,000</SelectItem>
              <SelectItem value="$750,000 - $1,000,000">$750,000 – $1M</SelectItem>
              <SelectItem value="Over $1,000,000">Over $1M</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t.message}
            {...form.register("message")}
            className="rounded-none resize-none h-32"
            data-testid="textarea-message"
          />
          <Button
            type="submit"
            className="w-full rounded-none tracking-widest uppercase h-12"
            disabled={createEnquiry.isPending}
            data-testid="button-submit"
          >
            {createEnquiry.isPending ? t.sending : t.request}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {t.note}
          </p>
        </form>
      </div>
    </div>
  );
}
