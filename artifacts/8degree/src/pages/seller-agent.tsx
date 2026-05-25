import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicatorPrimitive,
  SelectItemPrimitive,
  SelectItemTextPrimitive,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { buildInternationalPhone, PHONE_COUNTRIES, PHONE_SELECT_ITEM_CLASS } from "@/lib/phone-countries";
import { SITE_MEDIA } from "@/lib/site-assets";
import { truncateForMeta } from "@/lib/site-seo";
import { cn } from "@/lib/utils";
import { useSiteCopy } from "@/lib/site-language";
import { COMMON_COPY } from "@/lib/i18n/common";
import { SELLER_AGENT_COPY, type SellerAgentCopy } from "@/lib/i18n/seller-agent";

function FallbackImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <img
      src={useFallback ? SITE_MEDIA.heroStill : src}
      alt={alt}
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#01514E]";
const CONTROL =
  "rounded-lg border border-[#1f1d1b]/18 bg-white text-[#1c1917] shadow-sm placeholder:text-[#1c1917]/40 focus-visible:border-[#01514E] focus-visible:ring-1 focus-visible:ring-[#01514E]/25";

const PROPERTY_TYPES = ["Villa", "Apartment", "Land"] as const;
const PROPERTY_CATEGORIES = ["Leasehold", "Freehold"] as const;
const PERMITS_OPTIONS = ["Yes", "In process", "No"] as const;

function SellerPartnershipForm({ formCopy }: { formCopy: SellerAgentCopy["form"] }) {
  const common = useSiteCopy(COMMON_COPY);
  const { toast } = useToast();
  const createEnquiry = useCreateEnquiry();
  const [phoneCountryId, setPhoneCountryId] = useState<string>("id");
  const [phoneNational, setPhoneNational] = useState("");

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      country: "",
      propertyType: "",
      propertyCategory: "",
      permitsStatus: "",
      webSocial: "",
      message: "",
    },
  });

  const selectedCountry = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.id === phoneCountryId) ?? PHONE_COUNTRIES[0],
    [phoneCountryId],
  );

  const phonePlaceholder = useMemo(() => {
    if (phoneCountryId === "other") return "+1 234 567 8900";
    if (phoneCountryId === "id") return "0812-345-678";
    if (phoneCountryId === "au") return "0412-345-678";
    return "412 345 678";
  }, [phoneCountryId]);

  const onSubmit = form.handleSubmit(async (values) => {
    const dial = PHONE_COUNTRIES.find((c) => c.id === phoneCountryId)?.dial ?? "+62";
    const fullPhone = buildInternationalPhone(dial, phoneNational);
    const phoneDigits = fullPhone.replace(/\D/g, "");
    if (phoneDigits.length < 8) {
      toast({
        title: common.invalidPhoneTitle,
        description: common.invalidPhoneDesc,
        variant: "destructive",
      });
      return;
    }

    const lines = [
      `Property type: ${values.propertyType || "—"}`,
      `Property category: ${values.propertyCategory || "—"}`,
      `IMB/PBG and legal permits: ${values.permitsStatus || "—"}`,
      `Website / Instagram: ${values.webSocial.trim() || "—"}`,
    ];
    const body = values.message.trim();
    const composedMessage = body ? `${lines.join("\n")}\n\n${body}` : lines.join("\n");

    try {
      await createEnquiry.mutateAsync({
        data: {
          name: values.fullName.trim(),
          email: values.email.trim(),
          phone: fullPhone || null,
          country: values.country.trim() || null,
          budgetRange: null,
          message: composedMessage || null,
          source: "seller_agent_partnership",
        },
      });
      toast({
        title: common.enquirySentTitle,
        description: common.enquirySentDesc,
      });
      form.reset();
      setPhoneCountryId("id");
      setPhoneNational("");
    } catch {
      toast({ title: common.enquiryFailedTitle, description: common.enquiryFailedDesc, variant: "destructive" });
    }
  });

  const field = "space-y-1.5";
  const controlH = `h-11 ${CONTROL}`;

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-3.5"
    >
      <div className={field}>
        <Label htmlFor="seller-full-name" className={LABEL}>
          {formCopy.fullName} <span className="text-[#01514E]">*</span>
        </Label>
        <Input
          id="seller-full-name"
          autoComplete="name"
          className={controlH}
          placeholder={formCopy.fullNamePh}
          {...form.register("fullName", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="seller-country" className={LABEL}>
          {formCopy.country}
        </Label>
        <Input
          id="seller-country"
          autoComplete="country-name"
          className={controlH}
          placeholder={formCopy.countryPh}
          {...form.register("country")}
        />
      </div>

      <div className={field}>
        <Label htmlFor="seller-email" className={LABEL}>
          {formCopy.email} <span className="text-[#01514E]">*</span>
        </Label>
        <Input
          id="seller-email"
          type="email"
          autoComplete="email"
          className={controlH}
          placeholder={formCopy.emailPh}
          {...form.register("email", { required: true })}
        />
      </div>

      <div className={field}>
        <Label htmlFor="seller-phone" id="seller-phone-label" className={LABEL}>
          {formCopy.phone}
          <span className="ml-1 inline-block translate-y-[-1px] text-[0.45rem] leading-none text-[#01514E]">◆</span>
        </Label>
        <div
          role="group"
          aria-labelledby="seller-phone-label"
          className={cn(
            "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-[#1f1d1b]/18 bg-white shadow-sm",
            "focus-within:border-[#01514E] focus-within:ring-1 focus-within:ring-[#01514E]/25",
          )}
        >
          <Select value={phoneCountryId} onValueChange={setPhoneCountryId}>
            <SelectTrigger
              aria-label={`Country code, ${selectedCountry.label}`}
              className={cn(
                "h-11 min-h-11 w-[3.5rem] max-w-[3.5rem] shrink-0 rounded-none border-0 bg-transparent px-1.5 py-0 shadow-none",
                "justify-between gap-0.5 focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-[#f4f1ea]/80",
                "[&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:shrink-0 [&_svg]:text-[#1c1917]/45",
                "[&>span]:text-[1.0625rem] [&>span]:leading-none",
              )}
            >
              <SelectValue placeholder="🌐" />
            </SelectTrigger>
            <SelectContent className="z-[60] max-h-60 min-w-[min(100vw-2rem,18rem)]">
              {PHONE_COUNTRIES.map((c) => (
                <SelectItemPrimitive
                  key={c.id}
                  value={c.id}
                  textValue={c.label}
                  title={c.label}
                  className={cn(PHONE_SELECT_ITEM_CLASS, "font-normal")}
                >
                  <SelectItemTextPrimitive className="inline-flex shrink-0 items-center text-[1.125rem] leading-none">
                    {c.flag}
                  </SelectItemTextPrimitive>
                  <span className="min-w-0 flex-1 truncate text-left text-sm text-[#1c1917]">{c.countryName}</span>
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectItemIndicatorPrimitive>
                      <Check className="h-4 w-4" />
                    </SelectItemIndicatorPrimitive>
                  </span>
                </SelectItemPrimitive>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px shrink-0 self-stretch bg-[#1f1d1b]/18" aria-hidden />
          <Input
            id="seller-phone"
            type="tel"
            inputMode="tel"
            value={phoneNational}
            onChange={(e) => setPhoneNational(e.target.value)}
            placeholder={phonePlaceholder}
            autoComplete={phoneCountryId === "other" ? "tel" : "tel-national"}
            className={cn(
              "h-11 min-h-0 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-0 text-sm font-normal text-[#1c1917] shadow-none",
              "placeholder:text-[#1c1917]/40 focus-visible:ring-0 focus-visible:ring-offset-0",
            )}
          />
        </div>
      </div>

      <div className={field}>
        <Label className={LABEL}>{formCopy.propertyType}</Label>
        <Select onValueChange={(v) => form.setValue("propertyType", v)} value={form.watch("propertyType") || undefined}>
          <SelectTrigger className={controlH}>
            <SelectValue placeholder={common.selectType} />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === "Villa" ? formCopy.villa : opt === "Apartment" ? formCopy.apartment : formCopy.land}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={field}>
        <Label className={LABEL}>{formCopy.propertyCategory}</Label>
        <Select
          onValueChange={(v) => form.setValue("propertyCategory", v)}
          value={form.watch("propertyCategory") || undefined}
        >
          <SelectTrigger className={controlH}>
            <SelectValue placeholder={common.selectCategory} />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_CATEGORIES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === "Leasehold" ? formCopy.leasehold : formCopy.freehold}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={field}>
        <Label className={`${LABEL} max-w-none leading-snug`}>{formCopy.permitsQ}</Label>
        <Select onValueChange={(v) => form.setValue("permitsStatus", v)} value={form.watch("permitsStatus") || undefined}>
          <SelectTrigger className={controlH}>
            <SelectValue placeholder={common.selectStatus} />
          </SelectTrigger>
          <SelectContent>
            {PERMITS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === "Yes" ? formCopy.permitsYes : opt === "In process" ? formCopy.permitsInProcess : formCopy.permitsNo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={field}>
        <Label htmlFor="seller-web-social" className={LABEL}>
          {formCopy.webSocial}
        </Label>
        <Input
          id="seller-web-social"
          type="text"
          className={controlH}
          placeholder={formCopy.webSocialPh}
          {...form.register("webSocial")}
        />
      </div>

      <div className={`${field} md:col-span-2`}>
        <Label htmlFor="seller-message" className={LABEL}>
          {formCopy.message}
        </Label>
        <Textarea
          id="seller-message"
          rows={3}
          className={`min-h-[96px] resize-y py-2.5 ${CONTROL}`}
          placeholder={formCopy.messagePh}
          {...form.register("message")}
        />
      </div>

      <div className="flex flex-col items-stretch gap-3 border-t border-[#01514E]/10 pt-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
        <p className="text-[11px] font-light leading-relaxed text-[#1c1917]/55 sm:max-w-md">{formCopy.consent}</p>
        <Button
          type="submit"
          disabled={createEnquiry.isPending}
          className="h-11 shrink-0 rounded-lg bg-[#01514E] px-8 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#013d3a] disabled:opacity-60"
        >
          {createEnquiry.isPending ? formCopy.submitting : formCopy.submit}
        </Button>
      </div>
    </form>
  );
}

export default function SellerAgentPage() {
  const t = useSiteCopy(SELLER_AGENT_COPY);

  return (
    <div className="min-h-screen bg-[#f4f1ea] font-sans text-[#0a2f2c] antialiased">
      <Seo title={t.seoTitle} description={truncateForMeta(t.seoDescription)} path="/seller-agents" />

      {/* Hero */}
      <section className="relative min-h-[min(70dvh,640px)] w-full overflow-hidden">
        <FallbackImage
          src={SITE_MEDIA.sellerAgentHero}
          alt="Open-plan living and kitchen with warm wood tones and natural light"
          className="hero-image-breathe absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25" />
        <div className="relative z-10 flex min-h-[min(70dvh,640px)] flex-col justify-end px-6 pb-14 pt-28 md:px-12 md:pb-20">
          <div className="container mx-auto max-w-6xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl font-serif text-3xl font-bold uppercase leading-[1.12] tracking-[0.06em] text-white md:text-5xl lg:text-[3rem]"
            >
              <span className="block">{t.heroLine1}</span>
              <span className="mt-1 block md:mt-1.5">{t.heroLine2}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/90 md:text-base"
            >
              {t.heroSub}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Partnership intro + pillars */}
      <section className="bg-[#F9F9F7] px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="mx-auto max-w-4xl text-center text-base font-light leading-relaxed text-[#1c1917]/88 md:text-lg">
              {t.intro}
            </p>
          </motion.div>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10 lg:gap-12">
            {t.pillars.map((col, i) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#01514E] md:text-sm">
                  {col.title}
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-[#1c1917]/85 md:text-base">{col.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership application */}
      <section id="apply" className="scroll-mt-24 bg-[#f4f1ea] px-6 py-10 md:px-12 md:py-14">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#01514E]">{t.applyLabel}</p>
            <h2 className="mt-2 font-serif text-2xl font-bold uppercase leading-tight tracking-[0.05em] text-[#01514E] md:text-3xl">
              {t.applyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-light leading-relaxed text-[#1c1917]/75 md:text-base">
              {t.applySub}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-[#01514E]/12 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(1,81,78,0.16)] md:p-6"
          >
            <SellerPartnershipForm formCopy={t.form} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
